/**
 * middleware/upload.js
 *
 * PURPOSE:
 * Configures multer for note/PDF uploads: stores files in server/uploads,
 * restricts file type to PDF, and caps size to avoid abuse.
 *
 * CONNECTS TO:
 * - routes/noteRoutes.js (POST /api/notes/upload uses `upload.single("file")`)
 * - controllers/noteController.js (reads req.file.path)
 */

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
