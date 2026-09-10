/**
 * utils/activityTracker.js
 *
 * PURPOSE:
 * Central place that records "the user did something today" — called
 * from flashcard review, quiz submission, and note upload controllers.
 * Updates both StudyActivity (for the heatmap) and User.currentStreak /
 * longestStreak / lastActiveDate (for the dashboard streak bar).
 *
 * CONNECTS TO:
 * - controllers/flashcardController.js, quizController.js,
 *   noteController.js (all call recordActivity(userId))
 * - models/StudyActivity.js, models/User.js
 */

const StudyActivity = require("../models/StudyActivity");
const User = require("../models/User");

function startOfUTCDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function recordActivity(userId, weight = 1) {
  const today = startOfUTCDay(new Date());

  await StudyActivity.findOneAndUpdate(
    { user: userId, date: today },
    { $inc: { count: weight } },
    { upsert: true, new: true }
  );

  const user = await User.findById(userId);
  if (!user) return;

  const last = user.lastActiveDate ? startOfUTCDay(user.lastActiveDate) : null;

  if (!last || last.getTime() !== today.getTime()) {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const wasYesterday = last && today.getTime() - last.getTime() === oneDayMs;

    user.currentStreak = wasYesterday ? user.currentStreak + 1 : 1;
    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
    user.lastActiveDate = today;
    await user.save();
  }
}

module.exports = { recordActivity, startOfUTCDay };
