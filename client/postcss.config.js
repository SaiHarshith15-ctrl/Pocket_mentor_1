/**
 * postcss.config.js
 *
 * PURPOSE:
 * Registers Tailwind CSS and Autoprefixer as PostCSS plugins so Vite's
 * CSS pipeline actually processes the @tailwind directives in
 * src/index.css and adds vendor prefixes. Both "tailwindcss" and
 * "autoprefixer" are already listed in package.json devDependencies —
 * this file just needs to wire them in.
 *
 * CONNECTS TO:
 * - tailwind.config.js (the config Tailwind's PostCSS plugin reads)
 * - src/index.css (the file this pipeline transforms)
 *
 * NOT YET IMPLEMENTED — build this file yourself, or hand the prompt
 * below to an AI assistant:
 *
 * PROMPT TO GENERATE THIS FILE:
 * "Create postcss.config.js with module.exports = { plugins: { tailwindcss:
 * {}, autoprefixer: {} } }."
 */


export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};