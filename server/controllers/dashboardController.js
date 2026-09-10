/**
 * controllers/dashboardController.js
 *
 * PURPOSE:
 * Assembles the single payload the Dashboard page needs: greeting info,
 * the #1 priority (weakest) topic for "Rescue Mode" card, a "recommended
 * today" list, streak, and overall mastery. Deliberately reads from
 * MongoDB only — no data is hardcoded, per the product spec.
 *
 * CONNECTS TO:
 * - models/User.js, Topic.js
 * - services/masteryService.js (getWeakestTopics)
 * - routes/dashboardRoutes.js
 */

const Topic = require("../models/Topic");
const { getWeakestTopics } = require("../services/masteryService");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const user = req.user;

  const topics = await Topic.find({ user: user._id });
  const overallMastery = topics.length
    ? Math.round(topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length)
    : 0;

  const weakest = await getWeakestTopics(user._id, null, 5);
  const priorityTopic = weakest[0] || null;
  const recommendedToday = weakest.slice(0, 3);

  res.json({
    success: true,
    data: {
      name: user.name,
      department: user.department,
      year: user.year,
      subjects: user.subjects,
      priorityTopic,
      recommendedToday,
      currentStreak: user.currentStreak,
      overallMastery,
      stats: user.stats,
    },
  });
});

module.exports = { getDashboard };
