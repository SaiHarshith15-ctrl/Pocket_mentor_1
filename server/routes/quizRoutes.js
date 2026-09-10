/**
 * routes/quizRoutes.js
 * Mounts: /api/quizzes
 */
const express = require("express");
const { generateQuiz, getQuiz, submitQuiz } = require("../controllers/quizController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/generate", protect, generateQuiz);
router.get("/:id", protect, getQuiz);
router.post("/:id/submit", protect, submitQuiz);

module.exports = router;
