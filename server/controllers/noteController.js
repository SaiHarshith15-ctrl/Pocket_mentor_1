/**
 * controllers/noteController.js
 *
 * PURPOSE:
 * Handles note/PDF upload and the ONE-TIME Gemini analysis pass that
 * turns raw notes into summary + topics + flashcards + quiz + key terms.
 * This is the entry point to the entire learning loop.
 *
 * CONNECTS TO:
 * - services/pdfService.js (extract text)
 * - services/geminiService.js (analyzeNotes)
 * - models/Note.js, Topic.js, Flashcard.js, Quiz.js
 * - services/masteryService.js (creates Topic rows for each importantTopic)
 * - utils/activityTracker.js (marks today as active)
 * - routes/noteRoutes.js
 */

const Note = require("../models/Note");
const Topic = require("../models/Topic");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");
const { extractTextFromPdf } = require("../services/pdfService");
const geminiService = require("../services/geminiService");
const { ensureTopic } = require("../services/masteryService");
const { recordActivity } = require("../utils/activityTracker");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/notes/upload  (multipart/form-data: file OR JSON: { text })
const uploadNote = asyncHandler(async (req, res) => {
  const { subject, title, text: pastedText } = req.body;

  if (!subject || !title) {
    throw new ApiError(400, "subject and title are required");
  }

  let rawText = "";
  let sourceType = "text";
  let originalFileName = "";

  if (req.file) {
    // multer is configured with memoryStorage (see middleware/upload.js),
    // so the PDF never touches disk — it's read straight from the
    // buffer. This is required for serverless hosts like Vercel, whose
    // filesystem is read-only outside of /tmp.
    sourceType = "pdf";
    originalFileName = req.file.originalname;
    rawText = await extractTextFromPdf(req.file.buffer);
  } else if (pastedText && pastedText.trim().length > 0) {
    rawText = pastedText.trim();
  } else {
    throw new ApiError(400, "Provide either a PDF file (field 'file') or pasted text (field 'text')");
  }

  if (rawText.length < 50) {
    throw new ApiError(400, "Note text is too short to analyze meaningfully");
  }

  const note = await Note.create({
    user: req.user._id,
    subject,
    title,
    sourceType,
    originalFileName,
    rawText,
    status: "uploaded",
  });

  await recordActivity(req.user._id);

  res.status(201).json({ success: true, data: { note } });
});

// GET /api/notes
const listNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user._id })
    .select("-rawText") // rawText can be large; omit from list view
    .sort({ createdAt: -1 });
  res.json({ success: true, data: { notes } });
});

// GET /api/notes/:id
const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError(404, "Note not found");
  res.json({ success: true, data: { note } });
});

// POST /api/notes/:id/analyze
// The single Gemini call per note. Generates + persists topics,
// flashcards, and an initial quiz. Safe to call again only if analysis
// previously failed (status !== "analyzed"), to avoid duplicate Gemini
// calls / duplicate data.
const analyzeNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError(404, "Note not found");

  if (note.status === "analyzed") {
    throw new ApiError(400, "This note has already been analyzed. Fetch its flashcards/quiz instead of re-analyzing.");
  }

  note.status = "analyzing";
  await note.save();

  let analysis;
  try {
    analysis = await geminiService.analyzeNotes(note.subject, note.rawText);
  } catch (err) {
    note.status = "failed";
    await note.save();
    throw new ApiError(502, `AI analysis failed: ${err.message}`);
  }

  note.summary = analysis.summary;
  note.keyTerms = analysis.keyTerms;
  note.status = "analyzed";
  note.analyzedAt = new Date();
  await note.save();

  // Create/update a Topic row per important topic so mastery tracking
  // (services/masteryService.js) has something to update later.
  await Promise.all(
    analysis.importantTopics.map((t) =>
      ensureTopic(req.user._id, note.subject, t.name, {
        note: note._id,
        importance: t.importance,
        shortExplanation: t.shortExplanation,
      })
    )
  );

  const flashcards = await Flashcard.insertMany(
    analysis.flashcards.map((f) => ({
      user: req.user._id,
      subject: note.subject,
      topic: f.topic,
      note: note._id,
      question: f.question,
      answer: f.answer,
      difficulty: f.difficulty,
      origin: "initial",
    }))
  );

  const quiz = await Quiz.create({
    user: req.user._id,
    subject: note.subject,
    note: note._id,
    type: "initial",
    questions: analysis.quiz,
  });

  await recordActivity(req.user._id);

  res.json({
    success: true,
    data: { note, flashcardsCreated: flashcards.length, quiz },
  });
});

// GET /api/notes/:id/quiz
// Looks up the quiz generated for this note, so the Notes page can link
// "Take Quiz" for a note that was already analyzed in a previous visit
// (the quiz id isn't otherwise persisted anywhere the frontend can see).
const getNoteQuiz = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError(404, "Note not found");

  const quiz = await Quiz.findOne({ note: note._id, user: req.user._id }).sort({ createdAt: -1 });
  if (!quiz) throw new ApiError(404, "No quiz found for this note yet — analyze it first");

  res.json({ success: true, data: quiz });
});

// DELETE /api/notes/:id
// Removes the note along with all associated flashcards, quizzes, and topics created for it
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError(404, "Note not found");

  await Promise.all([
    Note.deleteOne({ _id: note._id }),
    Flashcard.deleteMany({ note: note._id, user: req.user._id }),
    Quiz.deleteMany({ note: note._id, user: req.user._id }),
    Topic.deleteMany({ note: note._id, user: req.user._id }),
  ]);

  res.json({ success: true, message: "Note and all generated study materials deleted" });
});

module.exports = { uploadNote, listNotes, getNote, analyzeNote, getNoteQuiz, deleteNote };