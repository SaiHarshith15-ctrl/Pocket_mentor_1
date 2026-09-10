/**
 * pages/Notes.jsx
 * Upload a PDF or paste text, list existing notes, trigger the one-time
 * AI analysis, and show the resulting summary/key terms (via SmartText)
 * once analyzed, with links into Flashcards/Quiz.
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
  const [activeNote, setActiveNote] = useState(null);
  const [quizId, setQuizId] = useState(null);

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
      setSubject("");
      setTitle("");
      setText("");
      setFile(null);
      loadNotes();

      // Immediately kick off analysis for a smoother demo flow.
      await handleAnalyze(res.data.data.note._id);
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
      const res = await api.post(`/notes/${noteId}/analyze`);
      setQuizId(res.data.data.quiz._id);
      loadNotes();
      setActiveNote(res.data.data.note);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  }

  if (!notes) return <LoadingSpinner full />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notes</h1>

      <form onSubmit={handleUpload} className="card space-y-3">
        <p className="text-sm font-medium">Upload new notes</p>
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
          className="text-sm text-slate-400"
        />
        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary" disabled={uploading}>
          {uploading ? "Uploading & analyzing…" : "Upload & Analyze"}
        </button>
      </form>

      <div className="grid gap-4">
        {notes.map((n) => (
          <div key={n._id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-xs text-slate-500">
                  {n.subject} · {n.sourceType.toUpperCase()} · {n.status}
                </p>
              </div>
              {n.status !== "analyzed" && (
                <button
                  className="btn-secondary text-sm"
                  onClick={() => handleAnalyze(n._id)}
                  disabled={analyzingId === n._id}
                >
                  {analyzingId === n._id ? "Analyzing…" : "Analyze"}
                </button>
              )}
            </div>

            {activeNote?._id === n._id && (
              <div className="mt-4 space-y-3">
                <SmartText
                  text={activeNote.summary}
                  keyTerms={activeNote.keyTerms}
                  subject={activeNote.subject}
                  noteId={activeNote._id}
                />
                <div className="flex gap-3">
                  <button className="btn-secondary text-sm" onClick={() => navigate("/flashcards")}>
                    Review Flashcards
                  </button>
                  {quizId && (
                    <button className="btn-primary text-sm" onClick={() => navigate(`/quiz/${quizId}`)}>
                      Take Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {notes.length === 0 && <p className="text-slate-500">No notes yet — upload your first one above.</p>}
      </div>
    </div>
  );
}
