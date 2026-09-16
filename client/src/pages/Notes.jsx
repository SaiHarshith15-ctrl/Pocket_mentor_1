/**
 * pages/Notes.jsx
 * Upload a PDF or paste text, list existing notes, trigger the one-time
 * AI analysis, view the resulting summary & key terms, delete notes,
 * and seamlessly transition to Flashcards and Quizzes.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SmartText from "../components/SmartTerm";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(null);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [quizLoadingId, setQuizLoadingId] = useState(null);

  function loadNotes() {
    api.get("/notes").then((res) => setNotes(res.data.data.notes));
  }

  useEffect(loadNotes, []);

  async function handleUpload(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!subject || !title || (!text && !file)) {
      setError("Subject, title, and either a PDF or pasted text are required.");
      return;
    }
    setUploading(true);
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append("subject", subject);
        formData.append("title", title);
        formData.append("file", file);
        res = await api.post("/notes/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/notes/upload", { subject, title, text });
      }
      const newNoteId = res.data.data.note._id;
      setSubject("");
      setTitle("");
      setText("");
      setFile(null);
      loadNotes();

      setSuccessMsg("Notes uploaded! Analyzing with AI...");
      await handleAnalyze(newNoteId);
      setExpandedId(newNoteId);
      setSuccessMsg("Analysis complete! Flashcards & Quiz ready.");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze(noteId) {
    setAnalyzingId(noteId);
    setError("");
    try {
      await api.post(`/notes/${noteId}/analyze`);
      loadNotes();
      setExpandedId(noteId);
    } catch (err) {
      setError(err.response?.data?.message || "AI Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  }

  async function handleDeleteNote(noteId) {
    setDeletingId(noteId);
    setError("");
    try {
      await api.delete(`/notes/${noteId}`);
      setConfirmDeleteId(null);
      loadNotes();
      setSuccessMsg("Note and all generated study materials deleted.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete note");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleTakeQuiz(noteId) {
    setQuizLoadingId(noteId);
    setError("");
    try {
      const res = await api.get(`/notes/${noteId}/quiz`);
      navigate(`/quiz/${res.data.data.quiz._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find a quiz for this note");
    } finally {
      setQuizLoadingId(null);
    }
  }

  if (!notes) return <LoadingSpinner full />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      className="space-y-6 max-w-4xl mx-auto py-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Class Notes & Material
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload PDFs or paste lecture notes to auto-generate flashcards, summaries, and quizzes.
          </p>
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="hover:text-emerald-900 ml-2">
              ✕
            </button>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="hover:text-rose-900 ml-2">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Form Card */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleUpload}
        className="card card-hover space-y-3.5 border-brand/20 bg-white/95 dark:bg-slate-900/90 shadow-md"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>📥</span> Upload New Class Notes
          </p>
          <span className="text-[11px] text-slate-400">PDF or Text supported</span>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="input-field"
            placeholder="Subject (e.g. Operating Systems, DBMS)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="Topic Title (e.g. CPU Scheduling & Deadlocks)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <textarea
          className="input-field h-28 resize-y text-xs leading-relaxed"
          placeholder="Paste lecture notes or lecture transcription here, or select a PDF below…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors inline-flex items-center gap-1.5">
              <span>📎</span>
              <span>{file ? file.name : "Attach PDF"}</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-xs text-rose-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          <button className="btn-primary text-xs px-6 py-2.5 flex items-center justify-center gap-2" disabled={uploading}>
            {uploading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing & Analyzing…</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Upload & Generate Study Tools</span>
              </>
            )}
          </button>
        </div>
      </motion.form>

      {/* Notes List */}
      <motion.div variants={itemVariants} className="space-y-3 pt-2">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span>Your Notes Collection ({notes.length})</span>
        </h2>

        <div className="grid gap-3.5">
          {notes.map((n) => {
            const isAnalyzed = n.status === "analyzed";
            const isExpanded = expandedId === n._id;
            const isConfirmingDelete = confirmDeleteId === n._id;

            return (
              <motion.div
                key={n._id}
                layout
                className="card card-hover bg-white/95 dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">
                        {n.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[11px] font-bold border border-brand/20">
                        {n.subject}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isAnalyzed
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        {isAnalyzed ? "✓ Analyzed" : "Pending Analysis"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Source: {n.sourceType?.toUpperCase()} · Added{" "}
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
                    {!isAnalyzed && (
                      <button
                        className="btn-primary text-xs py-1.5 px-3"
                        onClick={() => handleAnalyze(n._id)}
                        disabled={analyzingId === n._id}
                      >
                        {analyzingId === n._id ? "Analyzing…" : "Analyze"}
                      </button>
                    )}

                    {isAnalyzed && (
                      <button
                        className="btn-secondary text-xs py-1.5 px-3"
                        onClick={() => setExpandedId(isExpanded ? null : n._id)}
                      >
                        {isExpanded ? "Hide Summary" : "View Summary"}
                      </button>
                    )}

                    {/* Delete button & confirmation */}
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 animate-pop-in">
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 px-1.5">
                          Delete?
                        </span>
                        <button
                          className="px-2 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                          onClick={() => handleDeleteNote(n._id)}
                          disabled={deletingId === n._id}
                        >
                          {deletingId === n._id ? "..." : "Yes"}
                        </button>
                        <button
                          className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition-all"
                        onClick={() => setConfirmDeleteId(n._id)}
                        title="Delete this note & its flashcards"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Summary */}
                <AnimatePresence>
                  {isAnalyzed && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 overflow-hidden space-y-3"
                    >
                      <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                          60-Second AI Summary:
                        </p>
                        <SmartText text={n.summary} keyTerms={n.keyTerms} subject={n.subject} noteId={n._id} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Action Buttons */}
                {isAnalyzed && (
                  <div className="flex gap-2.5 mt-3.5 pt-3 border-t border-slate-100/80 dark:border-slate-800/60">
                    <button
                      className="btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
                      onClick={() => navigate(`/flashcards?subject=${encodeURIComponent(n.subject)}`)}
                    >
                      <span>🗂️</span>
                      <span>Review Flashcards</span>
                    </button>
                    <button
                      className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
                      onClick={() => handleTakeQuiz(n._id)}
                      disabled={quizLoadingId === n._id}
                    >
                      <span>📝</span>
                      <span>{quizLoadingId === n._id ? "Loading Quiz…" : "Take Quiz"}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}

          {notes.length === 0 && (
            <div className="card text-center py-12 space-y-2">
              <p className="text-4xl">📂</p>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                No notes uploaded yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload your lecture notes above to automatically generate revision flashcards, summaries, and quizzes!
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}