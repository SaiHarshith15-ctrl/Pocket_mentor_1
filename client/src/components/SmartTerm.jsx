/**
 * components/SmartTerm.jsx
 *
 * PURPOSE:
 * Renders a block of text with known key terms (abbreviations/technical
 * terms) turned into clickable spans. Clicking a term opens
 * TermDrawer.jsx with an explanation fetched from POST /api/terms/explain.
 *
 * CONNECTS TO:
 * - pages/Notes.jsx (wraps note.summary with SmartText)
 * - components/TermDrawer.jsx (renders the click result)
 * - server: controllers/termController.js via services/api.js
 *
 * USAGE:
 *   <SmartText text={note.summary} keyTerms={note.keyTerms} subject={note.subject} noteId={note._id} />
 */
import { useMemo, useState } from "react";
import api from "../services/api";
import TermDrawer from "./TermDrawer";

export default function SmartText({ text, keyTerms = [], subject, noteId }) {
  const [drawerTerm, setDrawerTerm] = useState(null);
  const [loading, setLoading] = useState(false);

  const termNames = useMemo(() => keyTerms.map((k) => k.term), [keyTerms]);

  const parts = useMemo(() => {
    if (termNames.length === 0) return [text];
    // Split on any known term as a whole word (case-sensitive to avoid
    // false positives on common short words).
    const pattern = new RegExp(`\\b(${termNames.map(escapeRegex).join("|")})\\b`, "g");
    return text.split(pattern);
  }, [text, termNames]);

  async function handleClick(term) {
    setLoading(true);
    setDrawerTerm({ term, loading: true });
    try {
      const res = await api.post("/terms/explain", { term, subject, noteId });
      setDrawerTerm({ term, ...res.data.data, loading: false });
    } catch {
      setDrawerTerm({ term, explanation: "Could not load an explanation right now.", loading: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="leading-relaxed text-slate-700">
        {parts.map((part, i) =>
          termNames.includes(part) ? (
            <button
              key={i}
              onClick={() => handleClick(part)}
              className="text-brand underline decoration-dotted decoration-brand/50 underline-offset-2 hover:text-brand-dark font-medium"
            >
              {part}
            </button>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>
      {drawerTerm && (
        <TermDrawer data={drawerTerm} loading={loading} onClose={() => setDrawerTerm(null)} />
      )}
    </>
  );
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}