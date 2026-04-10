import { validationResult } from "express-validator";

/**
 * Middleware to handle validation errors
 * @returns 
 */
export function handleValidationErrors() {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 400; // Bad Request
      error.data = errors.array();
      return next(error);
    }
    return next();
  };

}