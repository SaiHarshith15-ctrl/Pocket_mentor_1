import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";

export default function Quiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [topicIdByName, setTopicIdByName] = useState({});

  useEffect(() => {
    api.get(`/quizzes/${quizId}`).then((res) => setQuiz(res.data.data.quiz));
    api.get("/progress/topics").then((res) => {
      const map = {};
      res.data.data.topics.forEach((t) => (map[t.name] = t._id));
      setTopicIdByName(map);
    });
  }, [quizId]);

  // Fireworks + sound trigger once a result comes back. Placed above
  // the early return so hook order stays identical on every render.
  const passed = result && result.percentage >= 80;

  useEffect(() => {
    if (!result) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      if (passed) {
        // A few staggered "firework shot" pops — noise burst (whoosh)
        // followed by a bright crackle tone, fired 3 times.
        [0, 0.35, 0.7].forEach((delayBase) => {
          const start = ctx.currentTime + delayBase;

          // whoosh (short noise burst rising in pitch)
          const bufferSize = ctx.sampleRate * 0.15;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.15, start);
          noise.connect(noiseGain).connect(ctx.destination);
          noise.start(start);

          // pop/crackle tone
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(900, start + 0.15);

          osc.frequency.exponentialRampToValueAtTime(220, start + 0.4);
          gain.gain.setValueAtTime(0.0001, start + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.2, start + 0.17);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
          osc.connect(gain).connect(ctx.destination);
          osc.start(start + 0.15);
          osc.stop(start + 0.5);
        });
      } else {
        // Gentle "better luck next time" descending two-note chime.
        const notes = [440, 349.23]; // A4 -> F4
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          const start = ctx.currentTime + i * 0.28;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.18, start + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
          osc.connect(gain).connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.55);
        });
      }
    } catch (err) {
      console.error("Result sound failed to play:", err);
    }
  }, [result, passed]);

  // Firework bursts — only generated on a strong score (>=80%).
  const fireworks = useMemo(() => {

    if (!passed) return [];
    const palette = ["#f59e0b", "#ec4899", "#22c55e", "#6366f1", "#06b6d4", "#facc15"];
    const bursts = [
      { x: 25, y: 30, delay: 0 },
      { x: 75, y: 22, delay: 0.35 },
      { x: 50, y: 40, delay: 0.7 },
    ];
    return bursts.map((b, bi) => ({
      ...b,
      id: bi,
      particles: Array.from({ length: 20 }, (_, i) => ({
        id: i,
        color: palette[(bi + i) % palette.length],
        angle: (i / 20) * 360,
        distance: 90 + Math.random() * 60,
      })),
    }));
  }, [passed]);

  if (!quiz) return <LoadingSpinner full />;

  function select(questionId, option) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = quiz.questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] || "",
      }));
      const res = await api.post(`/quizzes/${quizId}/submit`, { answers: payload });
      setResult(res.data.data.attempt);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto space-y-6 py-4 relative"
      >
        {/* Fireworks overlay — fixed to the viewport so bursts read as
            a full sky show, not just inside the result card. */}
        {passed && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {fireworks.map((burst) => (
              <div
                key={burst.id}
                className="absolute"
                style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
              >
                {burst.particles.map((p) => (
                  <motion.span
                    key={p.id}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                      y: Math.sin((p.angle * Math.PI) / 180) * p.distance + 40,
                      opacity: 0,
                      scale: 0.5,
                    }}
                    transition={{ duration: 1, delay: burst.delay, ease: "easeOut" }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="card text-center p-8 space-y-2 shadow-popup">
          <p className="text-4xl">📊</p>
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Quiz Completed</p>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
            {result.score} / {result.total}
          </p>
          <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">
            {result.percentage}% Correct Answers
          </p>
        </div>

        <div className="card space-y-4 p-6">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span>Topic Breakdown</span>
            <span className="text-xs text-slate-400 font-normal">Review performance by topic</span>
          </p>
          <div className="space-y-3">
            {result.topicBreakdown.map((t) => {
              const pct = Math.round((t.correct / t.total) * 100);
              const dot = pct >= 70 ? "🟢" : pct >= 40 ? "🟡" : "🔴";
              return (
                <div
                  key={t.topic}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-sm"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>{dot}</span>
                    <span>{t.topic}</span>
                  </span>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {t.correct}/{t.total} ({pct}%)
                    </span>
                    {pct < 70 && topicIdByName[t.topic] && (
                      <button
                        className="btn-primary text-xs py-1 px-2.5"
                        onClick={() => navigate(`/rescue/${topicIdByName[t.topic]}`)}
                      >
                        🚑 Rescue Mode
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="btn-secondary w-full text-xs py-2.5 mt-2"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand">Practice Quiz</span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          {quiz.subject} Examination
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select the best answer for each question. Results update your topic mastery immediately.
        </p>
      </div>

      {quiz.questions.map((q, i) => (
        <div key={q._id} className="card space-y-3 p-5">
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-relaxed">
            <span className="text-brand font-bold mr-1.5">{i + 1}.</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const isSelected = answers[q._id] === opt;
              return (
                <label
                  key={opt}
                  className={`block rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-brand/10 dark:bg-brand/20 border-brand text-brand font-medium shadow-sm"
                      : "border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-brand/40"
                  }`}
                >
                  <input
                    type="radio"
                    name={q._id}
                    className="mr-2.5 accent-brand"
                    checked={isSelected}
                    onChange={() => select(q._id, opt)}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <motion.button
        className="btn-primary w-full py-3 text-sm font-semibold shadow-lg shadow-brand/25"
        onClick={handleSubmit}
        disabled={submitting}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {submitting ? "Submitting & Grading…" : "Submit Quiz"}
      </motion.button>
    </div>
  );
}