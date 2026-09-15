/**
 * services/pdfService.js
 *
 * PURPOSE:
 * Extracts and validates raw text from an uploaded PDF file so it can be
 * sent to Gemini. Isolated from noteController so the extraction logic
 * (and its TODOs) are easy to find and swap out.
 *
 * NOTE: this now takes the PDF as a Buffer (req.file.buffer from
 * multer's memoryStorage — see middleware/upload.js) instead of a
 * filesystem path. pdf-parse accepts a Buffer directly, so there's no
 * need to read anything off disk, which also makes this safe to run on
 * serverless hosts like Vercel with a read-only filesystem.
 *
 * CONNECTS TO:
 * - controllers/noteController.js (uploadNote calls extractTextFromPdf)
 */

const pdfParse = require("pdf-parse");

const MIN_USEFUL_CHARS = 50;

async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer);
  const text = (data.text || "").trim();

  if (text.length < MIN_USEFUL_CHARS) {
    throw new Error(
      "Could not extract meaningful text from this PDF. It may be a scanned image without a text layer."
    );
  }

  return text;
}

// TODO(PHASE-2):
// Support scanned/image-only PDFs via OCR. Suggested approach:
// - Detect the "too little text extracted" case (already thrown above).
// - Rasterize pages and run an OCR library (e.g. tesseract.js) as a
//   fallback path in this function.
// - Keep this behind a flag since OCR is slow; don't run it by default.

module.exports = { extractTextFromPdf };