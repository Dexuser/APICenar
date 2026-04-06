/**
 * Middleware to check if the user is authenticated
 * If the user is authenticated, proceed to the next middleware or route handler.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
export default function isAuth(req, res, next) {
  if (req.session.isAuthenticated && req.session.user) {    
    return next(); // If the user is authenticated, proceed to the next middleware or route handler
  }
  req.flash("errors", "You must be logged in to access this page."); // Flash an error message
  res.redirect("/"); // Redirect to the home page or login page
}