/**
 * models/StudyActivity.js
 *
 * PURPOSE:
 * One row per (user, calendar day) with a simple activity intensity
 * count. This powers the GitHub/LeetCode-style heatmap on the Profile
 * page and the streak calculation.
 *
 * CONNECTS TO:
 * - utils/activityTracker.js (increments today's row whenever the user
 *   reviews a flashcard, submits a quiz, or uploads a note)
 * - controllers/profileController.js (GET /api/profile/activity reads a
 *   date range and returns it directly to the heatmap component)
 *
 * NOTE:
 * `date` is stored normalized to midnight UTC so a day always has at
 * most one document, making the heatmap query a simple date range scan.
 */

const mongoose = require("mongoose");

const studyActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true }, // normalized to 00:00:00 UTC
    count: { type: Number, default: 0 }, // number of study "actions" that day
  },
  { timestamps: true }
);

studyActivitySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StudyActivity", studyActivitySchema);
