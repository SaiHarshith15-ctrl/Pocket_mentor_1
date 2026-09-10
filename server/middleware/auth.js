/**
 * middleware/auth.js
 *
 * PURPOSE:
 * Verifies the JWT sent in the Authorization header ("Bearer <token>"),
 * loads the corresponding user, and attaches it to req.user. Any route
 * that needs a logged-in user should use this as middleware.
 *
 * CONNECTS TO:
 * - routes/*.js (every protected route imports { protect })
 * - controllers/authController.js (issues the tokens this verifies)
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Not authorized, invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "Not authorized, user no longer exists");
  }

  req.user = user;
  next();
});

module.exports = { protect };
