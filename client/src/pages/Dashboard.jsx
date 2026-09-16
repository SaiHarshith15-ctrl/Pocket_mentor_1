import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

function masteryBadge(m) {
  if (m >= 75) return "badge-green";
  if (m >= 45) return "badge-yellow";
  return "badge-red";
}

function masteryColor(m) {
  if (m >= 80) return "text-emerald-500";
  if (m >= 60) return "text-brand";
  if (m >= 40) return "text-amber-500";
  return "text-rose-500";
}

function masteryBg(m) {
  if (m >= 80) return "bg-emerald-500";
  if (m >= 60) return "bg-brand";
  if (m >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

function statusIcon(status) {
  switch (status) {
    case "mastered": return "✅";
    case "learning": return "📖";
    case "weak": return "⚠️";
    default: return "🔘";
  }
}

function verdictDisplay(verdict) {
  switch (verdict) {
    case "ready": return { text: "Exam Ready!", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "✅" };
    case "almost": return { text: "Almost There", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", icon: "📈" };
    default: return { text: "Needs Work", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20", icon: "⚠️" };
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data.data));
    api.get("/analytics").then((res) => setAnalytics(res.data.data)).catch(() => {});
  }, []);

  if (!data) return <LoadingSpinner full />;

  const { name, priorityTopic, recommendedToday, currentStreak, overallMastery } = data;

  const tabs = [
    { key: "overview", label: "Overview", icon: "🏠" },
    { key: "knowledge", label: "Knowledge Map", icon: "🗺️" },
    { key: "analytics", label: "Analytics", icon: "📊" },
  ];

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">

      {/* ─── Header ─── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-serif italic font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            Good to see you, <span className="text-brand font-sans not-italic font-bold">{name.split(" ")[0]}</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
            Here's your personalized study plan and analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Study Plan Active
          </span>
        </div>
      </motion.div>

      {/* ─── Tab Navigation ─── */}
      <motion.div variants={itemVariants} className="flex gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/50 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-white dark:bg-slate-700 text-brand shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-6">
            <OverviewTab
              priorityTopic={priorityTopic}
              recommendedToday={recommendedToday}
              currentStreak={currentStreak}
              overallMastery={overallMastery}
              analytics={analytics}
              navigate={navigate}
            />
          </motion.div>
        )}
        {activeTab === "knowledge" && (
          <motion.div key="knowledge" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-6">
            <KnowledgeMapTab analytics={analytics} navigate={navigate} />
          </motion.div>
        )}
        {activeTab === "analytics" && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-6">
            <AnalyticsTab analytics={analytics} navigate={navigate} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════
   OVERVIEW TAB
   ════════════════════════════════════════════════════════ */
function OverviewTab({ priorityTopic, recommendedToday, currentStreak, overallMastery, analytics, navigate }) {
  return (
    <>
      {/* Priority Rescue */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        {priorityTopic ? (
          <div className="card card-hover relative overflow-hidden border-brand/40 bg-gradient-to-br from-brand/10 via-white/80 to-accent/5 dark:from-brand/20 dark:via-slate-900/90 dark:to-slate-900/90 shadow-md hover:shadow-xl transition-all p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <motion.span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    🔥 Priority Rescue Topic
                  </motion.span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{priorityTopic.name}</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Current mastery at <span className={masteryBadge(priorityTopic.mastery)}>{priorityTopic.mastery}%</span> — a quick 5-minute Rescue session will boost your retention.
                </p>
              </div>
              <motion.button
                className="btn-primary whitespace-nowrap self-start sm:self-center px-6 py-3 text-sm flex items-center gap-2 shadow-lg shadow-brand/25"
                onClick={() => navigate(`/rescue/${priorityTopic._id}`)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>🚑</span><span>Start Rescue Mode</span>
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">No weak topics flagged yet — upload your course notes to begin!</p>
            <button className="btn-primary mt-3 text-sm" onClick={() => navigate("/notes")}>Upload Notes</button>
          </div>
        )}
      </motion.div>

      {/* Grid: Recommended + Stats + Next Best Action */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recommended Today */}
        <div className="card card-hover space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">📚 Recommended Today</h3>
            <span className="text-xs text-slate-400">Priority order</span>
          </div>
          {recommendedToday.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">All caught up! Review flashcards to stay fresh.</p>
          ) : (
            <ul className="space-y-2.5">
              {recommendedToday.map((t, i) => (
                <motion.li key={t._id} whileHover={{ x: 3 }} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-sm transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">{i + 1}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{t.name}</span>
                  </div>
                  <span className={masteryBadge(t.mastery)}>{t.mastery}%</span>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        {/* Streak + Mastery */}
        <div className="card card-hover space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">🔥 Daily Streak</h3>
              <span className="text-xs font-bold text-brand">{currentStreak} Day{currentStreak === 1 ? "" : "s"}</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <motion.div className="h-full bg-gradient-to-r from-accent to-brand rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(10, currentStreak * 15))}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Overall Mastery</p>
                <motion.p className="text-4xl font-extrabold bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent mt-1" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                  {overallMastery}%
                </motion.p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">Target: 80%+</span>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  {overallMastery >= 80 ? "✨ Exam Ready!" : "📈 Steadily Improving"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 Next Best Action (compact) */}
        <div className="card card-hover space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">🎯 Next Best Action</h3>
          {analytics?.nextBestActions?.length > 0 ? (
            <div className="space-y-3">
              {analytics.nextBestActions.slice(0, 2).map((nba) => (
                <div key={nba._id} className="p-3 rounded-xl bg-brand/5 dark:bg-brand/10 border border-brand/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{nba.name}</span>
                    <span className={masteryBadge(nba.mastery)}>{nba.mastery}%</span>
                  </div>
                  <p className="text-xs text-brand font-semibold">{nba.action}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{nba.reasons.join(" · ")}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Complete some quizzes to get personalized recommendations.</p>
          )}
        </div>
      </motion.div>

      {/* Exam Readiness Quick Glance */}
      {analytics?.examReadiness?.subjects?.length > 0 && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <div className="card card-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">✅ Exam Readiness</h3>
              <div className={`px-3 py-1 rounded-full border text-xs font-bold ${verdictDisplay(analytics.examReadiness.overall.verdict).bg} ${verdictDisplay(analytics.examReadiness.overall.verdict).color}`}>
                {verdictDisplay(analytics.examReadiness.overall.verdict).icon} {verdictDisplay(analytics.examReadiness.overall.verdict).text}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Overall */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-brand/10 to-accent/10 dark:from-brand/20 dark:to-accent/15 border border-brand/20 text-center">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall</p>
                <p className="text-3xl font-extrabold bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent mt-1">{analytics.examReadiness.overall.readiness}%</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{analytics.examReadiness.overall.weakCount} weak topics</p>
              </div>
              {/* Per subject */}
              {analytics.examReadiness.subjects.map((sub) => {
                const v = verdictDisplay(sub.verdict);
                return (
                  <div key={sub.subject} className={`p-4 rounded-xl border ${v.bg} text-center`}>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{sub.subject}</p>
                    <p className={`text-2xl font-extrabold mt-1 ${v.color}`}>{sub.readiness}%</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{sub.masteredCount}/{sub.topicCount} mastered</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════
   KNOWLEDGE MAP TAB
   ════════════════════════════════════════════════════════ */
function KnowledgeMapTab({ analytics }) {
  if (!analytics?.knowledgeMap?.length) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">🗺️</p>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Upload notes and take quizzes to build your Knowledge Map.</p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-1">🗺️ Student Knowledge Map</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Visual overview of every topic you've studied, organized by subject and color-coded by mastery.</p>
      </motion.div>

      {analytics.knowledgeMap.map((group) => (
        <motion.div key={group.subject} variants={itemVariants} className="card card-hover space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{group.subject}</h3>
              <span className={masteryBadge(group.avgMastery)}>{group.avgMastery}% avg</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{group.masteredCount}/{group.topicCount} mastered</span>
          </div>

          {/* Mastery progress bar */}
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${group.avgMastery}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          {/* Topic Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {group.topics.map((topic) => (
              <motion.div
                key={topic._id}
                className={`p-3 rounded-xl border text-center transition-all hover:shadow-md cursor-default ${
                  topic.status === "mastered"
                    ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/40"
                    : topic.status === "learning"
                    ? "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800/40"
                    : topic.status === "weak"
                    ? "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-800/40"
                    : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/50"
                }`}
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <div className="text-sm mb-1">{statusIcon(topic.status)}</div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={topic.name}>{topic.name}</p>
                <p className={`text-lg font-extrabold mt-0.5 ${masteryColor(topic.mastery)}`}>{topic.mastery}%</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize mt-0.5">{topic.status}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════
   ANALYTICS TAB
   ════════════════════════════════════════════════════════ */
function AnalyticsTab({ analytics, navigate }) {
  if (!analytics) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Take some quizzes to see your detailed analytics.</p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">

      {/* ─── Weakness Analysis ─── */}
      <motion.div variants={itemVariants} className="card card-hover">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">🔍 Weakness Analysis</h3>
        {analytics.weaknessAnalysis.weakTopics.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">🎉 No weak topics! You've mastered everything so far.</p>
        ) : (
          <div className="space-y-2.5">
            {analytics.weaknessAnalysis.weakTopics.slice(0, 8).map((w) => (
              <div key={w._id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${w.dangerZone ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/40" : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/40"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  {w.dangerZone && <span className="text-rose-500 text-xs font-bold">🚨</span>}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{w.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{w.subject} · {w.totalAttempts} attempts · {w.accuracy}% accuracy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Mastery bar */}
                  <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                    <div className={`h-full rounded-full ${masteryBg(w.mastery)}`} style={{ width: `${w.mastery}%` }} />
                  </div>
                  <span className={masteryBadge(w.mastery)}>{w.mastery}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Error Patterns ─── */}
      <motion.div variants={itemVariants} className="card card-hover">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">⚠️ Error Patterns</h3>
        {analytics.errorPatterns.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No error patterns detected yet. Take more quizzes!</p>
        ) : (
          <div className="space-y-2.5">
            {analytics.errorPatterns.map((ep, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    ep.severity === "critical" ? "bg-rose-500" : ep.severity === "high" ? "bg-amber-500" : "bg-blue-500"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{ep.topic}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{ep.subject} · {ep.incorrectCount} errors · {ep.errorRate}% error rate</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  ep.severity === "critical"
                    ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                    : ep.severity === "high"
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                }`}>{ep.severity}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Next Best Action (Detailed) ─── */}
      <motion.div variants={itemVariants} className="card card-hover">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">🎯 Next Best Actions</h3>
        {analytics.nextBestActions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">All topics mastered! Keep reviewing to stay sharp.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            {analytics.nextBestActions.map((nba, i) => (
              <motion.div
                key={nba._id}
                className="p-4 rounded-xl bg-gradient-to-br from-brand/5 to-accent/5 dark:from-brand/10 dark:to-accent/10 border border-brand/20 space-y-3 cursor-pointer hover:shadow-md transition-all"
                whileHover={{ y: -3 }}
                onClick={() => {
                  if (nba.mastery < 30) navigate(`/rescue/${nba._id}`);
                  else navigate("/flashcards");
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand uppercase tracking-wider">#{i + 1} Priority</span>
                  <span className={masteryBadge(nba.mastery)}>{nba.mastery}%</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{nba.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{nba.subject}</p>
                <div className="pt-2 border-t border-brand/10">
                  <p className="text-xs font-semibold text-brand">{nba.action}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{nba.reasons.join(" · ")}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Before vs After ─── */}
      <motion.div variants={itemVariants} className="card card-hover">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">📊 Before vs After</h3>
        {analytics.beforeAfter.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Take quizzes to see your progress over time.</p>
        ) : (
          <div className="space-y-3">
            {analytics.beforeAfter.slice(0, 8).map((ba, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{ba.topic}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{ba.subject} · {ba.attemptCount} attempts</p>
                  </div>
                  <span className={`text-xs font-bold ${ba.improvement > 0 ? "text-emerald-500" : ba.improvement < 0 ? "text-rose-500" : "text-slate-400"}`}>
                    {ba.improvement > 0 ? "▲" : ba.improvement < 0 ? "▼" : "─"} {Math.abs(ba.improvement)}%
                  </span>
                </div>
                {/* Before/After bar comparison */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-slate-400 dark:text-slate-500">First</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{ba.firstScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400/60 dark:bg-slate-500/60 rounded-full" style={{ width: `${ba.firstScore}%` }} />
                    </div>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600 font-bold">→</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-slate-400 dark:text-slate-500">Now</span>
                      <span className={`font-semibold ${masteryColor(ba.currentMastery)}`}>{ba.currentMastery}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${masteryBg(ba.currentMastery)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${ba.currentMastery}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Exam Readiness (Detailed) ─── */}
      <motion.div variants={itemVariants} className="card card-hover">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">✅ Exam Readiness Report</h3>

        {/* Overall */}
        <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-brand/10 to-accent/10 dark:from-brand/20 dark:to-accent/15 border border-brand/20 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Overall Readiness</p>
          <motion.p
            className="text-5xl font-extrabold bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent mt-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {analytics.examReadiness.overall.readiness}%
          </motion.p>
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full border text-xs font-bold ${verdictDisplay(analytics.examReadiness.overall.verdict).bg} ${verdictDisplay(analytics.examReadiness.overall.verdict).color}`}>
            {verdictDisplay(analytics.examReadiness.overall.verdict).icon} {verdictDisplay(analytics.examReadiness.overall.verdict).text}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {analytics.examReadiness.overall.masteredCount}/{analytics.examReadiness.overall.topicCount} topics mastered · {analytics.examReadiness.overall.weakCount} need attention
          </p>
        </div>

        {/* Per-subject readiness */}
        <div className="grid sm:grid-cols-2 gap-4">
          {analytics.examReadiness.subjects.map((sub) => {
            const v = verdictDisplay(sub.verdict);
            return (
              <div key={sub.subject} className={`p-4 rounded-xl border ${v.bg} space-y-3`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{sub.subject}</h4>
                  <span className={`text-xs font-bold ${v.color}`}>{v.icon} {v.text}</span>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-3xl font-extrabold ${v.color}`}>{sub.readiness}%</p>
                  <div className="flex-1">
                    <div className="h-2.5 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${sub.verdict === "ready" ? "bg-emerald-500" : sub.verdict === "almost" ? "bg-amber-500" : "bg-rose-500"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${sub.readiness}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{sub.masteredCount}/{sub.topicCount} mastered</p>
                  </div>
                </div>
                {sub.weakTopics.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/30 dark:border-slate-700/30">
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Needs Attention</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sub.weakTopics.map((wt) => (
                        <span key={wt.name} className="badge-red text-[10px]">{wt.name} ({wt.mastery}%)</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}