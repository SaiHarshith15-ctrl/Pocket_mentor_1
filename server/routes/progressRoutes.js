/**
 * routes/progressRoutes.js
 * Mounts: /api/progress
 */
const express = require("express");
const { getProgress, getTopics } = require("../controllers/progressController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getProgress);
router.get("/topics", protect, getTopics);

module.exports = router;
