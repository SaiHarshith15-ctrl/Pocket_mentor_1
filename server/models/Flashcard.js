/**
 * models/Flashcard.js
 *
 * PURPOSE:
 * A single flashcard (question/answer pair) tied to a topic, plus simple
 * review tracking (count, last rating, last reviewed). This is the
 * foundation for spaced repetition — see the TODO below for Phase 2.
 *
 * CONNECTS TO:
 * - controllers/flashcardController.js (list + review)
 * - services/geminiService.js (generateFlashcards / generateTargetedRevision
 *   produce the question/answer content saved here)
 */

const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note", default: null },

    question: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },

    // Marks cards generated specifically for Rescue Mode (targeted revision)
    origin: { type: String, enum: ["initial", "rescue"], default: "initial" },

    reviewCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    lastRating: {
      type: String,
      enum: ["again", "hard", "good", "easy", null],
      default: null,
    },
    lastReviewedAt: { type: Date, default: null },

    // TODO(PHASE-2):
    // Implement spaced repetition scheduling here.
    // Suggested approach:
    // - Add `nextReviewAt: Date` and `intervalDays: Number` fields.
    // - In controllers/flashcardController.js `reviewFlashcard`, increase
    //   intervalDays after "easy"/"good" ratings and reset it to a small
    //   value after "again".
    // - Add a GET /api/flashcards/due endpoint that queries
    //   `nextReviewAt: { $lte: new Date() }` so the frontend can build a
    //   "due today" queue instead of showing all cards every time.
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flashcard", flashcardSchema);
