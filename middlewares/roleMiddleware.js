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

    if (!req.session.user) {
      return res.redirect("/auth/login");
    }

    const userRole = req.session.user.role;

    const hasPermission = allowedRoles.includes(userRole);

    if (!hasPermission) {
      return res.status(403).render("errors/403", {
        pageTitle: "Access denied",
        message: "You do not have permission to access this page.",
        homeUrl: homeRouteByRole(req.session.user),
      });
    }

    next();
  };
}