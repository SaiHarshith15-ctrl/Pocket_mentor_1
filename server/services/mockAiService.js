/**
 * services/mockAiService.js
 *
 * PURPOSE:
 * Provides realistic sample responses for every AI operation, shaped
 * EXACTLY like the real Gemini output. Used when USE_MOCK_AI=true so the
 * whole app (upload -> analyze -> flashcards -> quiz -> rescue -> mentor)
 * can be demoed/developed without any API key or quota usage.
 *
 * CONNECTS TO:
 * - services/geminiService.js (delegates to this when USE_MOCK_AI=true)
 * - seed/seed.js (uses the same sample shapes for seed data)
 */

function mockAnalyzeNotes(subject) {
  return {
    summary:
      `These notes cover core ${subject} concepts including data organization, ` +
      `normalization, transactions, and indexing, with an emphasis on reducing ` +
      `redundancy and keeping data consistent under concurrent access.`,
    importantTopics: [
      { name: "Normalization", importance: "high", shortExplanation: "Organizing tables to reduce redundancy and avoid update anomalies." },
      { name: "Transactions", importance: "high", shortExplanation: "Groups of operations that must succeed or fail together (ACID)." },
      { name: "Indexing", importance: "medium", shortExplanation: "Data structures that speed up lookups at the cost of extra storage." },
      { name: "SQL", importance: "medium", shortExplanation: "The query language used to read and write relational data." },
    ],
    flashcards: [
      { question: "What is the goal of normalization?", answer: "To reduce data redundancy and prevent update/insert/delete anomalies by organizing tables logically.", topic: "Normalization", difficulty: "easy" },
      { question: "What does 1NF require?", answer: "Every column must hold atomic (indivisible) values, and each row must be unique.", topic: "Normalization", difficulty: "easy" },
      { question: "What does BCNF fix that 3NF does not?", answer: "BCNF removes remaining anomalies caused by certain functional dependencies on candidate keys that 3NF allows.", topic: "Normalization", difficulty: "hard" },
      { question: "What does the 'A' in ACID stand for?", answer: "Atomicity — a transaction's operations either all happen or none do.", topic: "Transactions", difficulty: "easy" },
      { question: "What is a deadlock?", answer: "A situation where two or more transactions wait forever for locks held by each other.", topic: "Transactions", difficulty: "medium" },
      { question: "Why use an index?", answer: "To speed up read/search queries by avoiding a full table scan.", topic: "Indexing", difficulty: "easy" },
    ],
    quiz: [
      {
        question: "A table is in 1NF but has a non-key column depending on only part of a composite key. Which normal form does it violate?",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        correctAnswer: "2NF",
        explanation: "2NF requires every non-key attribute to depend on the WHOLE candidate key, not just part of it.",
        topic: "Normalization",
        difficulty: "medium",
      },
      {
        question: "Which property of ACID guarantees the database moves from one valid state to another?",
        options: ["Atomicity", "Consistency", "Isolation", "Durability"],
        correctAnswer: "Consistency",
        explanation: "Consistency ensures a transaction only brings the database from one valid state to another valid state.",
        topic: "Transactions",
        difficulty: "medium",
      },
      {
        question: "What is the main tradeoff of adding more indexes to a table?",
        options: ["Faster reads, slower writes", "Slower reads, faster writes", "No effect on performance", "Indexes only affect storage cost"],
        correctAnswer: "Faster reads, slower writes",
        explanation: "Indexes speed up lookups but must be updated on every insert/update/delete, slowing writes.",
        topic: "Indexing",
        difficulty: "medium",
      },
      {
        question: "Which SQL clause is used to filter grouped rows after aggregation?",
        options: ["WHERE", "GROUP BY", "HAVING", "ORDER BY"],
        correctAnswer: "HAVING",
        explanation: "WHERE filters rows before grouping; HAVING filters groups after aggregation.",
        topic: "SQL",
        difficulty: "easy",
      },
    ],
    keyTerms: [
      { term: "NF", fullForm: "Normal Form", explanation: "A standard used to organize database tables and reduce redundancy (1NF -> 2NF -> 3NF -> BCNF)." },
      { term: "ACID", fullForm: "Atomicity, Consistency, Isolation, Durability", explanation: "The four properties that guarantee reliable database transactions." },
      { term: "DBMS", fullForm: "Database Management System", explanation: "Software that manages storage, retrieval, and security of data in a database." },
      { term: "BCNF", fullForm: "Boyce-Codd Normal Form", explanation: "A stricter version of 3NF that removes remaining anomalies from certain functional dependencies." },
    ],
  };
}

function mockTargetedRevision(topic) {
  return {
    explanation:
      `${topic} is about organizing data so nothing is duplicated unnecessarily ` +
      `and every fact lives in exactly one place. Think of it as splitting a messy ` +
      `spreadsheet into clean, related tables. Each normal form (1NF, 2NF, 3NF, BCNF) ` +
      `removes a specific kind of redundancy. Getting this wrong causes update anomalies ` +
      `— e.g. changing a customer's address in one row but not another.`,
    flashcards: [
      { question: `In one sentence, what problem does ${topic} solve?`, answer: "It removes redundant data so the same fact isn't duplicated across rows, avoiding inconsistent updates.", topic, difficulty: "easy" },
      { question: `What is an update anomaly related to ${topic}?`, answer: "When the same piece of data is stored in multiple places and updating one copy but not another leaves the database inconsistent.", topic, difficulty: "medium" },
      { question: `What's the correct order of normal forms?`, answer: "1NF -> 2NF -> 3NF -> BCNF, each stricter than the last.", topic, difficulty: "medium" },
    ],
    quiz: [
      {
        question: `A student says "normalizing a table just means adding more columns." Is this correct?`,
        options: ["Yes, always", "No — it usually means splitting data into more tables, not columns", "Only for 1NF", "Only for BCNF"],
        correctAnswer: "No — it usually means splitting data into more tables, not columns",
        explanation: "Normalization typically splits one table into multiple related tables to remove redundancy.",
        topic,
        difficulty: "medium",
      },
      {
        question: `Which of these is the best example of an update anomaly?`,
        options: [
          "A student's course grade appears once and is correct",
          "A student's address is stored in 10 rows and only 3 get updated",
          "A table has a primary key",
          "A query uses an index",
        ],
        correctAnswer: "A student's address is stored in 10 rows and only 3 get updated",
        explanation: "That is the classic update anomaly caused by redundant/un-normalized data.",
        topic,
        difficulty: "medium",
      },
      {
        question: `What is the minimum normal form most production databases aim for?`,
        options: ["1NF", "2NF", "3NF", "6NF"],
        correctAnswer: "3NF",
        explanation: "3NF is the common practical target, balancing redundancy reduction with query simplicity.",
        topic,
        difficulty: "easy",
      },
    ],
  };
}

function mockMentorReply(userMessage, userContext) {
  const weakest = userContext.weakTopics?.[0];
  const lower = userMessage.toLowerCase();

  if (lower.includes("minute")) {
    const minutesMatch = lower.match(/(\d+)\s*min/);
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 20;
    const flash = Math.max(3, Math.round(minutes * 0.25));
    const revise = Math.max(5, Math.round(minutes * 0.4));
    const quiz = Math.max(5, minutes - flash - revise);
    return (
      `Got it — here's a ${minutes} minute sprint on ${weakest?.name || "your weakest topic"}:\n` +
      `${flash} min -> flashcards, ${revise} min -> targeted revision, ${quiz} min -> quiz. ` +
      `Start with Rescue Mode and I'll track the improvement.`
    );
  }

  if (weakest) {
    return (
      `Based on your recent performance, I'd focus on ${weakest.name} next — ` +
      `you're at ${weakest.mastery}% mastery there, your lowest topic right now. ` +
      `Want me to start Rescue Mode for it?`
    );
  }

  return "You're in solid shape across your topics right now — keep reviewing flashcards to stay sharp, or upload a new set of notes to expand what I can quiz you on.";
}

function mockExplanation(term) {
  return {
    term,
    fullForm: "",
    explanation: `${term} is a term that appeared in your notes. This is a mock explanation — enable the real Gemini API for a grounded answer.`,
    related: [],
  };
}

module.exports = {
  mockAnalyzeNotes,
  mockTargetedRevision,
  mockMentorReply,
  mockExplanation,
};
