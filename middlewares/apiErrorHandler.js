import { sendError } from "../utils/apiResponses.js";

export function apiNotFoundHandler(req, res) {
  return sendError(res, 404, "Endpoint not found.");
}

export function apiErrorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.name === "MulterError") {
    return sendError(res, 400, error.message);
  }

  if (error?.message) {
    return sendError(res, 400, error.message);
  }

  return sendError(res, 500, "Unexpected server error.");
}
