import { validationResult } from "express-validator";

/**
 * Middleware to handle validation errors
 * @param {*} redirectTo - The URL to redirect to if there are validation errors or function to determine the redirect URL
 * @returns 
 */
export function handleValidationErrors(redirectTo = null) {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash(
        "errors",
        errors.array().map((err) => err.msg)
      );

      const target = typeof redirectTo === "function" ? redirectTo(req) : req.redirectTo;

      return res.redirect(target || req.originalUrl);
    }
    return next();
  };

}