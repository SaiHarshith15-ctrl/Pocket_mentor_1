/**
 * controllers/mentorController.js
 *
 * PURPOSE:
 * Builds the student's real learning context (department, year,
 * subjects, weak topics, recent activity) and passes it into
 * geminiService.chat() so the AI Mentor's replies are grounded instead
 * of generic. Conversation history is passed in by the client per
 * request (no server-side chat session storage in this MVP — see TODO).
 *
 * CONNECTS TO:
 * - services/geminiService.js (chat)
 * - services/masteryService.js (getWeakestTopics)
 * - routes/mentorRoutes.js
 */

const { getWeakestTopics } = require("../services/masteryService");
const geminiService = require("../services/geminiService");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

async function buildUserContext(user) {
  const weak = await getWeakestTopics(user._id, null, 5);
  return {
    department: user.department,
    year: user.year,
    subjects: user.subjects,
    currentStreak: user.currentStreak,
    weakTopics: weak.map((t) => ({ name: t.name, subject: t.subject, mastery: t.mastery })),
  };
}

// POST /api/mentor/chat  { message, history?: [{role, content}] }
const chatWithMentor = asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== "string") {
    throw new ApiError(400, "message is required");
  }

  const userContext = await buildUserContext(req.user);
  const conversationHistory = Array.isArray(history) ? history.slice(-10) : [];

  let reply;
  try {
    reply = await geminiService.chat(userContext, conversationHistory, message);
  } catch (err) {
    throw new ApiError(502, `AI Mentor failed to respond: ${err.message}`);
  }

  res.json({
    success: true,
    data: {
      reply,
      suggestedTopic: userContext.weakTopics[0] || null,
    },
  });
});

// TODO(PHASE-2):
// Persist mentor conversations in a dedicated MentorMessage/Conversation
// model instead of relying on the client to resend history on every
// request. Suggested approach:
// - Add models/MentorConversation.js: { user, messages: [{role, content, createdAt}] }
// - GET /api/mentor/history to load past conversation on page load.
// - Append to it inside chatWithMentor instead of trusting req.body.history.

module.exports = { chatWithMentor };
