/**
 * main.jsx
 *
 * PURPOSE:
 * The Vite/React entry point — mounts <App /> into the #root element
 * defined in index.html, wrapped in a BrowserRouter so react-router-dom
 * (used throughout App.jsx and every page) works, and imports the
 * global stylesheet (index.css) so Tailwind + custom classes like
 * .card/.btn-primary/.input-field are available app-wide.
 *
 * CONNECTS TO:
 * - App.jsx (the component tree being mounted)
 * - index.css (global styles / Tailwind directives)
 * - index.html (the #root div this renders into)
 *
 * NOT YET IMPLEMENTED — build this file yourself, or hand the prompt
 * below to an AI assistant:
 *
 * PROMPT TO GENERATE THIS FILE:
 * "Create the standard Vite React entry point: import React and
 * ReactDOM/client, import './index.css', import App from './App',
 * import BrowserRouter from 'react-router-dom'. Use
 * ReactDOM.createRoot(document.getElementById('root')).render(...) to
 * render <React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>."
 */



import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);