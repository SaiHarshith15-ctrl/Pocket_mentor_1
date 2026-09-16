/**
 * pages/RescueMode.jsx
 *
 * The killer feature end to end:
 *   start -> generate targeted explanation/flashcards/quiz -> take the
 *   re-quiz -> submit -> show mastery before/after -> mastered or retry.
 *
 * CONNECTS TO:
 * - POST /api/rescue/start, /api/rescue/:topicId/generate,
 *   /api/rescue/:topicId/submit (controllers/rescueController.js)
 */
/**
 * pages/RescueMode.jsx
 * The killer feature end to end:
 *   start -> generate targeted explanation/flashcards/quiz -> take the
 *   re-quiz -> submit -> show mastery before/after -> mastered or retry.
 */
/**
 * pages/RescueMode.jsx
 * The killer feature end to end:
 *   start -> generate targeted explanation/flashcards/quiz -> take the
 *   re-quiz -> submit -> show mastery before/after -> mastered or retry.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

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

  if (error) return <p className="text-danger">{error}</p>;
  if (stage === STAGES.LOADING) return <LoadingSpinner full />;

  if (stage === STAGES.INTRO) {
    return (
      <div className="max-w-xl mx-auto card shadow-popup text-center space-y-4">
        <p className="text-danger font-semibold">❌ You struggled with:</p>
        <h1 className="text-2xl font-bold text-slate-800">{topic.name}</h1>
        <p className="text-slate-500">
          Your current mastery: <span className="text-danger font-semibold">{topic.mastery}%</span>
        </p>
        <p className="text-slate-600">Let's fix this.</p>
        <button className="btn-primary w-full" onClick={handleGenerate}>
          Generate Targeted Revision
        </button>
      </div>
    );
  }

  if (stage === STAGES.CONTENT) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="card card-hover">
          <p className="text-sm font-semibold text-brand mb-2">Targeted Explanation</p>
          <p className="text-slate-600 leading-relaxed">{content.explanation}</p>
        </div>

        <div className="card card-hover">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Focused Flashcards ({content.flashcards.length})
          </p>
          <div className="space-y-2">
            {content.flashcards.map((f) => (
              <details key={f._id} className="text-sm text-slate-600">
                <summary className="cursor-pointer font-medium text-slate-800">{f.question}</summary>
                <p className="text-brand mt-1 pl-4">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <button className="btn-primary w-full" onClick={() => setStage(STAGES.QUIZ)}>
          Try Again — Take the Quiz
        </button>
      </div>
    );
  }

  if (stage === STAGES.QUIZ) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Rescue Quiz — {topic.name}</h2>
        {content.quiz.questions.map((q, i) => (
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
        <button className="btn-primary w-full" onClick={handleSubmitQuiz}>
          Submit
        </button>
      </div>
    );
  }

  // STAGES.RESULT
  return (
    <div className="max-w-xl mx-auto card shadow-popup text-center space-y-4">
      <h2 className="text-xl font-bold text-slate-800">{topic.name}</h2>
      <p className="text-2xl font-bold">
        <span className="text-slate-400">{result.masteryBefore}%</span>{" "}
        <span className="text-brand">→ {result.masteryAfter}%</span>
      </p>

      {result.mastered ? (
        <div>
          <p className="text-3xl mb-1">🏆</p>
          <p className="font-semibold text-slate-800">TOPIC MASTERED</p>
        </div>
      ) : result.masteryAfter > result.masteryBefore ? (
        <p className="text-success font-medium">🎉 Great improvement! Keep going to reach {threshold}%.</p>
      ) : (
        <p className="text-slate-500">Let's try another revision round.</p>
      )}

      <div className="flex gap-3 justify-center">
        {!result.mastered && (
          <button className="btn-primary" onClick={handleGenerate}>
            Review Weak Topic Again
          </button>
        )}
        <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}