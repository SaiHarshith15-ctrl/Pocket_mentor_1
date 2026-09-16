/**
 * controllers/analyticsController.js
 *
 * PURPOSE:
 * Single endpoint that returns all 6 advanced analytics in one payload:
 * Knowledge Map, Weakness Analysis, Error Patterns, Next Best Action,
 * Before vs After, and Exam Readiness.
 *
 * CONNECTS TO:
 * - models/Topic.js, QuizAttempt.js, Flashcard.js, User.js
 * - services/masteryService.js
 * - routes/analyticsRoutes.js
 */

const Topic = require("../models/Topic");
const QuizAttempt = require("../models/QuizAttempt");
const { getMasteryThreshold } = require("../services/masteryService");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const threshold = getMasteryThreshold();

  // ── Fetch all data in parallel ──
  const [topics, attempts] = await Promise.all([
    Topic.find({ user: userId }).sort({ subject: 1, name: 1 }),
    QuizAttempt.find({ user: userId }).sort({ createdAt: 1 }),
  ]);

  // ═══════════════════════════════════════════════════
  // 1. KNOWLEDGE MAP
  //    Group topics by subject, with mastery + status
  // ═══════════════════════════════════════════════════
  const subjectMap = {};
  for (const t of topics) {
    if (!subjectMap[t.subject]) subjectMap[t.subject] = [];
    subjectMap[t.subject].push({
      _id: t._id,
      name: t.name,
      mastery: t.mastery,
      importance: t.importance,
      mastered: t.mastered,
      inRescueMode: t.inRescueMode,
      correctCount: t.correctCount,
      incorrectCount: t.incorrectCount,
      lastAttemptAt: t.lastAttemptAt,
      status:
        t.mastery >= threshold
          ? "mastered"
          : t.mastery >= threshold * 0.5
          ? "learning"
          : t.mastery > 0
          ? "weak"
          : "unseen",
    });
  }
  const knowledgeMap = Object.entries(subjectMap).map(([subject, topics]) => ({
    subject,
    topics,
    avgMastery: topics.length
      ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
      : 0,
    topicCount: topics.length,
    masteredCount: topics.filter((t) => t.status === "mastered").length,
  }));

  // ═══════════════════════════════════════════════════
  // 2. WEAKNESS ANALYSIS
  //    Topics below threshold, sorted by mastery asc
  // ═══════════════════════════════════════════════════
  const weakTopics = topics
    .filter((t) => t.mastery < threshold)
    .sort((a, b) => a.mastery - b.mastery)
    .map((t) => ({
      _id: t._id,
      name: t.name,
      subject: t.subject,
      mastery: t.mastery,
      importance: t.importance,
      totalAttempts: t.correctCount + t.incorrectCount,
      accuracy:
        t.correctCount + t.incorrectCount > 0
          ? Math.round(
              (t.correctCount / (t.correctCount + t.incorrectCount)) * 100
            )
          : 0,
      dangerZone: t.mastery < 40,
    }));

  const weaknessBySubject = {};
  for (const w of weakTopics) {
    if (!weaknessBySubject[w.subject]) weaknessBySubject[w.subject] = [];
    weaknessBySubject[w.subject].push(w);
  }

  // ═══════════════════════════════════════════════════
  // 3. ERROR PATTERNS
  //    Aggregate incorrect answers from quiz attempts
  // ═══════════════════════════════════════════════════
  const errorMap = {};
  for (const attempt of attempts) {
    for (const ans of attempt.answers) {
      if (!ans.isCorrect) {
        const key = `${attempt.subject}::${ans.topic}`;
        if (!errorMap[key]) {
          errorMap[key] = {
            topic: ans.topic,
            subject: attempt.subject,
            incorrectCount: 0,
            totalAttempts: 0,
            recentErrors: [],
          };
        }
        errorMap[key].incorrectCount += 1;
        errorMap[key].totalAttempts += 1;
        if (errorMap[key].recentErrors.length < 3) {
          errorMap[key].recentErrors.push({
            question: ans.questionId,
            selectedAnswer: ans.selectedAnswer,
            correctAnswer: ans.correctAnswer,
            date: attempt.createdAt,
          });
        }
      }
    }
  }
  // Also count correct answers to compute accuracy per topic
  for (const attempt of attempts) {
    for (const ans of attempt.answers) {
      if (ans.isCorrect) {
        const key = `${attempt.subject}::${ans.topic}`;
        if (errorMap[key]) {
          errorMap[key].totalAttempts += 1;
        }
      }
    }
  }

  const errorPatterns = Object.values(errorMap)
    .map((e) => ({
      ...e,
      errorRate:
        e.totalAttempts > 0
          ? Math.round((e.incorrectCount / e.totalAttempts) * 100)
          : 0,
      severity:
        e.incorrectCount >= 5
          ? "critical"
          : e.incorrectCount >= 3
          ? "high"
          : "moderate",
    }))
    .sort((a, b) => b.incorrectCount - a.incorrectCount)
    .slice(0, 10);

  // ═══════════════════════════════════════════════════
  // 4. NEXT BEST ACTION
  //    Prioritize: low mastery × high importance × staleness
  // ═══════════════════════════════════════════════════
  const now = Date.now();
  const importanceWeight = { high: 3, medium: 2, low: 1 };

  const scored = topics
    .filter((t) => t.mastery < threshold)
    .map((t) => {
      const masteryScore = (100 - t.mastery) / 100; // higher when weaker
      const impScore = importanceWeight[t.importance] || 2;
      const daysSinceAttempt = t.lastAttemptAt
        ? (now - new Date(t.lastAttemptAt).getTime()) / (1000 * 60 * 60 * 24)
        : 30; // never attempted = very stale
      const stalenessScore = Math.min(daysSinceAttempt / 7, 4); // cap at 4 weeks
      const priority = masteryScore * impScore * (1 + stalenessScore * 0.3);
      return { topic: t, priority, daysSinceAttempt: Math.round(daysSinceAttempt) };
    })
    .sort((a, b) => b.priority - a.priority);

  const nextBestActions = scored.slice(0, 3).map((s) => {
    const reasons = [];
    if (s.topic.mastery < 40) reasons.push("Very low mastery");
    else if (s.topic.mastery < threshold) reasons.push("Below mastery threshold");
    if (s.topic.importance === "high") reasons.push("High importance topic");
    if (s.daysSinceAttempt >= 7) reasons.push(`Not reviewed in ${s.daysSinceAttempt} days`);
    if (s.topic.inRescueMode) reasons.push("Currently in Rescue Mode");

    let action = "Review flashcards";
    if (s.topic.mastery < 30) action = "Start Rescue Mode";
    else if (s.topic.mastery < 50) action = "Take a focused quiz";
    else action = "Review flashcards for reinforcement";

    return {
      _id: s.topic._id,
      name: s.topic.name,
      subject: s.topic.subject,
      mastery: s.topic.mastery,
      importance: s.topic.importance,
      action,
      reasons,
      priority: Math.round(s.priority * 100) / 100,
    };
  });

  // ═══════════════════════════════════════════════════
  // 5. BEFORE vs AFTER
  //    Compare first quiz attempt mastery vs current
  // ═══════════════════════════════════════════════════
  const beforeAfter = [];
  // Build per-topic timeline from quiz attempts
  const topicTimeline = {};
  for (const attempt of attempts) {
    for (const bd of attempt.topicBreakdown) {
      const key = `${attempt.subject}::${bd.topic}`;
      if (!topicTimeline[key]) {
        topicTimeline[key] = {
          topic: bd.topic,
          subject: attempt.subject,
          firstScore: null,
          firstDate: null,
          latestScore: null,
          latestDate: null,
          attemptCount: 0,
        };
      }
      const entry = topicTimeline[key];
      const pct = bd.total > 0 ? Math.round((bd.correct / bd.total) * 100) : 0;
      entry.attemptCount += 1;

      if (!entry.firstDate || attempt.createdAt < entry.firstDate) {
        entry.firstScore = pct;
        entry.firstDate = attempt.createdAt;
      }
      if (!entry.latestDate || attempt.createdAt > entry.latestDate) {
        entry.latestScore = pct;
        entry.latestDate = attempt.createdAt;
      }
    }
  }

  for (const entry of Object.values(topicTimeline)) {
    // Find current mastery from Topic model
    const topicDoc = topics.find(
      (t) => t.subject === entry.subject && t.name === entry.topic
    );
    const currentMastery = topicDoc ? topicDoc.mastery : entry.latestScore;

    beforeAfter.push({
      topic: entry.topic,
      subject: entry.subject,
      firstScore: entry.firstScore,
      currentMastery,
      improvement: currentMastery - entry.firstScore,
      attemptCount: entry.attemptCount,
      firstDate: entry.firstDate,
      latestDate: entry.latestDate,
    });
  }
  beforeAfter.sort((a, b) => b.improvement - a.improvement);

  // ═══════════════════════════════════════════════════
  // 6. EXAM READINESS
  //    Per-subject and overall readiness score
  // ═══════════════════════════════════════════════════
  const examReadiness = { subjects: [], overall: {} };

  for (const [subject, subTopics] of Object.entries(subjectMap)) {
    const avgMastery = subTopics.length
      ? Math.round(subTopics.reduce((s, t) => s + t.mastery, 0) / subTopics.length)
      : 0;
    const weakCount = subTopics.filter((t) => t.mastery < threshold).length;
    const penalty = Math.min(30, weakCount * 5);
    const readiness = Math.max(0, avgMastery - penalty);

    examReadiness.subjects.push({
      subject,
      avgMastery,
      readiness,
      weakCount,
      topicCount: subTopics.length,
      masteredCount: subTopics.filter((t) => t.mastery >= threshold).length,
      verdict:
        readiness >= 80 ? "ready" : readiness >= 50 ? "almost" : "not_ready",
      weakTopics: subTopics
        .filter((t) => t.mastery < threshold)
        .sort((a, b) => a.mastery - b.mastery)
        .slice(0, 3)
        .map((t) => ({ name: t.name, mastery: t.mastery })),
    });
  }

  // Overall
  const allMastery = topics.length
    ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
    : 0;
  const allWeak = topics.filter((t) => t.mastery < threshold).length;
  const overallPenalty = Math.min(30, allWeak * 5);
  const overallReadiness = Math.max(0, allMastery - overallPenalty);
  examReadiness.overall = {
    avgMastery: allMastery,
    readiness: overallReadiness,
    weakCount: allWeak,
    topicCount: topics.length,
    masteredCount: topics.filter((t) => t.mastered).length,
    verdict:
      overallReadiness >= 80
        ? "ready"
        : overallReadiness >= 50
        ? "almost"
        : "not_ready",
  };

  // ── Return everything ──
  res.json({
    success: true,
    data: {
      knowledgeMap,
      weaknessAnalysis: { weakTopics, weaknessBySubject },
      errorPatterns,
      nextBestActions,
      beforeAfter,
      examReadiness,
    },
  });
});

module.exports = { getAnalytics };
