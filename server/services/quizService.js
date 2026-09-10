/**
 * services/quizService.js
 *
 * PURPOSE:
 * Pure scoring logic for a submitted quiz (topic-wise breakdown,
 * percentage), plus a simple adaptive ranking helper that biases future
 * quiz generation toward weak topics. Kept separate from
 * masteryService.js: this file is about "what to ask next", mastery
 * service is about "how good are they at a topic".
 *
 * CONNECTS TO:
 * - controllers/quizController.js (scoreQuizSubmission)
 * - services/masteryService.js (getWeakestTopics feeds rankTopicsForQuiz)
 */

/**
 * Compares submitted answers against a Quiz's questions and produces:
 * - per-answer correctness
 * - overall score/percentage
 * - topic-wise breakdown, e.g. { topic: "Normalization", correct: 1, total: 4 }
 */
function scoreQuizSubmission(quiz, submittedAnswers) {
  // submittedAnswers: [{ questionId, selectedAnswer }]
  const answerMap = new Map(submittedAnswers.map((a) => [String(a.questionId), a.selectedAnswer]));

  const answers = [];
  const topicTotals = new Map(); // topic -> { correct, total }

  for (const q of quiz.questions) {
    const selectedAnswer = answerMap.get(String(q._id)) ?? "";
    const isCorrect = selectedAnswer === q.correctAnswer;

    answers.push({
      questionId: q._id,
      topic: q.topic,
      selectedAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
    });

    const t = topicTotals.get(q.topic) || { correct: 0, total: 0 };
    t.total += 1;
    if (isCorrect) t.correct += 1;
    topicTotals.set(q.topic, t);
  }

  const score = answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const topicBreakdown = Array.from(topicTotals.entries()).map(([topic, v]) => ({
    topic,
    correct: v.correct,
    total: v.total,
  }));

  return { answers, score, total, percentage, topicBreakdown };
}

/**
 * Simple adaptive ranking: given a list of Topic docs (with .mastery),
 * returns them sorted so the lowest-mastery topics come first. This is
 * intentionally a plain sort, not a machine-learning model — good enough
 * for an MVP "prioritize weak topics" behavior, and easy to swap out
 * later (see TODO below).
 */
function rankTopicsForQuiz(topics) {
  return [...topics].sort((a, b) => a.mastery - b.mastery);
}

// TODO(PHASE-3):
// Replace rankTopicsForQuiz with a proper weighted sampling function so
// weak topics appear MORE OFTEN in generated quizzes rather than simply
// first. Suggested approach:
// - weight(topic) = 100 - topic.mastery (+ a small constant so mastered
//   topics still appear occasionally for retention)
// - Use weighted random sampling (e.g. roulette-wheel selection) when
//   picking which topics to send to services/geminiService.js for the
//   next adaptive quiz, instead of always picking the single weakest.
// - This is where "SQL -> 95% -> asked less often" from the spec would
//   actually get implemented.

module.exports = { scoreQuizSubmission, rankTopicsForQuiz };
