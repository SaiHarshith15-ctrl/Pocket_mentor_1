import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

function heatColor(count) {
  if (!count) return "bg-slate-100 dark:bg-slate-800/80";
  if (count <= 2) return "bg-brand/30";
  if (count <= 4) return "bg-brand/60";
  return "bg-brand";
}

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
const POPULAR_SUBJECTS = [
  "Operating Systems",
  "DBMS",
  "Computer Networks",
  "DSA",
  "Machine Learning",
  "OOP",
  "Software Engineering",
  "Discrete Mathematics",
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const { theme, toggleTheme, palette, setPalette, PALETTES } = useTheme();

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("CSE");
  const [editYear, setEditYear] = useState(3);
  const [editSubjects, setEditSubjects] = useState([]);
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  function loadProfileData() {
    api.get("/profile").then((res) => {
      setProfile(res.data.data);
      setEditName(res.data.data.name || "");
      setEditDept(res.data.data.department || "CSE");
      setEditYear(res.data.data.year || 3);
      setEditSubjects(res.data.data.subjects || []);
    });
    api.get("/profile/activity?days=84").then((res) => setActivity(res.data.data.activity));
  }

  useEffect(() => {
    loadProfileData();
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const res = await api.put("/users/profile", {
        name: editName,
        department: editDept,
        year: Number(editYear),
        subjects: editSubjects,
      });

      if (res.data.success) {
        updateUser(res.data.data.user);
        setSaveSuccess("Profile details updated successfully!");
        loadProfileData();
        setTimeout(() => {
          setIsEditing(false);
          setSaveSuccess("");
        }, 1200);
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to update profile details");
    } finally {
      setSaving(false);
    }
  }

  function toggleSubject(sub) {
    if (editSubjects.includes(sub)) {
      setEditSubjects(editSubjects.filter((s) => s !== sub));
    } else {
      setEditSubjects([...editSubjects, sub]);
    }
  }

  function handleAddCustomSubject(e) {
    e.preventDefault();
    const clean = newSubjectInput.trim();
    if (clean && !editSubjects.includes(clean)) {
      setEditSubjects([...editSubjects, clean]);
      setNewSubjectInput("");
    }
  }

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      className="space-y-6 max-w-5xl mx-auto py-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. Student Identity Header Banner */}
      <motion.div
        variants={itemVariants}
        className="card relative overflow-hidden p-6 sm:p-7 border-brand/20 bg-gradient-to-r from-white/95 via-white/90 to-brand/5 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-brand/10 shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand to-brand-light text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-brand/25 ring-4 ring-brand/10">
              {profile.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  {profile.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-brand/10 text-brand font-bold text-xs border border-brand/20">
                  Student Scholar
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{profile.department}</span>
                <span>•</span>
                <span>Year {profile.year}</span>
                <span>•</span>
                <span>{profile.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
              title="Edit Profile Information"
            >
              <span>✏️</span>
              <span>{isEditing ? "Close Editor" : "Edit Profile"}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
              title="Toggle Light / Dark Mode"
            >
              <span>{theme === "light" ? "🌙 Dark" : "☀️ Light"}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Interactive Edit Profile Drawer / Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card p-6 border-brand/40 bg-white/95 dark:bg-slate-900/95 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>✏️</span> Edit Student Profile Details
                  </h2>
                  <p className="text-xs text-slate-400">
                    Update your account details, engineering department, and enrolled subjects.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                  {saveSuccess}
                </div>
              )}
              {saveError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800">
                  {saveError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Department / Major
                    </label>
                    <select
                      className="input-field"
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Academic Year
                    </label>
                    <select
                      className="input-field"
                      value={editYear}
                      onChange={(e) => setEditYear(Number(e.target.value))}
                    >
                      <option value={1}>Year 1 (Freshman)</option>
                      <option value={2}>Year 2 (Sophomore)</option>
                      <option value={3}>Year 3 (Junior)</option>
                      <option value={4}>Year 4 (Senior)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Enrolled Course Subjects
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Tap to toggle popular subjects, or add custom ones below.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {POPULAR_SUBJECTS.map((sub) => {
                      const active = editSubjects.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => toggleSubject(sub)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                            active
                              ? "bg-brand text-white shadow-sm"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {active ? "✓ " : "+ "}
                          {sub}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add another course subject..."
                      value={newSubjectInput}
                      onChange={(e) => setNewSubjectInput(e.target.value)}
                      className="input-field text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSubject}
                      className="btn-secondary text-xs whitespace-nowrap px-4"
                    >
                      Add Subject
                    </button>
                  </div>

                  {editSubjects.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <span className="text-[11px] text-slate-400 self-center mr-1">Selected:</span>
                      {editSubjects.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-brand/10 text-brand font-semibold border border-brand/20"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => toggleSubject(s)}
                            className="hover:text-rose-500 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary text-xs px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs px-5 flex items-center gap-1.5"
                  >
                    {saving ? "Saving Changes..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Key Academic KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Mastery Card */}
        <div className="card card-hover p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 dark:bg-brand/10 rounded-full blur-xl pointer-events-none" />
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Overall Course Mastery
          </p>
          <p className="text-4xl font-black bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
            {profile.overallMastery}%
          </p>
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {profile.overallMastery >= 80 ? "✨ Exam Ready" : "📈 Actively Progressing"}
          </p>
        </div>

        {/* Study Streak Card */}
        <div className="card card-hover p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 dark:bg-accent/10 rounded-full blur-xl pointer-events-none" />
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Consistency Streak
          </p>
          <p className="text-4xl font-black text-slate-900 dark:text-slate-50">
            🔥 {profile.currentStreak}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Personal Best: <strong className="text-slate-700 dark:text-slate-200">{profile.longestStreak} days</strong>
          </p>
        </div>

        {/* Topics Mastered Card */}
        <div className="card card-hover p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Concepts Mastered
          </p>
          <p className="text-4xl font-black text-brand">
            {profile.stats.topicsMastered}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {profile.stats.topicsRescued} topics recovered via Rescue Mode
          </p>
        </div>
      </motion.div>

      {/* 4. Detailed Academic Statistics & Heatmap */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-12 gap-6">
        {/* Left: Organized Details Table & Enrolled Subjects */}
        <div className="md:col-span-5 space-y-4">
          {/* Performance stats */}
          <div className="card p-5 space-y-3">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>📊</span> Verified Study Metrics
              </h2>
              <p className="text-xs text-slate-400">System validated learning counters</p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/80 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Questions Answered</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {profile.stats.questionsAnswered}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/80 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Flashcards Reviewed</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {profile.stats.flashcardsReviewed}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/80 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Mastered Concepts (&ge;80%)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {profile.stats.topicsMastered}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100/80 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Rescue Sessions Succeeded</span>
                <span className="font-bold text-brand text-sm">
                  {profile.stats.topicsRescued}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Retention Reliability</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {profile.overallMastery >= 75 ? "High" : "Moderate"}
                </span>
              </div>
            </div>
          </div>

          {/* Enrolled Subjects Card */}
          <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>📚</span> Enrolled Subjects
                </h2>
                <p className="text-xs text-slate-400">Your registered semester curriculum</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[11px] text-brand hover:underline font-semibold"
              >
                Manage
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(profile.subjects || []).length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No subjects enrolled yet. Click Manage to add.</p>
              ) : (
                profile.subjects.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Study Activity Calendar Heatmap */}
        <div className="md:col-span-7 card p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>📅</span> Study Activity (Last 12 Weeks)
              </h2>
              <p className="text-xs text-slate-400">Tracks active quizzes, reviews, and uploads</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-sm bg-brand/30" />
              <span className="w-2.5 h-2.5 rounded-sm bg-brand/60" />
              <span className="w-2.5 h-2.5 rounded-sm bg-brand" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1.5 pt-1">
            {days.map((d) => (
              <div
                key={d}
                title={`${d}: ${activityMap[d] || 0} actions recorded`}
                className={`h-4 rounded-sm transition-all hover:scale-125 cursor-pointer ${heatColor(
                  activityMap[d]
                )}`}
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            Regular micro-sessions (15-20 min) improve long-term retrieval by up to 40% over cramming.
          </p>
        </div>
      </motion.div>

      {/* 5. Subject Mastery Breakdown & Achievements */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
        {/* Subject Mastery Progress */}
        <div className="card p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📚</span> Subject Mastery Breakdown
            </h2>
            <p className="text-xs text-slate-400">Aggregated progress across all course units</p>
          </div>

          <div className="space-y-3.5">
            {profile.subjectMastery.map((s) => (
              <div key={s.subject} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand" />
                    {s.subject}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{s.mastery}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand to-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${s.mastery}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
            {profile.subjectMastery.length === 0 && (
              <p className="text-slate-400 text-xs py-4 text-center">
                No subjects tracked yet. Upload course notes to populate your mastery records.
              </p>
            )}
          </div>
        </div>

        {/* Milestones & Badges */}
        <div className="card p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🏆</span> Milestones & Achievements
            </h2>
            <p className="text-xs text-slate-400">Earned through continuous retention and rescue goals</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {profile.achievements.length === 0 ? (
              <div className="text-center py-6 w-full space-y-1">
                <p className="text-2xl">🎖️</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Complete quizzes and flashcards to unlock academic achievement badges!
                </p>
              </div>
            ) : (
              profile.achievements.map((a) => (
                <span
                  key={a.code}
                  className="badge-green text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
                >
                  <span>🏅</span>
                  <span>{a.label}</span>
                </span>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* 6. Appearance & Customization */}
      <motion.div variants={itemVariants} className="card p-5 space-y-3">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🎨</span> Appearance & Soothing Theme Palettes
          </h2>
          <p className="text-xs text-slate-400">
            Select your preferred aesthetic. Color tokens adapt across all dashboard, flashcard, and quiz interfaces.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPalette(p.id)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                palette === p.id
                  ? "border-brand bg-brand/10 text-brand font-bold shadow-sm ring-2 ring-brand/20"
                  : "border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
              }`}
            >
              <span className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: p.hex }} />
              <span className="text-xs">{p.name}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}