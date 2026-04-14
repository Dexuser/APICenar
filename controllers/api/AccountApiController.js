import path from "path";
import User from "../../models/User.js";
import UserRoles from "../../models/enums/userRoles.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";

function toFilePath(file) {
  if (!file) {
    return null;
  }

  return `\\${path.relative("public", file.path)}`.replaceAll("\\\\", "\\");
}

function buildAccountResponse(user) {
  let base = {};
  if (user.role === UserRoles.CLIENT || user.role === UserRoles.DELIVERY || user.role === UserRoles.ADMIN) {
    base = {
      id: user._id.toString(),
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      userName: user.username || null,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      isActive: user.isActive,
      profileImage: user.profilePicture || null,
    };
  }

  if (user.role === UserRoles.DELIVERY) {
    base.isAvailable = !user.isBusy;
  }

  if (user.role === UserRoles.COMMERCE) {
    base ={
      name: user.commerceName,
      email: user.email,
      description: user.description || null,
      phone: user.phone || null,
      openingTime: user.openTime,
      closingTime: user.closeTime,
      commerceTypeId: user.commerceTypeId || null,
      logo: user.commerceLogo || null,
    };
  }

  return base;
}

export async function getAuthenticatedProfile(req, res) {
  return sendSuccess(res, 200, buildAccountResponse(req.user));
}

export async function updateAuthenticatedProfile(req, res) {
  const user = req.user;

  if (user.role === UserRoles.COMMERCE) {
    const { email, phone, openingTime, closingTime } = req.body;

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return sendError(res, 409, "email already exists.");
      }

      user.email = email.toLowerCase();
    }

    if (phone !== undefined) user.phone = phone;
    if (openingTime !== undefined) user.openTime = openingTime;
    if (closingTime !== undefined) user.closeTime = closingTime;
    if (req.file) user.commerceLogo = toFilePath(req.file);
  } else {
    const { firstName, lastName, phone } = req.body;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (req.file) user.profilePicture = toFilePath(req.file);
  }

  await user.save();

  return sendSuccess(res, 200, buildAccountResponse(user));
}
