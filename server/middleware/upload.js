/**
 * middleware/upload.js
 *
 * PURPOSE:
 * Configures multer for note/PDF uploads: keeps the file in memory as a
 * buffer (req.file.buffer) instead of writing to disk, restricts file
 * type to PDF, and caps size to avoid abuse.
 *
 * NOTE: this used to use multer.diskStorage(), writing into
 * server/uploads/. That works locally but throws on Vercel (and most
 * serverless hosts), whose filesystem is read-only outside of /tmp —
 * that mismatch was the cause of the 500 on upload in production.
 * Memory storage avoids touching the filesystem at all, which also
 * means controllers/noteController.js no longer needs to read from or
 * clean up a temp file.
 *
 * CONNECTS TO:
 * - routes/noteRoutes.js (POST /api/notes/upload uses `upload.single("file")`)
 * - controllers/noteController.js (reads req.file.buffer)
 */

const multer = require("multer");

function fileFilter(req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;