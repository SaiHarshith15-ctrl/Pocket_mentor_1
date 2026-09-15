/**
 * pages/Profile.jsx
 * LeetCode/GitHub-style profile: overall mastery, streak, activity
 * heatmap, subject mastery, stats, and achievements. All server-driven.
 */
import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

function heatColor(count) {
  if (!count) return "bg-slate-100";
  if (count <= 2) return "bg-brand/30";
  if (count <= 4) return "bg-brand/60";
  return "bg-brand";
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    api.get("/profile").then((res) => setProfile(res.data.data));
    api.get("/profile/activity?days=84").then((res) => setActivity(res.data.data.activity));
  }, []);

  if (!profile || !activity) return <LoadingSpinner full />;

  const activityMap = {};
  activity.forEach((a) => {
    activityMap[new Date(a.date).toISOString().slice(0, 10)] = a.count;
  });
  const days = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{profile.name}</h1>
        <p className="text-slate-500 text-sm">
          {profile.department} · Year {profile.year}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card card-hover text-center">
          <p className="text-3xl font-bold text-brand">{profile.overallMastery}%</p>
          <p className="text-slate-500 text-sm">Overall Mastery</p>
        </div>
        <div className="card card-hover text-center">
          <p className="text-3xl font-bold text-slate-800">🔥 {profile.currentStreak}</p>
          <p className="text-slate-500 text-sm">Day Streak (best {profile.longestStreak})</p>
        </div>
        <div className="card card-hover text-center">
          <p className="text-3xl font-bold text-slate-800">{profile.stats.topicsMastered}</p>
          <p className="text-slate-500 text-sm">Topics Mastered</p>
        </div>
      </div>

      <div className="card">
        <p className="text-sm font-semibold text-slate-700 mb-3">Activity</p>
        <div className="grid grid-cols-12 gap-1">
          {days.map((d) => (
            <div
              key={d}
              title={`${d}: ${activityMap[d] || 0} actions`}
              className={`w-3 h-3 rounded-sm ${heatColor(activityMap[d])}`}
            />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-sm font-semibold text-slate-700 mb-3">Statistics</p>
          <ul className="text-sm text-slate-600 space-y-1.5">
            <li className="flex justify-between">
              <span>Questions answered</span>
              <span className="font-medium text-slate-800">{profile.stats.questionsAnswered}</span>
            </li>
            <li className="flex justify-between">
              <span>Flashcards reviewed</span>
              <span className="font-medium text-slate-800">{profile.stats.flashcardsReviewed}</span>
            </li>
            <li className="flex justify-between">
              <span>Topics mastered</span>
              <span className="font-medium text-slate-800">{profile.stats.topicsMastered}</span>
            </li>
            <li className="flex justify-between">
              <span>Topics rescued</span>
              <span className="font-medium text-slate-800">{profile.stats.topicsRescued}</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <p className="text-sm font-semibold text-slate-700 mb-3">Subject Mastery</p>
          <div className="space-y-2">
            {profile.subjectMastery.map((s) => (
              <div key={s.subject}>
                <div className="flex justify-between text-sm mb-1 text-slate-600">
                  <span>{s.subject}</span>
                  <span>{s.mastery}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand" style={{ width: `${s.mastery}%` }} />
                </div>
              </div>
            ))}
            {profile.subjectMastery.length === 0 && (
              <p className="text-slate-400 text-sm">No subjects tracked yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <p className="text-sm font-semibold text-slate-700 mb-3">Achievements</p>
        <div className="flex flex-wrap gap-2">
          {profile.achievements.length === 0 && (
            <p className="text-slate-400 text-sm">None unlocked yet — keep studying!</p>
          )}
          {profile.achievements.map((a) => (
            <span key={a.code} className="badge-green">
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}