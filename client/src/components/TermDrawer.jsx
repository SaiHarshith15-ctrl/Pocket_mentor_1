import { motion } from "framer-motion";

export default function TermDrawer({ data, loading, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 280 }}
        className="relative w-full max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-popup p-6 overflow-y-auto text-slate-800 dark:text-slate-100"
      >
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Smart Term Glossary
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading term explanation…</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                {data.fullForm || data.term}
              </h3>
              {data.fullForm && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-brand/10 text-brand font-semibold text-xs">
                  {data.term}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 mb-1.5">
                Definition
              </p>
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                {data.explanation}
              </p>
            </div>

            {data.related?.length > 0 && (
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400 dark:text-slate-500 mb-2">
                  Related Concepts
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.related.map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="btn-primary w-full text-xs py-2 mt-4"
            >
              Got it, back to notes
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}