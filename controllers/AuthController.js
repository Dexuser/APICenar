import User from "../models/User.js"
import CommerceType from "../models/CommerceType.js"
import { sendEmail } from "../services/EmailServices.js";
import bcrypt from "bcrypt";
import { promisify } from "util";
import { randomBytes } from "crypto";
import path from "path";
import UserRoles from "../models/enums/userRoles.js";
import jwt from "jsonwebtoken";

const signJwt = (payload, opts = {}) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    ...opts, //
  });

  return token;
};

export async function Login(req, res, next) {
  const { emailOrUsername, password } = req.body;

  try {

    let user;
    user = await User.findOne({ email: emailOrUsername });

    if (!user) {
      user = await User.findOne({ username: emailOrUsername });
    }

    if (!user) {
      const error = new Error("No user found with this email or username.");
      error.statusCode = 401; // Unauthorized
      error.data = { emailOrUsername: emailOrUsername };
      throw error;
    }

    if (!user.isActive) {
      const error = new Error("User account is not active.");
      error.statusCode = 403; // Forbidden
      error.data = { emailOrUsername: emailOrUsername };
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid password.");
      error.statusCode = 401; // Unauthorized
      error.data = { emailOrUsername: emailOrUsername };
      throw error;
    }

    const token = signJwt(
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        sub: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      }
    );

    res.status(200).json({ message: "Login successful", data: token });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; // Internal Server Error
    }
    next(err);
  }
}

export function Register(role) {
  return async (req, res, next) => {

    const {
      firstName,
      lastName,
      phone,
      email,
      username,
      password,
      confirmPassword,
    } = req.body;

    const profilePicture = req.file;
    const profilePicturePath = "\\" + path.relative("public", profilePicture.path);


    try {
      if (password !== confirmPassword) {
        const error = new Error("Passwords do not match.");
        error.statusCode = 400; // Bad Request
        error.data = { email: email };
        throw error;
      }

      const existing = await User.findOne({ email: email });
      if (existing) {
        const error = new Error("User already exists with this email.");
        error.statusCode = 409; // Conflict
        error.data = { email: email };
        throw error;
      }

      const existingUserName = await User.findOne({ username: username });
      if (existingUserName) {
        const error = new Error("User already exists with this username.");
        error.statusCode = 409; // conflict
        error.data = { username: username };
        throw error;
      }

      const randomBytesAsync = promisify(randomBytes);
      const buffer = await randomBytesAsync(32);
      const token = buffer.toString("hex");

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        firstName,
        lastName,
        username,
        phone,
        email,
        password: hashedPassword,
        profilePicture: profilePicturePath,
        role,
        isActive: false,
        ActivateToken: token,
      });

      await sendEmail({
        to: email,
        subject: "Welcome to API cenar!",
        html: `<p>Dear ${firstName} ${lastName},</p>
             <p>Thank you for registering. Please use the following token to activate your account:</p>
             <p>${token}</p>
             <p>If you did not register, please ignore this email.</p>`,
      });

      res.status(201).json({
        message:
          "User registered successfully. Please check your email to activate your account.",
        data: { email },
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500; // Internal Server Error
      }
      next(err);
    }

  }
}

export async function RegisterCommerce(req, res, next) {

  const {
    commerceName,
    description,
    username,
    phone,
    email,
    openTime,
    closeTime,
    commerceTypeId,
    password,
    confirmPassword,
  } = req.body;

  const logo = req.file;
  const logoPath = "\\" + path.relative("public", logo.path);


  try {
    if (password !== confirmPassword) {
      const error = new Error("Passwords do not match.");
      error.statusCode = 400; // Bad Request
      error.data = { email: email };
      throw error;
    }

    const existing = await User.findOne({ email: email });
    if (existing) {
      const error = new Error("User already exists with this email.");
      error.statusCode = 409; // Conflict
      error.data = { email: email };
      throw error;
    }

    const existingUserName = await User.findOne({ username: username });
    if (existingUserName) {
      const error = new Error("User already exists with this username.");
      error.statusCode = 409; // conflict
      error.data = { username: username };
      throw error;
    }

    const commerceType = await CommerceType.findById(commerceTypeId);
    if (!commerceType) {
      const error = new Error("Commerce type not found.");
      error.statusCode = 404; // Not Found
      error.data = { commerceTypeId: commerceTypeId };
      throw error;
    }

    const randomBytesAsync = promisify(randomBytes);
    const buffer = await randomBytesAsync(32);
    const token = buffer.toString("hex");

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      commerceName,
      description,
      phone,
      email,
      username,
      password: hashedPassword,
      commerceLogo: logoPath,
      openTime,
      closeTime,
      commerceTypeId,
      role: UserRoles.COMMERCE,
      isActive: false,
      ActivateToken: token,
    });

    await sendEmail({
      to: email,
      subject: "Welcome to API cenar!",
      html: `<p>Dear ${commerceName},</p>
             <p>Thank you for registering. Please use the following token to activate your account:</p>
             <p>${token}</p>
             <p>If you did not register, please ignore this email.</p>`,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to activate your account.",
      data: { email },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; // Internal Server Error
    }
    next(err);
  }

}

export async function ActivateUser(req, res, next) {
  const { token } = req.body;

  if (!token) {
    const error = new Error("Invalid activation token.");
    error.statusCode = 400; // Bad Request
    throw error;
  }

  try {
    const user = await User.findOne({ ActivateToken: token });

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404; // Not Found
      throw error;
    }

    user.isActive = true;
    user.ActivateToken = null;
    await user.save();

    res
      .status(200)
      .json({ message: "Account activated successfully. You can now log in." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; // Internal Server Error
    }
    next(err);
  }
}

export async function ForgotPassword(req, res, next) {
  const { emailOrUsername } = req.body;

  try {
    const randomBytesAsync = promisify(randomBytes);
    const buffer = await randomBytesAsync(32);
    const token = buffer.toString("hex");

    let user; 
    user = await User.findOne({ email: emailOrUsername });

    if (!user) {
      user = await User.findOne({ username: emailOrUsername });
    }

    if (!user) {
      const error = new Error("No user found with this email or username.");
      error.statusCode = 404; // Not Found
      throw error;
    }

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hora
    const result = await user.save();

    if (!result) {
      const error = new Error("Failed to save reset token.");
      error.statusCode = 500; // Internal Server Error
      throw error;
    }

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Dear ${user.firstName} ${user.lastName},</p>
             <p>You requested a password reset. Please use this token to reset your password:</p>
             <p>${token}</p>
             <p>If you did not request this, please ignore this email.</p>`,
    });

    res
      .status(200)
      .json({ message: "Password reset token sent to your email." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; // Internal Server Error
    }
    next(err);
  }
}



export async function ResetPassword(req, res, next) {
  const { token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    const error = new Error("Passwords do not match.");
    error.statusCode = 400; // Bad Request
    throw error;
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gte: Date.now() },
    });

    if (!user) {
      const error = new Error("Invalid or expired token.");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successfully. You can now log in." });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; // Internal Server Error
    }
    next(err);
  }
}