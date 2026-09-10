/**
 * models/QuizAttempt.js
 *
 * PURPOSE:
 * Records one submission of a Quiz: which answers the student picked,
 * whether each was correct, and the resulting topic-wise breakdown
 * (e.g. "Normalization 1/4"). This is the source of truth
 * masteryService reads to recompute Topic.mastery.
 *
 * CONNECTS TO:
 * - controllers/quizController.js (submitQuiz creates this)
 * - services/masteryService.js (reads answers to update Topic docs)
 * - controllers/dashboardController.js / profileController.js (stats)
 */

const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    topic: { type: String, required: true },
    selectedAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const topicBreakdownSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    subject: { type: String, required: true, trim: true },

    answers: [answerSchema],
    score: { type: Number, required: true }, // number correct
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    topicBreakdown: [topicBreakdownSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
