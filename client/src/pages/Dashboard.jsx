import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";

function masteryBadge(m) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Greeting */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-serif italic font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            Good to see you, <span className="text-brand font-sans not-italic font-bold">{name.split(" ")[0]}</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
            Here's what your personalized study plan recommends today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Study Plan Active
          </span>
        </div>
      </motion.div>

      {/* Priority Rescue Mode Card */}
      <motion.div variants={itemVariants}>
        {priorityTopic ? (
          <div className="card card-hover relative overflow-hidden border-brand/40 dark:border-brand/40 bg-gradient-to-br from-brand/10 via-white/80 to-accent/5 dark:from-brand/20 dark:via-slate-900/90 dark:to-slate-900/90 shadow-md hover:shadow-xl transition-all p-6">
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
                  <span className="text-xs text-slate-500 dark:text-slate-400">Needs quick revision</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  {priorityTopic.name}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Current mastery is sitting at{" "}
                  <span className={masteryBadge(priorityTopic.mastery)}>{priorityTopic.mastery}%</span>
                  {" — "}we noticed you struggled with this topic. A quick 5-minute Rescue session will boost your retention.
                </p>
              </div>

              <motion.button
                className="btn-primary whitespace-nowrap self-start sm:self-center px-6 py-3 text-sm flex items-center gap-2 shadow-lg shadow-brand/25"
                onClick={() => navigate(`/rescue/${priorityTopic._id}`)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>🚑</span>
                <span>Start Rescue Mode</span>
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">
              No weak topics flagged yet — upload your course notes to begin personalized tracking!
            </p>
            <button className="btn-primary mt-3 text-sm" onClick={() => navigate("/notes")}>
              Upload Notes
            </button>
          </div>
        )}
      </motion.div>

      {/* Grid: Recommended Today & Stats */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
        {/* Recommended Topics */}
        <div className="card card-hover space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <span>📚</span> Recommended Today
            </h3>
            <span className="text-xs text-slate-400">Priority order</span>
          </div>

          {recommendedToday.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">
              All caught up! Review your flashcards to keep concepts fresh.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {recommendedToday.map((t, i) => (
                <motion.li
                  key={t._id}
                  whileHover={{ x: 3 }}
                  className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-sm transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{t.name}</span>
                  </div>
                  <span className={masteryBadge(t.mastery)}>{t.mastery}%</span>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        {/* Learning Momentum & Overall Mastery */}
        <div className="card card-hover space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <span>🔥</span> Daily Streak
              </h3>
              <span className="text-xs font-bold text-brand">{currentStreak} Day{currentStreak === 1 ? "" : "s"}</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(10, currentStreak * 15))}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Study consecutive days to strengthen active memory consolidation.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Overall Mastery
                </p>
                <motion.p
                  className="text-4xl font-extrabold bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent mt-1"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
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
      </motion.div>
    </motion.div>
  );
}