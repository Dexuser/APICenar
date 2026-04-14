import { validationResult } from "express-validator";
import { sendError } from "../utils/apiResponses.js";

export function handleApiValidation(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return sendError(
    res,
    400,
    "Validation failed.",
    errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }))
  );
}
