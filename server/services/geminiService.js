/**
 * services/geminiService.js
 *
 * PURPOSE:
 * Central service for all Gemini AI operations. Every controller that
 * needs AI output goes through here — no controller calls the Gemini
 * SDK directly.
 *
 * CONNECTS TO:
 * - controllers/noteController.js (analyzeNotes)
 * - controllers/rescueController.js (generateTargetedRevision)
 * - controllers/mentorController.js (chat)
 * - controllers/flashcardController.js / termController (generateTopicExplanation)
 * - prompts/prompts.js (prompt templates)
 * - services/mockAiService.js (used when USE_MOCK_AI=true, AND as an
 *   automatic fallback if Gemini is unavailable in real mode — see
 *   RELIABILITY STRATEGY below)
 *
 * GEMINI FREE-TIER STRATEGY:
 * - analyzeNotes() is called ONCE per uploaded note. Its output (summary,
 *   topics, flashcards, quiz, key terms) is persisted to MongoDB and never
 *   regenerated for that note.
 * - Later features (flashcards page, quiz page, dashboard) read from
 *   MongoDB, NOT from Gemini again.
 * - Gemini is only called again for: Rescue Mode targeted content, AI
 *   Mentor chat replies, and on-demand term explanations.
 *
 * RELIABILITY STRATEGY (retry + fallback):
 * Gemini occasionally returns transient errors (503 "model overloaded",
 * 429 rate limit) that have nothing to do with your code or key. Every
 * public function below:
 *   1. Retries the Gemini call a couple of times with backoff if the
 *      error looks transient.
 *   2. If it's still failing after retries, falls back to the same mock
 *      data used in USE_MOCK_AI=true mode instead of throwing — so a
 *      live demo degrades gracefully to "still works, just not freshly
 *      AI-generated this one time" instead of visibly erroring out.
 * This fallback only triggers on request-level failures (network/
 * availability/rate-limit/bad-JSON). It does not run instead of Gemini
 * by default — real mode still calls Gemini first every time.
 *
 * IMPORTANT:
 * GEMINI_API_KEY comes from process.env.GEMINI_API_KEY. Set
 * USE_MOCK_AI=true in .env to avoid consuming real API quota during
 * development — see services/mockAiService.js for the fallback data.
 *
 * MODEL NAME:
 * Google retires Gemini model IDs on a rolling basis. Always set
 * GEMINI_MODEL explicitly in your environment rather than relying on
 * the fallback below — check https://ai.google.dev/gemini-api/docs/models
 * for the current stable model name if you start seeing 404 "no longer
 * available" errors (different from the transient 503s this file
 * retries around).
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const mock = require("./mockAiService");
const {
  noteAnalysisPrompt,
  targetedRevisionPrompt,
  mentorPrompt,
  explanationPrompt,
} = require("../prompts/prompts");

function isMockMode() {
  return String(process.env.USE_MOCK_AI).toLowerCase() === "true";
}

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is missing. Set USE_MOCK_AI=true in .env for development without a key."
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.6-flash" });
}

// ---------------------------------------------------------------------
// Retry helper — only retries errors that look transient (rate limit /
// overloaded / network blip). A 404 "model no longer available" or a
// bad-JSON parse error is NOT transient, so it fails fast instead of
// wasting time retrying something that will never succeed.
// ---------------------------------------------------------------------

const TRANSIENT_ERROR_RE = /(503|429|overloaded|service unavailable|rate limit|ECONNRESET|ETIMEDOUT|fetch failed)/i;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(fn, { retries = 2, baseDelayMs = 1200 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isTransient = TRANSIENT_ERROR_RE.test(err.message || "");
      const hasAttemptsLeft = attempt < retries;
      if (!isTransient || !hasAttemptsLeft) throw err;
      await sleep(baseDelayMs * (attempt + 1));
    }
  }
  throw lastErr;
}

/**
 * Runs a real-Gemini call with retries; if it still fails, logs the
 * reason and returns the mock fallback instead of throwing. Used by
 * every public function below so a flaky Gemini API never surfaces as
 * a broken feature during a demo.
 */
async function withFallback(label, geminiCall, mockFallback) {
  try {
    return await withRetry(geminiCall);
  } catch (err) {
    console.error(`[geminiService] ${label} failed after retries, falling back to mock data: ${err.message}`);
    return mockFallback();
  }
}

/**
 * Sends a prompt to Gemini and parses the response as JSON.
 * Strips accidental markdown code fences before parsing, and throws a
 * clear error if Gemini did not return valid JSON so callers can decide
 * how to handle a bad AI response instead of silently saving garbage.
 */
async function callGeminiJSON(prompt) {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini returned invalid JSON: ${err.message}`);
  }
}

/**
 * Sends a plain-text prompt to Gemini (used for the mentor chat, which
 * is conversational rather than structured).
 */
async function callGeminiText(prompt) {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ---------------------------------------------------------------------
// Validation helpers — never trust raw AI output blindly.
// ---------------------------------------------------------------------

function validateAnalysis(data) {
  const required = ["summary", "importantTopics", "flashcards", "quiz", "keyTerms"];
  for (const key of required) {
    if (!(key in data)) throw new Error(`AI analysis missing required field: ${key}`);
  }
  if (!Array.isArray(data.importantTopics) || data.importantTopics.length === 0) {
    throw new Error("AI analysis returned no importantTopics");
  }
  if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
    throw new Error("AI analysis returned no quiz questions");
  }
  // Every quiz question's correctAnswer must be one of its options
  for (const q of data.quiz) {
    if (!Array.isArray(q.options) || !q.options.includes(q.correctAnswer)) {
      throw new Error(`Quiz question "${q.question}" has a correctAnswer not present in options`);
    }
  }
  return data;
}

function validateRevision(data) {
  if (!data.explanation || !Array.isArray(data.flashcards) || !Array.isArray(data.quiz)) {
    throw new Error("AI targeted revision response missing required fields");
  }
  for (const q of data.quiz) {
    if (!Array.isArray(q.options) || !q.options.includes(q.correctAnswer)) {
      throw new Error("Rescue quiz question has a correctAnswer not present in options");
    }
  }
  return data;
}

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

/**
 * ONE major analysis call per uploaded note. Returns summary, topics,
 * flashcards, an initial quiz, and key terms — see prompts.noteAnalysisPrompt
 * for the exact JSON shape.
 */
async function analyzeNotes(subject, text) {
  if (isMockMode()) return mock.mockAnalyzeNotes(subject);
  return withFallback(
    "analyzeNotes",
    async () => validateAnalysis(await callGeminiJSON(noteAnalysisPrompt(subject, text))),
    () => mock.mockAnalyzeNotes(subject)
  );
}

/**
 * Used by Notes page / re-generation flows if a caller only wants
 * flashcards from already-extracted text (thin wrapper kept separate so
 * controllers can be explicit about intent; internally reuses the same
 * one-call analysis in real mode to avoid a second Gemini call).
 */
async function generateFlashcards(subject, text) {
  const analysis = await analyzeNotes(subject, text);
  return analysis.flashcards;
}

async function generateQuiz(subject, text) {
  const analysis = await analyzeNotes(subject, text);
  return analysis.quiz;
}

/**
 * The Rescue Mode core call: given a weak topic (and optional context
 * text from the student's original notes), returns a focused
 * explanation + 3 flashcards + 3 NEW quiz questions.
 */
async function generateTargetedRevision(subject, topic, contextText) {
  if (isMockMode()) return mock.mockTargetedRevision(topic);
  return withFallback(
    "generateTargetedRevision",
    async () => validateRevision(await callGeminiJSON(targetedRevisionPrompt(subject, topic, contextText))),
    () => mock.mockTargetedRevision(topic)
  );
}

/**
 * Explains a single clicked SmartTerm (abbreviation or technical term).
 */
async function generateTopicExplanation(subject, term) {
  if (isMockMode()) return mock.mockExplanation(term);
  return withFallback(
    "generateTopicExplanation",
    () => callGeminiJSON(explanationPrompt(subject, term)),
    () => mock.mockExplanation(term)
  );
}

/**
 * AI Mentor chat reply. userContext should include department/year/
 * subjects/weakTopics/recentActivity so the reply is grounded in real
 * data (see controllers/mentorController.js for how context is built).
 */
async function chat(userContext, conversationHistory, userMessage) {
  if (isMockMode()) return mock.mockMentorReply(userMessage, userContext);
  return withFallback(
    "chat",
    () => callGeminiText(mentorPrompt(userContext, conversationHistory, userMessage)),
    () => mock.mockMentorReply(userMessage, userContext)
  );
}

/**
 * TODO(PHASE-2):
 * Implement evaluateAnswer() for free-text (non-multiple-choice)
 * answers, e.g. short-answer questions. Suggested approach:
 * - Send { question, correctAnswer, studentAnswer } to Gemini.
 * - Ask for JSON: { isCorrect: boolean, feedback: string, score: 0-1 }.
 * - Use this in a future "short answer quiz" mode; the current MVP only
 *   supports multiple choice, which is graded locally without AI (see
 *   controllers/quizController.js submitQuiz).
 *
 * TODO(PHASE-2):
 * Implement generateStudyRecommendation() as a dedicated structured
 * call (separate from chat()) that returns a ranked list of
 * { topic, reason, suggestedMinutes } for a "What should I study today"
 * widget, instead of parsing it out of a free-text mentor reply.
 */

module.exports = {
  analyzeNotes,
  generateFlashcards,
  generateQuiz,
  generateTargetedRevision,
  generateTopicExplanation,
  chat,
  isMockMode,
};