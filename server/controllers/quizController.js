/**
 * controllers/quizController.js
 *
 * PURPOSE:
 * Fetches/generates quizzes and grades submissions. Grading is done
 * locally (services/quizService.js) since these are multiple-choice
 * questions with a known correct answer — no AI call needed to grade,
 * keeping quota usage low.
 *
 * CONNECTS TO:
 * - models/Quiz.js, QuizAttempt.js
 * - services/quizService.js (scoreQuizSubmission)
 * - services/masteryService.js (applyAnswerToMastery per answer)
 * - utils/activityTracker.js
 * - routes/quizRoutes.js
 */

const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const { scoreQuizSubmission } = require("../services/quizService");
const { applyAnswerToMastery } = require("../services/masteryService");
const { recordActivity } = require("../utils/activityTracker");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/quizzes/generate  { noteId }
// Returns the initial quiz already created for a note during analysis.
// (Kept as its own endpoint so the frontend flow matches the spec's API
// list, even though generation itself happens once in noteController.)
const generateQuiz = asyncHandler(async (req, res) => {
  const { noteId } = req.body;
  if (!noteId) throw new ApiError(400, "noteId is required");

  const quiz = await Quiz.findOne({ note: noteId, user: req.user._id, type: "initial" }).sort({
    createdAt: -1,
  });
  if (!quiz) {
    throw new ApiError(404, "No quiz found for this note yet. Analyze the note first.");
  }

  res.json({ success: true, data: { quiz } });
});

// GET /api/quizzes/:id
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  res.json({ success: true, data: { quiz } });
});

// POST /api/quizzes/:id/submit  { answers: [{ questionId, selectedAnswer }] }
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new ApiError(400, "answers must be a non-empty array");
  }

  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) throw new ApiError(404, "Quiz not found");

  const result = scoreQuizSubmission(quiz, answers);

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quiz._id,
    subject: quiz.subject,
    ...result,
  });

  // Update mastery for every topic touched by this quiz, one topic-level
  // update per topic (not per question) so a topic's mastery reflects
  // its overall performance in this attempt.
  for (const breakdown of result.topicBreakdown) {
    // Use majority-correct as the outcome signal for this quiz's pass
    // on the topic; masteryService blends it with prior mastery.
    const isCorrect = breakdown.correct / breakdown.total >= 0.5;
    await applyAnswerToMastery(req.user._id, quiz.subject, breakdown.topic, isCorrect);
  }

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.questionsAnswered": result.total },
  });
  await recordActivity(req.user._id);

  res.json({ success: true, data: { attempt } });
});

module.exports = { generateQuiz, getQuiz, submitQuiz };
