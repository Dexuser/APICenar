import bcrypt from "bcrypt";
import path from "path";
import { promisify } from "util";
import { randomBytes } from "crypto";
import User from "../../models/User.js";
import CommerceType from "../../models/CommerceType.js";
import UserRoles from "../../models/enums/userRoles.js";
import { sendEmail } from "../../services/EmailServices.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";
import {
  getTokenExpirationDate,
  signAccessToken,
} from "../../utils/jwt.js";

const randomBytesAsync = promisify(randomBytes);

function toPublicFilePath(file) {
  if (!file) {
    return null;
  }

  return `\\${path.relative("public", file.path)}`.replaceAll("\\\\", "\\");
}

function buildUserPayload(user) {
  return {
    id: user._id.toString(),
    userName: user.username,
    email: user.email,
    role: user.role,
  };
}

async function ensureUniqueUserNameAndEmail(userName, email) {
  const existingUserName = await User.findOne({ username: userName });

  if (existingUserName) {
    return {
      statusCode: 409,
      message: "userName already exists.",
    };
  }

  const existingEmail = await User.findOne({ email: email.toLowerCase() });

  if (existingEmail) {
    return {
      statusCode: 409,
      message: "email already exists.",
    };
  }

  return null;
}

async function generateTokenData() {
  const token = (await randomBytesAsync(32)).toString("hex");
  const expiration = new Date(Date.now() + 1000 * 60 * 60 * 24);

  return { token, expiration };
}

async function sendActivationEmail(user) {
  if (!process.env.EMAIL_USER || !process.env.APP_URL) {
    return;
  }

  await sendEmail({
    to: user.email,
    subject: "ApiCenar account confirmation",
    html: `
      <p>Hello ${user.username || user.firstName || user.commerceName},</p>
      <p>Your activation token is:</p>
      <p><strong>${user.ActivateToken}</strong></p>
      <p>You can also confirm your account from this URL:</p>
      <p>${process.env.APP_URL}/api/auth/confirm-email</p>
    `,
  });
}

async function sendResetEmail(user) {
  if (!process.env.EMAIL_USER || !process.env.APP_URL) {
    return;
  }

  await sendEmail({
    to: user.email,
    subject: "ApiCenar password reset",
    html: `
      <p>Hello ${user.username || user.firstName || user.commerceName},</p>
      <p>Your password reset token is:</p>
      <p><strong>${user.resetToken}</strong></p>
    `,
  });
}

export async function login(req, res) {
  const { userNameOrEmail, password } = req.body;

  const user = await User.findOne({
    $or: [
      { email: userNameOrEmail.toLowerCase() },
      { username: userNameOrEmail },
    ],
  });

  if (!user) {
    return sendError(res, 401, "Invalid credentials.");
  }

  if (!user.isActive) {
    return sendError(res, 401, "Account is inactive.");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return sendError(res, 401, "Invalid credentials.");
  }

  const token = signAccessToken(user);

  return sendSuccess(res, 200, {
    token,
    expiresAt: getTokenExpirationDate(token)?.toISOString() || null,
    user: buildUserPayload(user),
  });
}

export async function registerClient(req, res) {
  if (!req.file) {
    return sendError(res, 400, "profileImage is required.");
  }

  const conflict = await ensureUniqueUserNameAndEmail(
    req.body.userName,
    req.body.email
  );

  if (conflict) {
    return sendError(res, conflict.statusCode, conflict.message);
  }

  const { token, expiration } = await generateTokenData();

  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.userName,
    email: req.body.email.toLowerCase(),
    password: await bcrypt.hash(req.body.password, 10),
    phone: req.body.phone,
    profilePicture: toPublicFilePath(req.file),
    role: UserRoles.CLIENT,
    isActive: false,
    ActivateToken: token,
    activateTokenExpiration: expiration,
  });

  await sendActivationEmail(user);

  return sendSuccess(res, 201, {
    id: user._id.toString(),
    message: "Client registered successfully. Confirmation email sent.",
  });
}

export async function registerDelivery(req, res) {
  if (!req.file) {
    return sendError(res, 400, "profileImage is required.");
  }

  const conflict = await ensureUniqueUserNameAndEmail(
    req.body.userName,
    req.body.email
  );

  if (conflict) {
    return sendError(res, conflict.statusCode, conflict.message);
  }

  const { token, expiration } = await generateTokenData();

  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.userName,
    email: req.body.email.toLowerCase(),
    password: await bcrypt.hash(req.body.password, 10),
    phone: req.body.phone,
    profilePicture: toPublicFilePath(req.file),
    role: UserRoles.DELIVERY,
    isActive: false,
    isBusy: false,
    ActivateToken: token,
    activateTokenExpiration: expiration,
  });

  await sendActivationEmail(user);

  return sendSuccess(res, 201, {
    id: user._id.toString(),
    message: "Delivery registered successfully. Confirmation email sent.",
  });
}

export async function registerCommerce(req, res) {
  if (!req.file) {
    return sendError(res, 400, "logo is required.");
  }

  const conflict = await ensureUniqueUserNameAndEmail(
    req.body.userName,
    req.body.email
  );

  if (conflict) {
    return sendError(res, conflict.statusCode, conflict.message);
  }

  const commerceType = await CommerceType.findById(req.body.commerceTypeId);

  if (!commerceType) {
    return sendError(res, 400, "commerceTypeId does not exist.");
  }

  const { token, expiration } = await generateTokenData();

  const user = await User.create({
    username: req.body.userName,
    email: req.body.email.toLowerCase(),
    password: await bcrypt.hash(req.body.password, 10),
    commerceName: req.body.name,
    description: req.body.description || null,
    phone: req.body.phone,
    openTime: req.body.openingTime,
    closeTime: req.body.closingTime,
    commerceTypeId: commerceType._id,
    commerceLogo: toPublicFilePath(req.file),
    role: UserRoles.COMMERCE,
    isActive: false,
    ActivateToken: token,
    activateTokenExpiration: expiration,
  });

  await sendActivationEmail(user);

  return sendSuccess(res, 201, {
    id: user._id.toString(),
    message: "Commerce registered successfully. Confirmation email sent.",
  });
}

export async function confirmEmail(req, res) {
  const user = await User.findOne({ ActivateToken: req.body.token });

  if (!user) {
    return sendError(res, 404, "Token not found.");
  }

  if (
    !user.activateTokenExpiration ||
    user.activateTokenExpiration.getTime() < Date.now()
  ) {
    return sendError(res, 400, "Token is invalid or expired.");
  }

  user.isActive = true;
  user.ActivateToken = null;
  user.activateTokenExpiration = null;
  await user.save();

  return sendSuccess(res, 200, {
    message: "Email confirmed successfully.",
  });
}

export async function forgotPassword(req, res) {
  const { userNameOrEmail } = req.body;

  const user = await User.findOne({
    $or: [
      { email: userNameOrEmail.toLowerCase() },
      { username: userNameOrEmail },
    ],
  });

  if (user) {
    const { token, expiration } = await generateTokenData();
    user.resetToken = token;
    user.resetTokenExpiration = expiration;
    await user.save();
    await sendResetEmail(user);
  }

  return sendSuccess(res, 200, {
    message: "If the user exists, a reset email was sent.",
  });
}

export async function resetPassword(req, res) {
  const user = await User.findOne({
    resetToken: req.body.token,
    resetTokenExpiration: { $gt: new Date() },
  });

  if (!user) {
    return sendError(res, 400, "Token is invalid or expired.");
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetToken = null;
  user.resetTokenExpiration = null;
  await user.save();

  return sendSuccess(res, 200, {
    message: "Password reset successfully.",
  });
}
