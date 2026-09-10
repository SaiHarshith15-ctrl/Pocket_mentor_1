/**
 * routes/rescueRoutes.js
 * Mounts: /api/rescue
 * PURPOSE: the Rescue Mode flow — start, generate targeted content, submit re-quiz.
 */
const express = require("express");
const {
  startRescue,
  generateRescueContent,
  submitRescueQuiz,
} = require("../controllers/rescueController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/start", protect, startRescue);
router.post("/:topicId/generate", protect, generateRescueContent);
router.post("/:topicId/submit", protect, submitRescueQuiz);

module.exports = router;
