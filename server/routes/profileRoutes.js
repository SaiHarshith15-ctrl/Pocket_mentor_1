/**
 * routes/profileRoutes.js
 * Mounts: /api/profile
 */
const express = require("express");
const { getProfile, getActivity, getAchievements } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getProfile);
router.get("/activity", protect, getActivity);
router.get("/achievements", protect, getAchievements);

module.exports = router;
