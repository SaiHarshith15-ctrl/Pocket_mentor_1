/**
 * pages/Flashcards.jsx
 * Shows one flashcard at a time: question -> reveal answer -> rate
 * (Again/Hard/Good/Easy). Rating posts to POST /api/flashcards/:id/review
 * which also updates topic mastery server-side.
 */
import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const RATINGS = [
  { key: "again", label: "😣 Again" },
  { key: "hard", label: "😐 Hard" },
  { key: "good", label: "🙂 Good" },
  { key: "easy", label: "🔥 Easy" },
];

export default function Flashcards() {
  const [cards, setCards] = useState(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/flashcards").then((res) => setCards(res.data.data.flashcards));
  }, []);

  if (!cards) return <LoadingSpinner full />;
  if (cards.length === 0) {
    return <p className="text-slate-500">No flashcards yet — analyze a note first.</p>;
  }
  if (index >= cards.length) {
    return (
      <div className="card text-center py-10">
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-semibold">You've reviewed all your flashcards!</p>
        <button className="btn-primary mt-4" onClick={() => setIndex(0)}>
          Review Again
        </button>
      </div>
    );
  }

  const card = cards[index];

  async function rate(ratingKey) {
    setSubmitting(true);
    try {
      await api.post(`/flashcards/${card._id}/review`, { rating: ratingKey });
    } finally {
      setSubmitting(false);
      setRevealed(false);
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <p className="text-slate-400 text-sm">
        Card {index + 1} of {cards.length} · {card.topic}
      </p>

      <div className="card min-h-[220px] flex flex-col justify-center items-center text-center p-8">
        <p className="text-lg font-medium mb-4">{card.question}</p>
        {revealed && <p className="text-brand-light">{card.answer}</p>}
      </div>

      {!revealed ? (
        <button className="btn-primary w-full" onClick={() => setRevealed(true)}>
          Reveal Answer
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.key}
              className="btn-secondary text-sm"
              disabled={submitting}
              onClick={() => rate(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
