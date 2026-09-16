/**
 * pages/Dashboard.jsx
 * Main landing page after login: greeting, priority (weakest) topic
 * with a "Start Rescue Mode" CTA, recommended topics, streak bar, and
 * overall mastery. All data comes from GET /api/dashboard — nothing
 * hardcoded.
 */
/**
 * pages/Dashboard.jsx
 * Main landing page after login: greeting, priority (weakest) topic
 * with a "Start Rescue Mode" CTA, recommended topics, streak bar, and
 * overall mastery. All data comes from GET /api/dashboard — nothing
 * hardcoded.
 */
/**
 * pages/Dashboard.jsx
 * Main landing page after login: greeting, priority (weakest) topic
 * with a "Start Rescue Mode" CTA, recommended topics, streak bar, and
 * overall mastery. All data comes from GET /api/dashboard — nothilng
 * hardcoded.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

function masteryColor(m) {
  if (m >= 75) return "badge-green";
  if (m >= 45) return "badge-yellow";
  return "badge-red";
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data.data));
  }, []);

  if (!data) return <LoadingSpinner full />;

  const { name, priorityTopic, recommendedToday, currentStreak, overallMastery } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif italic font-medium text-slate-800">
          Good to see you, {name.split(" ")[0]}
        </h1>
        <p className="text-slate-500">Here's what you should focus on today.</p>
      </div>

      {priorityTopic ? (
        <div className="card card-hover border-brand/20 bg-gradient-to-br from-brand/5 via-white to-white">
          <p className="text-sm text-brand font-semibold mb-1">🔥 Priority Topic</p>
          <h2 className="text-xl font-bold text-slate-800 mb-1">{priorityTopic.name}</h2>
          <p className="text-slate-500 text-sm mb-4">
            Mastery: <span className={masteryColor(priorityTopic.mastery)}>{priorityTopic.mastery}%</span>
            {" — "}you struggled with this topic in a previous quiz.
          </p>
          <button className="btn-primary" onClick={() => navigate(`/rescue/${priorityTopic._id}`)}>
            Start Rescue Mode
          </button>
        </div>
      ) : (
        <div className="card">
          <p className="text-slate-500">
            No topics tracked yet — upload a note on the Notes page to get started.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card card-hover">
          <p className="text-sm font-semibold text-slate-700 mb-3">📚 Recommended Today</p>
          {recommendedToday.length === 0 && <p className="text-slate-400 text-sm">Nothing yet.</p>}
          <ul className="space-y-2">
            {recommendedToday.map((t, i) => (
              <li key={t._id} className="flex justify-between items-center text-sm">
                <span className="text-slate-600">
                  {i + 1}. {t.name}
                </span>
                <span className={masteryColor(t.mastery)}>{t.mastery}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card card-hover space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">🔥 {currentStreak} Day Streak</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-brand"
                style={{ width: `${Math.min(100, currentStreak * 10)}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">📊 Overall Mastery</p>
            <p className="text-3xl font-bold text-brand">{overallMastery}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}