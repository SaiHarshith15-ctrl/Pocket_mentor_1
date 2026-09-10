/**
 * controllers/authController.js
 *
 * PURPOSE:
 * Register, login, and "who am I" endpoints. Issues JWTs on
 * register/login; middleware/auth.js verifies them on every protected
 * route afterward.
 *
 * CONNECTS TO:
 * - models/User.js
 * - middleware/auth.js (protect, used on GET /me)
 * - routes/authRoutes.js
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(400, "An account with this email already exists");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: password, // hashed by the pre-save hook in User.js
  });

  const token = signToken(user._id);
  res.status(201).json({ success: true, data: { user, token } });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user._id);
  res.json({ success: true, data: { user, token } });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

module.exports = { register, login, getMe };
