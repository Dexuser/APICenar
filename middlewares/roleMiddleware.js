import homeRouteByRole from "../utils/RedirectByRole.js";

/**
 * 
 * Middleware to check if the user has the role to access this route
 * If the user is not authenticated, redirect them to their home.
 * @param  {...any} allowedRoles the roles that are allowed to pass this middleware
 * @returns 
 */

export default function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {

    if (!req.user) {
      const error = new Error("You must be logged in to access this page.");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    const userRole = req.user.role;

    const hasPermission = allowedRoles.includes(userRole);

    if (!hasPermission) {
      const error = new Error("You do not have permission to access this page.");
      error.statusCode = 403; // Forbidden
      throw error;
    }

    next();
  };
}