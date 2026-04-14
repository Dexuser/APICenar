export function sendSuccess(res, statusCode, data) {
  return res.status(statusCode).json(data);
}

export function sendError(res, statusCode, message, details = null) {
  const payload = { message };

  if (details) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
}
