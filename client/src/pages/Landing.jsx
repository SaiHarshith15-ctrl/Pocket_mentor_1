import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: "📝",
    title: "Upload once, master it",
    description:
      "Paste lecture notes or drop a PDF for OS, DBMS, Networks, or DSA. AI extracts structured summaries, key terms, flashcards, and quizzes.",
    badge: "Smart Ingestion",
  },
  {
    icon: "🗂️",
    title: "3D Spaced Flashcards",
    description:
      "Interactive 3D flip cards rated Again, Hard, Good, or Easy with an SM-2 spaced repetition algorithm that optimizes recall retention.",
    badge: "Active Recall",
  },
  {
    icon: "🚑",
    title: "Instant Rescue Mode",
    description:
      "Struggled with a concept on a quiz? Get a targeted plain-language breakdown, 3 focused flashcards, and a re-quiz until you hit 80%+ mastery.",
    badge: "Killer Feature",
  },
  {
    icon: "🤖",
    title: "Context-Aware AI Mentor",
    description:
      "Tell it 'I have 20 minutes before my exam' — it creates an instant sprint plan targeting your exact weakest topics.",
    badge: "Personalized",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Upload Your Course Notes",
    text: "Paste text or upload a PDF for any subject. Smart term extraction highlights key acronyms and definitions.",
    icon: "📤",
  },
  {
    n: "02",
    title: "Assess With Rapid Quizzes",
    text: "Take realistic multiple-choice quizzes that pinpoint exactly where your conceptual blindspots are.",
    icon: "🎯",
  },
  {
    n: "03",
    title: "Rescue The Weak Spots",
    text: "One-click Rescue Mode generates focused micro-revisions until you reach true exam readiness.",
    icon: "🏆",
  },
];

export default function Landing() {
  const { theme, toggleTheme, palette, setPalette, PALETTES } = useTheme();

  return (
    <div className="min-h-screen bg-canvas text-slate-800 dark:text-slate-100 overflow-x-hidden relative transition-colors duration-300">
      {/* Ambient background with delicate mesh glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.14),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.22),rgba(11,15,25,0))]" />
        <div className="absolute -top-28 -left-24 w-96 h-96 bg-brand/15 dark:bg-brand/25 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/4 right-0 w-[26rem] h-[26rem] bg-accent/15 dark:bg-accent/20 rounded-full blur-3xl animate-blob [animation-delay:-4s]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-brand/10 dark:bg-brand/20 rounded-full blur-3xl animate-blob [animation-delay:-8s]" />
      </div>

      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between relative z-20 border-b border-slate-200/50 dark:border-slate-800/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center text-white shadow-md shadow-brand/20">
            ⚡
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-slate-50 tracking-tight">
            Pocket<span className="text-brand">Mentor</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick theme toggles */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all text-xs"
            title="Toggle light / dark mode"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <Link to="/login" className="btn-secondary text-xs sm:text-sm py-1.5 px-3">
            Log In
          </Link>
          <Link to="/register" className="btn-primary text-xs sm:text-sm py-1.5 px-4 shadow-md shadow-brand/20">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="relative grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <motion.div
            className="lg:col-span-7 space-y-6 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span>Smart Study & Exam Mastery Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-50 leading-[1.1] tracking-tight">
              Turn your lecture notes into{" "}
              <span className="bg-gradient-to-r from-brand via-brand-light to-accent bg-clip-text text-transparent font-serif italic">
                effortless mastery
              </span>
              .
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Pocket Mentor ingests your course materials, detects your conceptual gaps with diagnostic quizzes, and
              launches targeted Rescue Sessions so you master weak topics before exams.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register"
                className="btn-primary px-7 py-3 text-base font-semibold shadow-lg shadow-brand/30 hover:scale-105 transition-transform"
              >
                Start Studying Free →
              </Link>
              <Link
                to="/login"
                className="btn-secondary px-6 py-3 text-base font-semibold hover:scale-105 transition-transform"
              >
                Sign In to Account
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> Supports OS, DBMS, CN & DSA
              </span>
            </div>
          </motion.div>

          {/* Right Column: Interactive Mock Dashboard Preview */}
          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Glow backdrop */}
            <div className="absolute -inset-2 bg-gradient-to-r from-brand/30 to-accent/30 rounded-3xl blur-2xl opacity-60" />

            {/* Mock Glass Card */}
            <div className="relative card p-6 shadow-popup border-brand/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                    🎓
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Good to see you, Alex 👋
                  </span>
                </div>
                <span className="badge-green text-xs">88% Overall Mastery</span>
              </div>

              {/* Priority Rescue Mock */}
              <div className="p-4 rounded-xl border border-brand/30 bg-gradient-to-br from-brand/10 via-white/50 to-accent/10 dark:from-brand/20 dark:via-slate-800/80 dark:to-slate-800/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <span>🔥</span> Priority Rescue: CPU Scheduling
                  </span>
                  <span className="badge-red text-[10px]">35% Mastery</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Struggled with Round Robin context-switching overhead in yesterday's quiz.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-brand">5 min targeted sprint</span>
                  <span className="px-2.5 py-1 rounded-lg bg-brand text-white text-[11px] font-bold shadow-sm">
                    Start Rescue →
                  </span>
                </div>
              </div>

              {/* Subject Badges */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                {[
                  { s: "Operating Systems", p: 76, color: "text-brand" },
                  { s: "DBMS", p: 92, color: "text-emerald-500" },
                  { s: "Computer Networks", p: 68, color: "text-amber-500" },
                ].map((item) => (
                  <div
                    key={item.s}
                    className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {item.s}
                    </p>
                    <p className={`text-base font-extrabold ${item.color} mt-0.5`}>{item.p}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Badges */}
            <motion.div
              className="hidden sm:block absolute -top-5 -right-4 card shadow-lift px-3.5 py-2 text-xs font-semibold bg-white/95 dark:bg-slate-900/95 border border-brand/30"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              🔥 14-Day Study Streak
            </motion.div>

            <motion.div
              className="hidden sm:block absolute -bottom-5 -left-4 card shadow-lift px-3.5 py-2 text-xs font-medium bg-white/95 dark:bg-slate-900/95 border border-brand/30 max-w-[200px]"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            >
              🤖 "20 min? Let's master Coffman deadlock conditions."
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-slate-200/60 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand">The Study Loop</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Built to close every conceptual gap
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Four coordinated features forming one cohesive loop: ingest notes, pinpoint weak topics, and rescue them with targeted revision.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="card card-hover p-6 flex flex-col justify-between space-y-4"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-2xl shadow-sm">
                    {f.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand px-2 py-0.5 rounded-full bg-brand/10">
                    {f.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3-Step Walkthrough */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand">Simple Workflow</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            How Pocket Mentor Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-brand/10 text-brand font-black text-base flex items-center justify-center shadow-sm">
                {s.n}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{s.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-slate-900 px-8 py-16 text-center shadow-popup">
          <div className="pointer-events-none absolute -bottom-16 -right-16 w-72 h-72 bg-accent/25 rounded-full blur-3xl animate-blob" />
          <h2 className="relative text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Ready to stop guessing what to study?
          </h2>
          <p className="relative text-white/80 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Upload your first lecture notes and get your personalized exam rescue dashboard in under two minutes.
          </p>
          <Link
            to="/register"
            className="relative inline-block rounded-xl bg-white text-brand font-bold text-sm px-8 py-3.5 shadow-xl hover:scale-105 transition-transform"
          >
            Start Studying Free Now →
          </Link>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800">
        Pocket Mentor — Personalized AI study partner designed for college students.
      </footer>
    </div>
  );
}