/**
 * pages/Quiz.jsx
 * Loads a quiz by id, lets the student answer every question, submits
 * to POST /api/quizzes/:id/submit, then shows topic-wise results with a
 * "Rescue Mode" button for any weak (<50%) topic — this is the bridge
 * into the killer feature.
 */
/**
 * pages/Quiz.jsx
 * Loads a quiz by id, lets the student answer every question, submits
 * to POST /api/quizzes/:id/submit, then shows topic-wise results with a
 * "Rescue Mode" button for any weak (<50%) topic.
 */
/**
 * pages/Quiz.jsx
 * Loads a quiz by id, lets the student answer every question, submits
 * to POST /api/quizzes/:id/submit, then shows topic-wise results with a
 * "Rescue Mode" button for any weak (<50%) topic.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

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
      <div className="max-w-xl mx-auto space-y-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-brand">
            {result.score}/{result.total}
          </p>
          <p className="text-slate-500">{result.percentage}% correct</p>
        </div>

        <div className="card space-y-3">
          <p className="text-sm font-semibold text-slate-700 mb-2">Topic breakdown</p>
          {result.topicBreakdown.map((t) => {
            const pct = Math.round((t.correct / t.total) * 100);
            const dot = pct >= 70 ? "🟢" : pct >= 40 ? "🟡" : "🔴";
            return (
              <div key={t.topic} className="flex justify-between items-center text-sm">
                <span className="text-slate-700">
                  {dot} {t.topic}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    {t.correct}/{t.total}
                  </span>
                  {pct < 70 && topicIdByName[t.topic] && (
                    <button
                      className="btn-secondary text-xs py-1"
                      onClick={() => navigate(`/rescue/${topicIdByName[t.topic]}`)}
                    >
                      Rescue Mode
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Quiz — {quiz.subject}</h1>

      {quiz.questions.map((q, i) => (
        <div key={q._id} className="card">
          <p className="font-medium text-slate-800 mb-3">
            {i + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt) => (
              <label
                key={opt}
                className={`block rounded-xl px-3 py-2 text-sm border cursor-pointer transition-all hover:-translate-y-0.5 ${
                  answers[q._id] === opt
                    ? "bg-brand/10 border-brand text-brand shadow-soft"
                    : "border-slate-200 text-slate-600 hover:border-brand/30"
                }`}
              >
                <input
                  type="radio"
                  name={q._id}
                  className="mr-2 accent-brand"
                  checked={answers[q._id] === opt}
                  onChange={() => select(q._id, opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button className="btn-primary w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Quiz"}
      </button>
    </div>
  );
}