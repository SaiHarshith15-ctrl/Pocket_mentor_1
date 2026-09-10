/**
 * controllers/termController.js
 *
 * PURPOSE:
 * Backs the SmartTerm / TermDrawer UI (see client) — when a student
 * clicks a technical term or abbreviation in a note/flashcard, this
 * returns an explanation. Prefers already-stored Note.keyTerms (no AI
 * call) and only calls Gemini for terms not already analyzed.
 *
 * CONNECTS TO:
 * - models/Note.js (keyTerms saved during note analysis)
 * - services/geminiService.js (generateTopicExplanation, fallback)
 * - routes/termRoutes.js
 */

const Note = require("../models/Note");
const geminiService = require("../services/geminiService");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/terms/explain  { term, subject, noteId? }
const explainTerm = asyncHandler(async (req, res) => {
  const { term, subject, noteId } = req.body;
  if (!term || !subject) throw new ApiError(400, "term and subject are required");

  // 1. Check if this term was already extracted during note analysis —
  //    avoids a redundant Gemini call for terms we already explained.
  if (noteId) {
    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    const existing = note?.keyTerms.find(
      (k) => k.term.toLowerCase() === term.toLowerCase()
    );
    if (existing) {
      return res.json({ success: true, data: { ...existing.toObject(), related: [], cached: true } });
    }
  }

  // 2. Otherwise ask Gemini (or mock service) for a fresh explanation.
  const explanation = await geminiService.generateTopicExplanation(subject, term);
  res.json({ success: true, data: { ...explanation, cached: false } });
});

module.exports = { explainTerm };
