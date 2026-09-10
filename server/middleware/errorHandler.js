/**
 * middleware/errorHandler.js
 *
 * PURPOSE:
 * Single place that turns any thrown error (ApiError or unexpected) into
 * a consistent JSON response: { success: false, message }. Keeps
 * controllers free of duplicated try/catch/response boilerplate.
 *
 * CONNECTS TO:
 * - server.js (registered as the last middleware)
 * - utils/asyncHandler.js (forwards errors here via next(err))
 */

function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  // Log full detail server-side; never leak stack traces to the client.
  console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.message);
  if (statusCode === 500) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Something went wrong on the server" : err.message,
  });
}

module.exports = { notFound, errorHandler };
