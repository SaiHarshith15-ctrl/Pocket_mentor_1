import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";

const STAGES = { LOADING: "loading", INTRO: "intro", CONTENT: "content", QUIZ: "quiz", RESULT: "result" };

export default function RescueMode() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [stage, setStage] = useState(STAGES.LOADING);
  const [topic, setTopic] = useState(null);
  const [threshold, setThreshold] = useState(80);
  const [content, setContent] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .post("/rescue/start", { topicId })
      .then((res) => {
        setTopic(res.data.data.topic);
        setThreshold(res.data.data.masteryThreshold);
        setStage(STAGES.INTRO);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to start Rescue Mode"));
  }, [topicId]);

  async function handleGenerate() {
    setStage(STAGES.LOADING);
    try {
      const res = await api.post(`/rescue/${topicId}/generate`);
      setContent(res.data.data);
      setStage(STAGES.CONTENT);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate rescue content");
      setStage(STAGES.INTRO);
    }
  }

  function select(questionId, option) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmitQuiz() {
    setStage(STAGES.LOADING);
    try {
      const payload = content.quiz.questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] || "",
      }));
      const res = await api.post(`/rescue/${topicId}/submit`, {
        quizId: content.quiz._id,
        answers: payload,
      });
      setResult(res.data.data);
      setStage(STAGES.RESULT);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit rescue quiz");
      setStage(STAGES.QUIZ);
    }
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4 card text-center space-y-3">
        <p className="text-danger font-bold text-sm">Error: {error}</p>
        <button className="btn-secondary text-xs" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (stage === STAGES.LOADING) return <LoadingSpinner full />;

  if (stage === STAGES.INTRO) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto card shadow-popup text-center p-8 space-y-5"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold text-xs">
          <span>🚑</span> Rescue Session
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Target Weak Topic</p>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            {topic.name}
          </h1>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 max-w-sm mx-auto">
          <p className="text-xs text-slate-500 dark:text-slate-400">Current Mastery Level</p>
          <p className="text-3xl font-extrabold text-rose-500 dark:text-rose-400 mt-0.5">{topic.mastery}%</p>
          <p className="text-xs text-slate-400 mt-1">Target: {threshold}%+ for exam readiness</p>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
          We'll break down this concept with a targeted plain-language explanation, 3 focused flashcards, and a quick 3-question re-quiz.
        </p>
        <button className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand/25" onClick={handleGenerate}>
          <span>⚡</span>
          <span>Generate Targeted Rescue Package</span>
        </button>
      </motion.div>
    );
  }

  if (stage === STAGES.CONTENT) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">
              Step 1: Targeted Concept Breakdown
            </h2>
          </div>
          <span className="text-xs text-brand font-medium">{topic.name}</span>
        </div>

        <div className="card card-hover space-y-2 p-5 border-brand/20">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            Plain Language Explanation
          </p>
          <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
            {content.explanation}
          </p>
        </div>

        <div className="card card-hover space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>🗂️</span> Focused Flashcards ({content.flashcards.length})
            </p>
            <span className="text-xs text-slate-400">Click to reveal answer</span>
          </div>
          <div className="space-y-2.5">
            {content.flashcards.map((f) => (
              <details
                key={f._id}
                className="group p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-sm cursor-pointer transition-colors"
              >
                <summary className="font-semibold text-slate-800 dark:text-slate-100 flex justify-between items-center list-none">
                  <span>{f.question}</span>
                  <span className="text-brand text-xs group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 text-brand font-medium text-xs sm:text-sm">
                  {f.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        <motion.button
          className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand/25"
          onClick={() => setStage(STAGES.QUIZ)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span>Step 2: Take Re-Quiz Now</span>
          <span>→</span>
        </motion.button>
      </motion.div>
    );
  }

  if (stage === STAGES.QUIZ) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">
              Step 2: Mastery Verification Quiz
            </h2>
          </div>
          <span className="text-xs text-brand font-medium">{topic.name}</span>
        </div>

        {content.quiz.questions.map((q, i) => (
          <div key={q._id} className="card space-y-3">
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

        <button className="btn-primary w-full py-3 text-sm" onClick={handleSubmitQuiz}>
          Submit Answers & Calculate Mastery
        </button>
      </motion.div>
    );
  }

  // STAGES.RESULT
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto card shadow-popup text-center p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{topic.name}</h2>

      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 max-w-sm mx-auto space-y-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">Mastery Progress</p>
        <p className="text-3xl font-extrabold">
          <span className="text-slate-400 line-through mr-2">{result.masteryBefore}%</span>
          <span className="text-brand font-black">→ {result.masteryAfter}%</span>
        </p>
      </div>

      {result.mastered ? (
        <div className="space-y-1">
          <p className="text-4xl mb-1">🏆</p>
          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">TOPIC MASTERED!</p>
          <p className="text-slate-500 text-xs">Exceeded the {threshold}% target threshold.</p>
        </div>
      ) : result.masteryAfter > result.masteryBefore ? (
        <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
          🎉 Great improvement! Another session will push you past the {threshold}% mastery line.
        </p>
      ) : (
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Keep at it! Re-review the flashcards and try another attempt to strengthen neural recall.
        </p>
      )}

      <div className="flex flex-wrap gap-3 justify-center pt-2">
        {!result.mastered && (
          <button className="btn-primary text-xs px-5 py-2.5" onClick={handleGenerate}>
            Review Weak Topic Again
          </button>
        )}
        <button className="btn-secondary text-xs px-5 py-2.5" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </motion.div>
  );
}