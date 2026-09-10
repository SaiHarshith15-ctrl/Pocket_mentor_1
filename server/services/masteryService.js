/**
 * services/masteryService.js
 *
 * PURPOSE:
 * Owns the mastery formula. Every quiz submission and flashcard review
 * runs through here so there is exactly ONE place that decides how
 * "mastery" moves, instead of controllers each doing their own math.
 *
 * CONNECTS TO:
 * - controllers/quizController.js (submitQuiz calls updateMasteryFromQuiz)
 * - controllers/flashcardController.js (reviewFlashcard calls
 *   updateMasteryFromFlashcard)
 * - controllers/rescueController.js (reads getWeakestTopics, checks the
 *   MASTERY_THRESHOLD env var to decide when a topic is "mastered")
 * - models/Topic.js
 *
 * MASTERY FORMULA (MVP, intentionally simple):
 * mastery is a 0-100 weighted-recent-average:
 *   newMastery = oldMastery * (1 - weight) + outcomeScore * 100 * weight
 * where outcomeScore is 1 for a correct answer / good+ flashcard rating,
 * 0 for incorrect / again rating, and weight controls how much a single
 * new data point can move the score (kept at 0.35 so mastery moves
 * meaningfully after 2-3 questions, matching the "38% -> 71%" demo flow,
 * without being wiped out by a single lucky/unlucky answer).
 */

const Topic = require("../models/Topic");

const RECENCY_WEIGHT = 0.35;

function nextMastery(oldMastery, outcomeCorrect) {
  const outcomeScore = outcomeCorrect ? 100 : 0;
  const updated = oldMastery * (1 - RECENCY_WEIGHT) + outcomeScore * RECENCY_WEIGHT;
  return Math.max(0, Math.min(100, Math.round(updated)));
}

function getMasteryThreshold() {
  const raw = Number(process.env.MASTERY_THRESHOLD);
  return Number.isFinite(raw) && raw > 0 ? raw : 80;
}

/**
 * Ensures a Topic doc exists for (user, subject, name), creating one
 * with mastery 0 if this is the first time it's been seen.
 */
async function ensureTopic(userId, subject, name, extra = {}) {
  return Topic.findOneAndUpdate(
    { user: userId, subject, name },
    { $setOnInsert: { user: userId, subject, name, mastery: 0, ...extra } },
    { upsert: true, new: true }
  );
}

/**
 * Applies one quiz answer's correctness to its topic's mastery.
 * Called once per answer inside quizController.submitQuiz.
 */
async function applyAnswerToMastery(userId, subject, topicName, isCorrect) {
  const topic = await ensureTopic(userId, subject, topicName);

  topic.mastery = nextMastery(topic.mastery, isCorrect);
  topic.correctCount += isCorrect ? 1 : 0;
  topic.incorrectCount += isCorrect ? 0 : 1;
  topic.lastAttemptAt = new Date();

  const threshold = getMasteryThreshold();
  const wasMastered = topic.mastered;
  topic.mastered = topic.mastery >= threshold;
  if (topic.mastered && !wasMastered) {
    topic.masteredAt = new Date();
  }
  if (topic.mastery >= threshold) {
    topic.inRescueMode = false;
  }

  await topic.save();
  return topic;
}

/**
 * Applies a flashcard review rating to its topic's mastery. "good" and
 * "easy" count as correct; "again" and "hard" count as incorrect. This
 * is intentionally coarse for the MVP (see Flashcard.js TODO for a real
 * spaced-repetition system in Phase 2).
 */
async function applyFlashcardRatingToMastery(userId, subject, topicName, rating) {
  const isPositive = rating === "good" || rating === "easy";
  return applyAnswerToMastery(userId, subject, topicName, isPositive);
}

/**
 * Returns the N lowest-mastery topics for a user (optionally scoped to
 * a subject). Used by the dashboard's "Priority Topic" card and Rescue
 * Mode's topic picker.
 */
async function getWeakestTopics(userId, subject, limit = 5) {
  const query = { user: userId };
  if (subject) query.subject = subject;
  return Topic.find(query).sort({ mastery: 1, lastAttemptAt: -1 }).limit(limit);
}

module.exports = {
  nextMastery,
  getMasteryThreshold,
  ensureTopic,
  applyAnswerToMastery,
  applyFlashcardRatingToMastery,
  getWeakestTopics,
};
