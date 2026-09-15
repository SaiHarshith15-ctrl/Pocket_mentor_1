/**
 * pages/Notes.jsx
 * Upload a PDF or paste text, list existing notes, trigger the one-time
 * AI analysis, and show the resulting summary/key terms (via SmartText)
 * for ANY analyzed note — not just the one most recently analyzed —
 * with links into Flashcards/Quiz.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SmartText from "../components/SmartTerm";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(null);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [quizLoadingId, setQuizLoadingId] = useState(null);

  function loadNotes() {
    api.get("/notes").then((res) => setNotes(res.data.data.notes));
  }

  useEffect(loadNotes, []);

  async function handleUpload(e) {
    e.preventDefault();
    setError("");
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

      // Immediately kick off analysis for a smoother demo flow, and
      // auto-expand it once done so the buttons are visible right away.
      await handleAnalyze(newNoteId);
      setExpandedId(newNoteId);
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
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzingId(null);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Notes</h1>

      <form onSubmit={handleUpload} className="card card-hover space-y-3">
        <p className="text-sm font-semibold text-slate-700">Upload new notes</p>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="input-field"
            placeholder="Subject (e.g. DBMS)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="Title (e.g. Unit 3 - Normalization)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <textarea
          className="input-field h-28"
          placeholder="Paste notes here, or upload a PDF below…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm text-slate-500"
        />
        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary" disabled={uploading}>
          {uploading ? "Uploading & analyzing…" : "Upload & Analyze"}
        </button>
      </form>

      <div className="grid gap-4">
        {notes.map((n) => {
          const isAnalyzed = n.status === "analyzed";
          const isExpanded = expandedId === n._id;

          return (
            <div key={n._id} className="card card-hover">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-400">
                    {n.subject} · {n.sourceType.toUpperCase()} · {n.status}
                  </p>
                </div>

                {!isAnalyzed && (
                  <button
                    className="btn-secondary text-sm"
                    onClick={() => handleAnalyze(n._id)}
                    disabled={analyzingId === n._id}
                  >
                    {analyzingId === n._id ? "Analyzing…" : "Analyze"}
                  </button>
                )}

                {isAnalyzed && (
                  <button
                    className="btn-secondary text-sm"
                    onClick={() => setExpandedId(isExpanded ? null : n._id)}
                  >
                    {isExpanded ? "Hide Summary" : "View Summary"}
                  </button>
                )}
              </div>

              {isAnalyzed && isExpanded && (
                <div className="mt-4 space-y-3">
                  <SmartText text={n.summary} keyTerms={n.keyTerms} subject={n.subject} noteId={n._id} />
                </div>
              )}

              {isAnalyzed && (
                <div className="flex gap-3 mt-4">
                  <button className="btn-secondary text-sm" onClick={() => navigate("/flashcards")}>
                    Review Flashcards
                  </button>
                  <button
                    className="btn-primary text-sm"
                    onClick={() => handleTakeQuiz(n._id)}
                    disabled={quizLoadingId === n._id}
                  >
                    {quizLoadingId === n._id ? "Loading…" : "Take Quiz"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {notes.length === 0 && <p className="text-slate-500">No notes yet — upload your first one above.</p>}
      </div>
    </div>
  );
}