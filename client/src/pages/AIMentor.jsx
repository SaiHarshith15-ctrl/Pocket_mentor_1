import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";

const QUICK_PROMPTS = [
  "I have 20 minutes, what should I study?",
  "What's my weakest topic right now?",
  "Give me an exam sprint plan",
];

export default function AIMentor() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI Mentor. Ask me what to study, or tell me how much time you have." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestedTopic, setSuggestedTopic] = useState(null);
  const [topicIdByName, setTopicIdByName] = useState({});
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    api.get("/progress/topics").then((res) => {
      const map = {};
      res.data.data.topics.forEach((t) => (map[t.name] = t._id));
      setTopicIdByName(map);
    });
  }, []);

  async function send(messageToSend) {
    const textToSend = messageToSend || input;
    if (!textToSend.trim() || sending) return;
    const userMessage = { role: "user", content: textToSend };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setSending(true);
    try {
      const res = await api.post("/mentor/chat", {
        message: userMessage.content,
        history: messages,
      });
      setMessages([...history, { role: "assistant", content: res.data.data.reply }]);
      setSuggestedTopic(res.data.data.suggestedTopic);
    } catch {
      setMessages([...history, { role: "assistant", content: "Sorry, I couldn't respond right now. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[78vh]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-accent text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand/20">
          🤖
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-50 leading-tight">
            AI Study Mentor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Grounded in your quiz analytics and uploaded course notes
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-brand text-white ml-auto shadow-md shadow-brand/15"
                : "bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 shadow-sm mr-auto"
            }`}
          >
            {m.content}
          </motion.div>
        ))}

        {sending && (
          <div className="max-w-[60%] rounded-2xl px-4 py-3 text-sm bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-400 shadow-sm mr-auto">
            <span className="inline-flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-brand animate-bounce [animation-delay:-0.2s]" />
              <span className="w-2 h-2 rounded-full bg-brand animate-bounce [animation-delay:-0.1s]" />
              <span className="w-2 h-2 rounded-full bg-brand animate-bounce" />
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Topic Button */}
      {suggestedTopic && topicIdByName[suggestedTopic.name] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="my-2 p-2 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-between"
        >
          <span className="text-xs font-medium text-brand">
            Suggested Topic: <strong>{suggestedTopic.name}</strong> ({suggestedTopic.mastery}%)
          </span>
          <button
            className="btn-primary text-xs py-1 px-3"
            onClick={() => navigate(`/rescue/${topicIdByName[suggestedTopic.name]}`)}
          >
            Start Rescue Mode →
          </button>
        </motion.div>
      )}

      {/* Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto py-2">
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => send(qp)}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="flex gap-2 pt-1">
        <input
          className="input-field"
          placeholder="Ask AI Mentor (e.g. I have 20 minutes, what should I study?)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          className="btn-primary px-5 text-xs sm:text-sm font-semibold flex items-center gap-1"
          onClick={() => send()}
          disabled={sending}
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}