/**
 * routes/userRoutes.js
 * Mounts: /api/users
 * PURPOSE: onboarding (protected).
 */
const express = require("express");
const { completeOnboarding, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.put("/onboarding", protect, completeOnboarding);
router.put("/profile", protect, updateProfile);

module.exports = router;
