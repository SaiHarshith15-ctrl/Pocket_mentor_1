/**
 * components/TermDrawer.jsx
 * Slide-in side panel showing an explanation for a clicked SmartTerm.
 * Purely presentational — data comes from SmartTerm.jsx's fetch.
 *
 * TODO(FRONTEND):
 * Wire up the "Add to Flashcards" button to POST a new flashcard from
 * this term. Backend already supports creating flashcards; you'll need
 * a small `POST /api/flashcards` endpoint (not yet implemented — the
 * current flashcardController only lists/reviews cards created by note
 * analysis or Rescue Mode). Add a `createFlashcard` controller function
 * that accepts { subject, topic, question, answer } and reuse it here.
 */
export default function TermDrawer({ data, loading, onClose }) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto">
        <button onClick={onClose} className="text-slate-400 hover:text-white mb-4">
          ✕ Close
        </button>

        {loading ? (
          <p className="text-slate-400">Loading explanation…</p>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-1">{data.fullForm || data.term}</h3>
            {data.fullForm && <p className="text-sm text-slate-500 mb-4">{data.term}</p>}
            <p className="text-slate-300 leading-relaxed mb-4">{data.explanation}</p>

            {data.related?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs uppercase text-slate-500 mb-1">Related</p>
                <p className="text-slate-300 text-sm">{data.related.join(" → ")}</p>
              </div>
            )}

            <button className="btn-secondary w-full text-sm">+ Add to Flashcards</button>
          </>
        )}
      </div>
    </div>
  );
}
