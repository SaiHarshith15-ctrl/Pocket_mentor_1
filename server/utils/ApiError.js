/**
 * utils/ApiError.js
 *
 * PURPOSE:
 * A small custom Error subclass carrying an HTTP status code, so
 * controllers can `throw new ApiError(404, "Note not found")` and
 * middleware/errorHandler.js will turn it into the correct response.
 */

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
