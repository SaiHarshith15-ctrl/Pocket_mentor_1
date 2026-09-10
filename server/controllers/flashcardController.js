/**
 * controllers/flashcardController.js
 *
 * PURPOSE:
 * Lists a student's flashcards (optionally filtered by subject/topic)
 * and records review interactions (Again/Hard/Good/Easy), feeding both
 * mastery tracking and the daily activity heatmap.
 *
 * CONNECTS TO:
 * - models/Flashcard.js
 * - services/masteryService.js (applyFlashcardRatingToMastery)
 * - utils/activityTracker.js
 * - routes/flashcardRoutes.js
 */

const Flashcard = require("../models/Flashcard");
const User = require("../models/User");
const { applyFlashcardRatingToMastery } = require("../services/masteryService");
const { recordActivity } = require("../utils/activityTracker");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const VALID_RATINGS = ["again", "hard", "good", "easy"];

// GET /api/flashcards?subject=DBMS&topic=Normalization
const listFlashcards = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.subject) query.subject = req.query.subject;
  if (req.query.topic) query.topic = req.query.topic;

  const flashcards = await Flashcard.find(query).sort({ createdAt: -1 });
  res.json({ success: true, data: { flashcards } });
});

// POST /api/flashcards/:id/review  { rating: "again"|"hard"|"good"|"easy" }
const reviewFlashcard = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  if (!VALID_RATINGS.includes(rating)) {
    throw new ApiError(400, `rating must be one of: ${VALID_RATINGS.join(", ")}`);
  }

  const flashcard = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
  if (!flashcard) throw new ApiError(404, "Flashcard not found");

  flashcard.reviewCount += 1;
  flashcard.correctCount += rating === "good" || rating === "easy" ? 1 : 0;
  flashcard.lastRating = rating;
  flashcard.lastReviewedAt = new Date();
  await flashcard.save();

  const topic = await applyFlashcardRatingToMastery(
    req.user._id,
    flashcard.subject,
    flashcard.topic,
    rating
  );

  await User.findByIdAndUpdate(req.user._id, { $inc: { "stats.flashcardsReviewed": 1 } });
  await recordActivity(req.user._id);

  res.json({ success: true, data: { flashcard, topic } });
});

module.exports = { listFlashcards, reviewFlashcard };
