/**
 * controllers/rescueController.js
 *
 * PURPOSE:
 * Implements Rescue Mode: when a student is weak on a topic, generate a
 * focused explanation + 3 flashcards + a small re-quiz for JUST that
 * topic, then let them retry until mastery crosses the configurable
 * threshold. This is the project's core differentiator (see README).
 *
 * CONNECTS TO:
 * - services/geminiService.js (generateTargetedRevision)
 * - services/masteryService.js (getMasteryThreshold, applyAnswerToMastery)
 * - models/Topic.js, Flashcard.js, Quiz.js, Note.js
 * - routes/rescueRoutes.js
 */

const Topic = require("../models/Topic");
const Note = require("../models/Note");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");
const User = require("../models/User");
const geminiService = require("../services/geminiService");
const { getMasteryThreshold, applyAnswerToMastery } = require("../services/masteryService");
const { scoreQuizSubmission } = require("../services/quizService");
const { recordActivity } = require("../utils/activityTracker");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/rescue/start  { topicId }
// Marks a topic as "in rescue mode" and returns its current stats so the
// frontend can render the "You struggled with: Normalization, 38%" card.
const startRescue = asyncHandler(async (req, res) => {
  const { topicId } = req.body;
  if (!topicId) throw new ApiError(400, "topicId is required");

  const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
  if (!topic) throw new ApiError(404, "Topic not found");

  topic.inRescueMode = true;
  topic.rescueAttempts += 1;
  await topic.save();

  res.json({ success: true, data: { topic, masteryThreshold: getMasteryThreshold() } });
});

// POST /api/rescue/:topicId/generate
// The core AI call: generate a targeted explanation, 3 flashcards, and a
// 3-question re-quiz for this one topic, grounded in the student's own
// notes where available.
const generateRescueContent = asyncHandler(async (req, res) => {
  const topic = await Topic.findOne({ _id: req.params.topicId, user: req.user._id });
  if (!topic) throw new ApiError(404, "Topic not found");

  // Pull a bit of context from the note this topic came from, if any,
  // so the targeted revision stays grounded in the student's material.
  let contextText = "";
  if (topic.note) {
    const note = await Note.findById(topic.note);
    contextText = note ? note.rawText.slice(0, 4000) : "";
  }

  let revision;
  try {
    revision = await geminiService.generateTargetedRevision(topic.subject, topic.name, contextText);
  } catch (err) {
    throw new ApiError(502, `AI rescue generation failed: ${err.message}`);
  }

  const flashcards = await Flashcard.insertMany(
    revision.flashcards.map((f) => ({
      user: req.user._id,
      subject: topic.subject,
      topic: topic.name,
      question: f.question,
      answer: f.answer,
      difficulty: f.difficulty,
      origin: "rescue",
    }))
  );

  const quiz = await Quiz.create({
    user: req.user._id,
    subject: topic.subject,
    type: "rescue",
    focusTopic: topic.name,
    questions: revision.quiz,
  });

  await User.findByIdAndUpdate(req.user._id, { $inc: { "stats.topicsRescued": 1 } });
  await recordActivity(req.user._id);

  res.json({
    success: true,
    data: {
      explanation: revision.explanation,
      flashcards,
      quiz,
      masteryBefore: topic.mastery,
    },
  });
});

// POST /api/rescue/:topicId/submit  { quizId, answers: [{questionId, selectedAnswer}] }
// Grades the rescue re-quiz, updates mastery, and reports the
// before/after improvement + whether the topic is now mastered.
const submitRescueQuiz = asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;
  if (!quizId || !Array.isArray(answers)) {
    throw new ApiError(400, "quizId and answers are required");
  }

  const topic = await Topic.findOne({ _id: req.params.topicId, user: req.user._id });
  if (!topic) throw new ApiError(404, "Topic not found");

  const quiz = await Quiz.findOne({ _id: quizId, user: req.user._id, type: "rescue" });
  if (!quiz) throw new ApiError(404, "Rescue quiz not found");

  const masteryBefore = topic.mastery;
  const result = scoreQuizSubmission(quiz, answers);

  // Majority-correct on this focused re-quiz drives the mastery update.
  const isCorrect = result.score / result.total >= 0.5;
  const updatedTopic = await applyAnswerToMastery(req.user._id, topic.subject, topic.name, isCorrect);

  const threshold = getMasteryThreshold();
  const justMastered = updatedTopic.mastered && masteryBefore < threshold;

  if (justMastered) {
    await User.findByIdAndUpdate(req.user._id, { $inc: { "stats.topicsMastered": 1 } });
  }

  await recordActivity(req.user._id);

  res.json({
    success: true,
    data: {
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      masteryBefore,
      masteryAfter: updatedTopic.mastery,
      masteryThreshold: threshold,
      mastered: updatedTopic.mastered,
      justMastered,
    },
  });
});

module.exports = { startRescue, generateRescueContent, submitRescueQuiz };
