/**
 * pages/Landing.jsx
 * Public home page shown at "/" for logged-out visitors. Renders a full
 * marketing page — hero, live-feeling dashboard mockup, feature grid,
 * how-it-works, and a closing CTA — instead of redirecting straight to
 * the login form.
 */
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "📝",
    title: "Upload once, master it",
    description:
      "Paste your notes or drop a PDF. One AI pass turns them into a summary, flashcards, and a quiz — automatically.",
  },
  {
    icon: "🗂️",
    title: "Flashcards that flip",
    description: "Real 3D flip cards, one at a time, rated Again/Hard/Good/Easy to sharpen your recall over time.",
  },
  {
    icon: "🚑",
    title: "Rescue Mode",
    description:
      "Bomb a topic on a quiz? Get a targeted re-explanation, fresh flashcards, and a re-quiz until you actually get it.",
  },
  {
    icon: "🤖",
    title: "An AI Mentor that knows you",
    description: "Ask what to study with 20 minutes to spare — it answers using your real weak topics, not guesses.",
  },
];

const STEPS = [
  { n: "01", title: "Upload your notes", text: "Paste text or upload a PDF for any subject." },
  { n: "02", title: "Get quizzed", text: "An AI-generated quiz shows exactly where you're weak." },
  { n: "03", title: "Rescue the weak spots", text: "Targeted revision + re-quiz until it's mastered." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas overflow-x-hidden">
      {/* Nav */}
      <header className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between relative z-10">
        <span className="font-bold text-lg text-slate-800">
          Pocket <span className="text-brand">Mentor</span>
        </span>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-secondary text-sm py-1.5">
            Log In
          </Link>
          <Link to="/register" className="btn-primary text-sm py-1.5">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 pt-10 pb-24 md:pt-16">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-brand/20 rounded-full blur-3xl animate-blob" />
        <div className="pointer-events-none absolute top-10 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-blob [animation-delay:-4s]" />

        <div className="relative grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-semibold tracking-wide uppercase text-brand bg-brand/10 rounded-full px-3 py-1 mb-4">
              Built for exam season
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
              Turn your notes into{" "}
              <span className="font-serif italic bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
                mastery
              </span>
              .
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-md">
              Your notes. Your weak points. Your exam plan. Pocket Mentor finds exactly what you don't know yet — and
              fixes it before the exam does.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/register" className="btn-primary px-6 py-3 text-base">
                Start Studying Free →
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                I already have an account
              </Link>
            </div>
          </div>

          {/* Floating mock dashboard preview */}
          <div className="relative animate-fade-up [animation-delay:150ms]">
            <div className="card shadow-popup p-6 rotate-1">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-slate-800">Good to see you, Alex 👋</p>
                <span className="badge-green">92% Mastery</span>
              </div>
              <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-brand/5 to-white p-4 mb-4">
                <p className="text-xs text-brand font-semibold mb-1">🔥 Priority Topic</p>
                <p className="font-bold text-slate-800">Normalization</p>
                <div className="h-1.5 mt-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-brand" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["DBMS", "OS", "CN"].map((s, i) => (
                  <div key={s} className="rounded-lg border border-slate-200 p-2 text-center">
                    <p className="text-[10px] text-slate-400">{s}</p>
                    <p className="text-sm font-bold text-slate-700">{[78, 54, 91][i]}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badges around the card */}
            <div className="hidden md:block absolute -top-6 -right-6 card shadow-lift px-4 py-2.5 animate-float">
              <p className="text-xs text-slate-400">Streak</p>
              <p className="font-bold text-slate-800">🔥 12 days</p>
            </div>
            <div className="hidden md:block absolute -bottom-8 -left-8 card shadow-lift px-4 py-2.5 animate-float-slow">
              <p className="text-xs text-slate-400">AI Mentor</p>
              <p className="font-medium text-sm text-slate-700 max-w-[160px]">
                "20 min? Let's fix Normalization." 
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Everything to close the gap</h2>
          <p className="text-slate-500">Four features, one loop: find the gap, close the gap.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover">
              <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center text-xl mb-4">
                {f.icon}
              </div>
              <p className="font-semibold text-slate-800 mb-1.5">{f.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">How it works</h2>
          <p className="text-slate-500">Three steps, on repeat, until nothing's weak anymore.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          {STEPS.map((s) => (
            <div key={s.n} className="relative text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-white border-2 border-brand text-brand font-bold flex items-center justify-center mb-4 shadow-soft relative z-10">
                {s.n}
              </div>
              <p className="font-semibold text-slate-800 mb-1">{s.title}</p>
              <p className="text-sm text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-8 py-14 text-center shadow-popup">
          <div className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 bg-accent/30 rounded-full blur-3xl animate-blob" />
          <h2 className="relative text-2xl md:text-3xl font-bold text-white mb-3">
            Stop guessing what to study.
          </h2>
          <p className="relative text-brand-light/90 mb-7 max-w-md mx-auto">
            Upload your first set of notes and see your weak topics in under two minutes.
          </p>
          <Link
            to="/register"
            className="relative inline-block rounded-xl bg-white text-brand font-semibold px-6 py-3 shadow-lift hover:-translate-y-0.5 transition-transform"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-slate-400">
        Pocket Mentor — built for exam season.
      </footer>
    </div>
  );
}