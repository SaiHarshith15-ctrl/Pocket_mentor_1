/**
 * models/Note.js
 *
 * PURPOSE:
 * Stores an uploaded note (PDF text or pasted text) plus the ONE big
 * Gemini analysis result generated from it (summary, key terms). This is
 * the "raw material" a Topic/Flashcard/Quiz set is generated from.
 *
 * CONNECTS TO:
 * - controllers/noteController.js (upload + analyze)
 * - services/geminiService.js (analyzeNotes() output is stored here)
 * - models/Topic.js, Flashcard.js, Quiz.js (reference this note's _id)
 *
 * IMPORTANT:
 * We store the extracted rawText so we NEVER have to re-parse the PDF or
 * call Gemini twice for the same note (see Gemini free-tier optimization
 * strategy in the README).
 */

const mongoose = require("mongoose");

const keyTermSchema = new mongoose.Schema(
  {
    term: { type: String, required: true },
    fullForm: { type: String, default: "" },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    sourceType: { type: String, enum: ["pdf", "text"], default: "text" },
    originalFileName: { type: String, default: "" },

    rawText: { type: String, required: true }, // extracted/pasted text
    summary: { type: String, default: "" },
    keyTerms: [keyTermSchema],

    status: {
      type: String,
      enum: ["uploaded", "analyzing", "analyzed", "failed"],
      default: "uploaded",
    },
    analyzedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
