import homeRouteByRole from "../utils/RedirectByRole.js";
/**
 * Middleware to check if the user is authenticated for login routes
 * If the user is authenticated, redirect them to the dashboard.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export default function isAuthForLogin(req, res, next) {
  if (req.session.isAuthenticated) {
    res.redirect(homeRouteByRole(req.session.user)); // Redirect to the home page
  }

  next(); // If the user is authenticated, proceed to the next middleware or route handler
}
