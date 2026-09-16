/**
 * routes/noteRoutes.js
 * Mounts: /api/notes
 * PURPOSE: upload, list, fetch, and AI-analyze notes (all protected).
 */
const express = require("express");
const { uploadNote, listNotes, getNote, analyzeNote, getNoteQuiz, deleteNote } = require("../controllers/noteController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadNote);
router.get("/", protect, listNotes);
router.get("/:id", protect, getNote);
router.post("/:id/analyze", protect, analyzeNote);
router.get("/:id/quiz", protect, getNoteQuiz);
router.delete("/:id", protect, deleteNote);

module.exports = router;