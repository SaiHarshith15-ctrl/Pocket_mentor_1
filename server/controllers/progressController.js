/**
 * controllers/progressController.js
 *
 * PURPOSE:
 * Read-only endpoints exposing topic mastery data, including the "Exam
 * Readiness" calculated metric described in the product spec.
 *
 * CONNECTS TO:
 * - models/Topic.js
 * - services/masteryService.js
 * - routes/progressRoutes.js
 */

const Topic = require("../models/Topic");
const { getMasteryThreshold } = require("../services/masteryService");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/progress?subject=DBMS
// Returns overall mastery (average across topics) + exam readiness.
const getProgress = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.subject) query.subject = req.query.subject;

  const topics = await Topic.find(query).sort({ mastery: 1 });

  const overallMastery = topics.length
    ? Math.round(topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length)
    : 0;

  // Exam readiness formula (kept simple + explainable for MVP):
  // average mastery, penalized slightly for each topic still below the
  // mastery threshold (representing unresolved weak spots).
  const threshold = getMasteryThreshold();
  const weakCount = topics.filter((t) => t.mastery < threshold).length;
  const penalty = Math.min(30, weakCount * 5);
  const examReadiness = Math.max(0, overallMastery - penalty);

  res.json({
    success: true,
    data: { overallMastery, examReadiness, weakTopicCount: weakCount, topics },
  });
});

// GET /api/progress/topics?subject=DBMS
const getTopics = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.subject) query.subject = req.query.subject;

  const topics = await Topic.find(query).sort({ mastery: 1 });
  res.json({ success: true, data: { topics } });
});

module.exports = { getProgress, getTopics };
