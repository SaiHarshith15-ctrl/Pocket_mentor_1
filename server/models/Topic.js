/**
 * models/Topic.js
 *
 * PURPOSE:
 * One document per (user, subject, topic name). This is the row that
 * "Normalization: 38%" in the dashboard/profile comes from. It is the
 * central record mastery/rescue-mode read and write.
 *
 * CONNECTS TO:
 * - services/masteryService.js (recalculates `mastery` after every
 *   quiz attempt / flashcard review)
 * - controllers/rescueController.js (reads weakest topics, updates
 *   rescueAttempts)
 * - controllers/dashboardController.js, profileController.js (reads)
 *
 * MASTERY MODEL (kept intentionally simple for MVP):
 * mastery is a 0-100 rolling score. See services/masteryService.js for
 * the exact formula and TODOs for a more sophisticated version.
 */

const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note", default: null },

    importance: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    shortExplanation: { type: String, default: "" },

    mastery: { type: Number, default: 0, min: 0, max: 100 },
    mastered: { type: Boolean, default: false },
    masteredAt: { type: Date, default: null },

    // rolling counters used by masteryService
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: null },

    rescueAttempts: { type: Number, default: 0 },
    inRescueMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A user should not have duplicate topic rows for the same subject+name
topicSchema.index({ user: 1, subject: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Topic", topicSchema);
