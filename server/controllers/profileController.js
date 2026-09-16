/**
 * controllers/profileController.js
 *
 * PURPOSE:
 * Powers the LeetCode/GitHub-style profile page: overall mastery,
 * streak, per-subject mastery breakdown, raw stats counters, the
 * activity heatmap data, and a simple rules-based achievements list.
 *
 * CONNECTS TO:
 * - models/User.js, Topic.js, StudyActivity.js
 * - routes/profileRoutes.js
 */

const Topic = require("../models/Topic");
const StudyActivity = require("../models/StudyActivity");
const { startOfUTCDay } = require("../utils/activityTracker");
const asyncHandler = require("../utils/asyncHandler");

const ACHIEVEMENT_RULES = [
  { code: "FIRST_QUIZ", label: "🥇 First Quiz", test: (u) => u.stats.questionsAnswered >= 1 },
  { code: "STREAK_7", label: "🔥 7 Day Streak", test: (u) => u.longestStreak >= 7 },
  { code: "FLASHCARDS_50", label: "🧠 50 Flashcards", test: (u) => u.stats.flashcardsReviewed >= 50 },
  { code: "TOPICS_MASTERED_10", label: "🎯 10 Topics Mastered", test: (u) => u.stats.topicsMastered >= 10 },
  { code: "RESCUE_SURVIVOR", label: "🚑 Rescue Mode Survivor", test: (u) => u.stats.topicsRescued >= 1 },
];

// GET /api/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const topics = await Topic.find({ user: user._id });

  const overallMastery = topics.length
    ? Math.round(topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length)
    : 0;

  const subjectMastery = {};
  for (const t of topics) {
    if (!subjectMastery[t.subject]) subjectMastery[t.subject] = { total: 0, count: 0 };
    subjectMastery[t.subject].total += t.mastery;
    subjectMastery[t.subject].count += 1;
  }
  const subjectMasteryList = Object.entries(subjectMastery).map(([subject, v]) => ({
    subject,
    mastery: Math.round(v.total / v.count),
  }));

  const achievements = ACHIEVEMENT_RULES.filter((rule) => rule.test(user)).map((rule) => ({
    code: rule.code,
    label: rule.label,
  }));

  res.json({
    success: true,
    data: {
      name: user.name,
      email: user.email,
      department: user.department,
      year: user.year,
      subjects: user.subjects || [],
      overallMastery,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      stats: user.stats,
      subjectMastery: subjectMasteryList,
      achievements,
    },
  });
});

// GET /api/profile/activity?days=84
// Returns a flat array of { date, count } for the heatmap component to
// render (7 x N grid, like GitHub's contribution graph).
const getActivity = asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(7, Number(req.query.days) || 84));
  const since = startOfUTCDay(new Date());
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const activity = await StudyActivity.find({
    user: req.user._id,
    date: { $gte: since },
  }).sort({ date: 1 });

  res.json({ success: true, data: { activity, days } });
});

// GET /api/profile/achievements
const getAchievements = asyncHandler(async (req, res) => {
  const user = req.user;
  const unlocked = ACHIEVEMENT_RULES.filter((rule) => rule.test(user)).map((r) => ({
    code: r.code,
    label: r.label,
    unlocked: true,
  }));
  const locked = ACHIEVEMENT_RULES.filter((rule) => !rule.test(user)).map((r) => ({
    code: r.code,
    label: r.label,
    unlocked: false,
  }));

  res.json({ success: true, data: { achievements: [...unlocked, ...locked] } });
});

// TODO(PHASE-3):
// Replace ACHIEVEMENT_RULES with a DB-backed Achievement model if you
// want admin-configurable achievements later. For the hackathon MVP, a
// hardcoded rules array (evaluated live against User.stats) is
// sufficient and avoids an extra collection + sync logic.

module.exports = { getProfile, getActivity, getAchievements };
