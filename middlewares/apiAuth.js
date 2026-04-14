import User from "../models/User.js";
import { sendError } from "../utils/apiResponses.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function requireApiAuth(req, res, next) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return sendError(res, 401, "Authentication required.");
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      return sendError(res, 401, "Invalid token.");
    }

    if (!user.isActive) {
      return sendError(res, 401, "Account is inactive.");
    }

    req.auth = payload;
    req.user = user;

    return next();
  } catch (error) {
    return sendError(res, 401, "Invalid or expired token.");
  }
}

export function requireApiRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, "Authentication required.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, "Forbidden.");
    }

    return next();
  };
}
