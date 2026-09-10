/**
 * routes/userRoutes.js
 * Mounts: /api/users
 * PURPOSE: onboarding (protected).
 */
const express = require("express");
const { completeOnboarding } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.put("/onboarding", protect, completeOnboarding);

module.exports = router;
