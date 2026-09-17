import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

const RATINGS = [
  { key: "again", label: "😣 Again", style: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 hover:bg-rose-100" },
  { key: "hard", label: "😐 Hard", style: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 hover:bg-amber-100" },
  { key: "good", label: "🙂 Good", style: "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light border border-brand/20 dark:border-brand/40 hover:bg-brand/20" },
  { key: "easy", label: "🔥 Easy", style: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100" },
];

export default function Flashcards() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cards, setCards] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/flashcards").then((res) => {
      const allCards = res.data.data.flashcards;
      setCards(allCards);
      const urlSubject = searchParams.get("subject");
      if (urlSubject && allCards.some((c) => c.subject === urlSubject)) {
        setSelectedSubject(urlSubject);
      }
    });
  }, [searchParams]);

  if (!cards) return <LoadingSpinner full />;

  const subjects = ["All", ...Array.from(new Set(cards.map((c) => c.subject).filter(Boolean)))];
  const activeCards = selectedSubject === "All" ? cards : cards.filter((c) => c.subject === selectedSubject);

  if (activeCards.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        <div className="card text-center max-w-sm p-8 shadow-md">
          <p className="text-4xl mb-3">🗂️</p>
          <h2 className="font-bold text-lg text-slate-900 dark:text-slate-50 mb-1">No flashcards in this deck</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 leading-relaxed">
            {cards.length > 0 ? "Switch to another subject tab or upload more notes." : "Analyze a note first to generate your deck."}
          </p>
          {cards.length > 0 ? (
            <button className="btn-secondary w-full text-sm" onClick={() => { setSelectedSubject("All"); setIndex(0); }}>
              View All Flashcards
            </button>
          ) : (
            <button className="btn-primary w-full text-sm" onClick={() => navigate("/notes")}>
              Go to Notes
            </button>
          )}
        </div>
      </div>
    );
  }

  const done = index >= activeCards.length;
  const card = !done ? activeCards[index] : null;

  // Victory sound — synthesized with the Web Audio API, no audio file
  // needed. Fires once each time the deck is completed.
  useEffect(() => {
    if (!done) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6 arpeggio
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.09;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch (err) {
      console.error("Victory sound failed to play:", err);
    }
  }, [done]);

  // Confetti burst particles — regenerated fresh each time the deck is
  // completed, so "Review Again" gets a new blast too.
  const confetti = useMemo(() => {
    if (!done) return [];

    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"];
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      angle: (i / 28) * 360 + Math.random() * 12,
      distance: 120 + Math.random() * 110,
      size: 6 + Math.random() * 6,
      delay: Math.random() * 0.15,
    }));
  }, [done]);

  function rate(ratingKey) {
    // Advance immediately for a snappy feel; the rating still gets
    // saved, just without blocking the UI on the network round-trip.
    setFlipped(false);
    setIndex((i) => i + 1);
    api.post(`/flashcards/${card._id}/review`, { rating: ratingKey }).catch((err) => {
      console.error("Failed to save flashcard rating:", err);
    });
  }

  return (
    <div className="max-w-lg mx-auto py-6">
      {/* Subject Filter Tabs */}
      {subjects.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
          {subjects.map((s) => {
            const count = s === "All" ? cards.length : cards.filter((c) => c.subject === s).length;
            const isSelected = selectedSubject === s;
            return (
              <button
                key={s}
                onClick={() => {
                  setSelectedSubject(s);
                  setIndex(0);
                  setFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-brand text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
      )}

      {!done && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>
              Card <strong className="text-slate-800 dark:text-slate-200">{index + 1}</strong> of {activeCards.length}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                {card.subject}
              </span>
              <span className="font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs">
                {card.topic}
              </span>
            </div>
          </div>

          <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${((index + 1) / activeCards.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {done ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card shadow-popup text-center py-12 px-6 space-y-4 relative overflow-hidden"
        >
          {/* Confetti blast */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {confetti.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-sm"
                style={{ width: p.size, height: p.size, backgroundColor: p.color, top: "50%", left: "50%" }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                  y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                  opacity: 0,
                  rotate: 360,
                }}
                transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
              />
            ))}
          </div>

          <p className="text-5xl mb-1">🎉</p>
          <h2 className="font-bold text-2xl text-slate-900 dark:text-slate-50">
            Session Completed!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
            You've reviewed all flashcards in {selectedSubject === "All" ? "your deck" : selectedSubject}.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-3">
            <button
              className="btn-primary text-sm px-5"
              onClick={() => {
                setIndex(0);
                setFlipped(false);
              }}
            >
              Review Again
            </button>
            <button className="btn-secondary text-sm px-5" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {/* Flip Scene */}
          <div
            className="flip-scene h-80 cursor-pointer select-none"
            onClick={() => setFlipped((f) => !f)}
          >
            <div className={`flip-card ${flipped ? "is-flipped" : ""}`}>
              {/* Front: Question */}
              <div className="flip-face card shadow-xl h-full flex flex-col justify-between p-8 bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Question
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Difficulty: {card.difficulty || "medium"}
                  </span>
                </div>

                <p className="text-xl font-bold text-slate-900 dark:text-slate-50 text-center px-2 leading-relaxed">
                  {card.question}
                </p>

                <p className="text-xs text-brand font-medium text-center flex items-center justify-center gap-1">
                  <span>↻</span> Tap card to reveal answer
                </p>
              </div>

              {/* Back: Answer */}
              <div className="flip-face flip-face-back card shadow-xl h-full flex flex-col justify-between p-8 border-brand/40 dark:border-brand/40 bg-gradient-to-br from-brand/5 via-white/95 to-accent/5 dark:from-brand/15 dark:via-slate-900/95 dark:to-slate-900/95">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                    Answer
                  </span>
                  <span className="text-xs text-slate-400">↻ Tap to flip back</span>
                </div>

                <p className="text-lg font-medium text-slate-900 dark:text-slate-100 text-center px-2 leading-relaxed">
                  {card.answer}
                </p>

                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                  Rate your recall difficulty below
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div>
            {!flipped ? (
              <motion.button
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
                onClick={() => setFlipped(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span>Reveal Answer</span>
                <span>→</span>
              </motion.button>
            ) : (
              <div className="grid grid-cols-4 gap-2 animate-pop-in">
                {RATINGS.map((r) => (
                  <motion.button
                    key={r.key}
                    className={`rounded-xl text-xs sm:text-sm font-semibold py-2.5 transition-all ${r.style}`}
                    disabled={submitting}
                    onClick={() => rate(r.key)}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {r.label}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}