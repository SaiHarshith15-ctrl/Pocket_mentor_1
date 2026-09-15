/**
 * pages/Flashcards.jsx
 * Shows one flashcard at a time inside a centered popup with a real
 * 3D flip (question on front, answer on back). Rating posts to
 * POST /api/flashcards/:id/review which also updates topic mastery
 * server-side.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const RATINGS = [
  { key: "again", label: "😣 Again", style: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
  { key: "hard", label: "😐 Hard", style: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { key: "good", label: "🙂 Good", style: "bg-brand/10 text-brand hover:bg-brand/20" },
  { key: "easy", label: "🔥 Easy", style: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
];

export default function Flashcards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/flashcards").then((res) => setCards(res.data.data.flashcards));
  }, []);

  if (!cards) return <LoadingSpinner full />;

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="card text-center max-w-sm">
          <p className="text-3xl mb-2">🗂️</p>
          <p className="font-semibold text-slate-800 mb-1">No flashcards yet</p>
          <p className="text-slate-500 text-sm mb-4">Analyze a note first to generate your deck.</p>
          <button className="btn-primary" onClick={() => navigate("/notes")}>
            Go to Notes
          </button>
        </div>
      </div>
    );
  }

  const done = index >= cards.length;
  const card = !done ? cards[index] : null;

  async function rate(ratingKey) {
    setSubmitting(true);
    try {
      await api.post(`/flashcards/${card._id}/review`, { rating: ratingKey });
    } finally {
      setSubmitting(false);
      setFlipped(false);
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-lg">
        {!done && (
          <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              Card {index + 1} of {cards.length}
            </span>
            <span className="font-medium text-brand">{card.topic}</span>
          </div>
        )}

        {!done && (
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-8">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${(index / cards.length) * 100}%` }}
            />
          </div>
        )}

        {done ? (
          <div className="card shadow-popup text-center py-12 animate-pop-in">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-semibold text-lg text-slate-800">You've reviewed all your flashcards!</p>
            <p className="text-slate-500 text-sm mt-1">Come back tomorrow to keep your streak going.</p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                className="btn-primary"
                onClick={() => {
                  setIndex(0);
                  setFlipped(false);
                }}
              >
                Review Again
              </button>
              <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flip-scene h-72 cursor-pointer" onClick={() => setFlipped((f) => !f)}>
              <div className={`flip-card ${flipped ? "is-flipped" : ""}`}>
                <div className="flip-face card shadow-popup h-full flex flex-col justify-center items-center text-center p-8">
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-3">Question</p>
                  <p className="text-lg font-semibold text-slate-800">{card.question}</p>
                  <p className="text-xs text-slate-400 mt-6">Tap to reveal answer</p>
                </div>

                <div className="flip-face flip-face-back card shadow-popup h-full flex flex-col justify-center items-center text-center p-8 border-brand/30 bg-gradient-to-br from-brand/5 to-white">
                  <p className="text-xs uppercase tracking-wide text-brand mb-3">Answer</p>
                  <p className="text-lg font-medium text-slate-800">{card.answer}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {!flipped ? (
                <button className="btn-primary w-full" onClick={() => setFlipped(true)}>
                  Reveal Answer
                </button>
              ) : (
                <div className="grid grid-cols-4 gap-2 animate-pop-in">
                  {RATINGS.map((r) => (
                    <button
                      key={r.key}
                      className={`rounded-xl text-sm font-semibold py-2.5 transition-all hover:-translate-y-0.5 ${r.style}`}
                      disabled={submitting}
                      onClick={() => rate(r.key)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}