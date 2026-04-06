import User from "../models/User.js"
import CommerceType from "../models/CommerceType.js"
import { sendEmail } from "../services/EmailServices.js";
import bcrypt from "bcrypt";
import { promisify } from "util";
import { randomBytes } from "crypto";
import homeRouteByRole from "../utils/RedirectByRole.js";
import path from "path";
import UserRoles from "../models/enums/userRoles.js";

export function GetLogin(req, res) {
  res.render("auth/login", {
    "page-title": "Login",
    layout: "anonymous-layout",
  });
}

export async function PostLogin(req, res) {
  const { Email, Password } = req.body;

  try {
    const user = await User.findOne({ email: Email });

    if (!user) {
      req.flash("errors", "No user found with this email.");
      return res.redirect("/");
    }

    if (!user.isActive) {
      req.flash(
        "errors",
        "Your account is not active. Please check your email for activation instructions."
      );
      return res.redirect("/");
    }

    const isPasswordValid = await bcrypt.compare(Password, user.password);
    if (!isPasswordValid) {
      req.flash("errors", "Invalid password.");
      return res.redirect("/");
    }

    req.session.isAuthenticated = true;
    req.session.user = {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role,
      commerceName: user.commerceName,
      commerceLogo: user.commerceLogo,
      isBusy: user.isBusy,
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        req.flash("errors", "An error occurred while logging in.");
        return res.redirect("/");
      }

      return res.redirect(homeRouteByRole(user));
    });


  } catch (err) {
    console.error(err);
    req.flash("errors", "An error occurred while logging in.");
    return res.redirect("/");
  }
}

export function Logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      req.flash("errors", "An error occurred while logging out.");
      return res.redirect();
    }
    res.redirect("/");
  });
}

export function GetRegisterSelectRole(req, res) {
  res.render("auth/register-select", {
    "page-title": "Register user",
    layout: "anonymous-layout",
  });
}

export function GetRegisterForClientsAndDeliverys(req, res) {
  res.render("auth/register-client-or-delivery", {
    "page-title": "Register Client or Delivery",
    layout: "anonymous-layout",
  });
}

export async function GetRegisterForCommerces(req, res) {
  const commerceTypes = await CommerceType.find().lean();
  res.render("auth/register-commerce", {
    "page-title": "Register Commerce",
    commerceTypes: commerceTypes,
    layout: "anonymous-layout",
  });
}

export async function PostRegisterClientOrDelivery(req, res) {
  const {
    firstName,
    lastName,
    phone,
    email,
    username,
    role,
    password,
    confirmPassword,
  } = req.body;

  const profilePicture = req.file;
  const profilePicturePath = "\\" + path.relative("public", profilePicture.path); // Get the relative path of the uploaded file

  try {
    if (password !== confirmPassword) {
      req.flash("errors", "Passwords do not match.");
      return res.redirect("/user/register-user");
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      req.flash("errors", "A user already exists with this email.");
      return res.redirect("/user/register-user");
    }

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      req.flash("errors", "Username already exists.");
      return res.redirect("/user/register-user");
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
      subject: "Welcome to AppCenar",
      html: `
        <p>Dear ${firstName},</p>
        <p>Thank you for registering.</p>
        <p>Please click the link below to activate your account:</p>
        <p>
          <a href="${process.env.APP_URL}/user/activate/${token}">
            Activate Account
          </a>
        </p>
      `,
    });

    req.flash(
      "success",
      "User registered successfully. Please check your email to activate your account."
    );

    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("errors", "An error occurred while registering the user.");
    return res.redirect("/user/register-user");
  }
}


export async function PostRegisterCommerce(req, res) {
  const {
    commerceName,
    phone,
    email,
    openTime,
    closeTime, 
    commerceTypeId, 
    password,
    confirmPassword,
  } = req.body;

  const logo = req.file;

  if (!logo) {
    req.flash("errors", "Please upload a commerce logo.");
    return res.redirect("/user/register-commerce");
  }

  const logoPath = "\\" + path.relative("public", logo.path);

  try {
    if (password !== confirmPassword) {
      req.flash("errors", "Passwords do not match.");
      return res.redirect("/user/register-commerce");
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      req.flash("errors", "A user already exists with this email.");
      return res.redirect("/user/register-commerce");
    }

    const existingCommerce = await User.findOne({ commerceName });
    if (existingCommerce) {
      req.flash("errors", "A commerce already exists with this name.");
      return res.redirect("/user/register-commerce");
    }

    const buffer = await promisify(randomBytes)(32);
    const token = buffer.toString("hex");

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      commerceName,
      phone,
      email,
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
      subject: "Welcome to AppCenar",
      html: `
        <p>Dear ${commerceName},</p>
        <p>Thank you for registering your commerce.</p>
        <p>Please click the link below to activate your account:</p>
        <p><a href="${process.env.APP_URL}/user/activate/${token}">Activate Account</a></p>
      `,
    });

    req.flash(
      "success",
      "Commerce registered successfully. Please check your email to activate your account."
    );

    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("errors", "An error occurred while registering the commerce.");
    return res.redirect("/user/register-commerce");
  }
}


export async function GetActivate(req, res) {
  const { token } = req.params;

  if (!token) {
    req.flash("errors", "Invalid activation token.");
    return res.redirect("/");
  }

  try {
    const user = await User.findOne({ ActivateToken: token });

    if (!user) {
      req.flash("errors", "Invalid activation token.");
      return res.redirect("/");
    }

    user.isActive = true;
    user.ActivateToken = null;
    await user.save();

    req.flash("success", "Account activated successfully. You can now log in.");
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("errors", "An error occurred while activating your account.");
    return res.redirect("/");
  }
}

export function GetForgot(req, res) {
  res.render("auth/forgot", {
    "page-title": "Forgot password",
    layout: "anonymous-layout",
  });
}

export async function PostForgot(req, res) {
  const { Email } = req.body;

  try {
    const randomBytesAsync = promisify(randomBytes);
    const buffer = await randomBytesAsync(32);
    const token = buffer.toString("hex");

    const user = await User.findOne({ email: Email });

    if (!user) {
      req.flash("errors", "No user found with this email.");
      return res.redirect("/user/forgot");
    }

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hora
    const result = await user.save();

    if (!result) {
      req.flash("errors", "An error occurred while saving the reset token.");
      return res.redirect("/user/forgot");
    }

    await sendEmail({
      to: Email,
      subject: "Password Reset Request",
      html: `<p>Dear ${user.name},</p>
             <p>You requested a password reset. Please click the link below to reset your password:</p>
             <p><a href="${process.env.APP_URL}/user/reset/${token}">Reset Password</a></p>
             <p>If you did not request this, please ignore this email.</p>`,
    });

    req.flash("success", "Password reset link sent to your email.");
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("errors", "An error occurred while processing your request.");
    return res.redirect("/user/forgot");
  }
}

export async function GetReset(req, res) {
  const { token } = req.params;

  if (!token) {
    req.flash("errors", "Invalid or expired token.");
    return res.redirect("/user/forgot");
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gte: Date.now() },
    });

    if (!user) {
      req.flash("errors", "Invalid or expired token.");
      return res.redirect("/user/forgot");
    }

    res.render("auth/reset", {
      "page-title": "Reset password",
      layout: "anonymous-layout",
      passwordToken: token,
      userId: user._id.toString(),
    });
  } catch (err) {
    console.error(err);
    req.flash("errors", "An error occurred while processing your request.");
    return res.redirect("/user/forgot");
  }
}

export async function PostReset(req, res) {
  const { PasswordToken, UserId, Password, ConfirmPassword } = req.body;

  if (Password !== ConfirmPassword) {
    req.flash("errors", "Passwords do not match.");
    return res.redirect(`/user/reset/${PasswordToken}`);
  }

  try {
    const user = await User.findOne({
      _id: UserId,
      resetToken: PasswordToken,
      resetTokenExpiration: { $gte: Date.now() },
    });

    if (!user) {
      req.flash("errors", "Invalid or expired token.");
      return res.redirect("/user/forgot");
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    req.flash("success", "Password reset successfully. You can now log in.");
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("errors", "An error occurred while resetting your password.");
    return res.redirect("/user/forgot");
  }
}