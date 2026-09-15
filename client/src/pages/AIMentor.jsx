/**
 * pages/AIMentor.jsx
 * Simple chat UI backed by POST /api/mentor/chat. Sends the running
 * conversation history with each request (see mentorController.js TODO
 * about persisting this server-side in Phase 2). Offers a quick
 * "Start Rescue Mode" action when the mentor names a weak topic.
 */
/**
 * pages/AIMentor.jsx
 * Simple chat UI backed by POST /api/mentor/chat. Sends the running
 * conversation history with each request. Offers a quick
 * "Start Rescue Mode" action when the mentor names a weak topic.
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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

  async function send() {
    if (!input.trim() || sending) return;
    const userMessage = { role: "user", content: input };
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
      setMessages([...history, { role: "assistant", content: "Sorry, I couldn't respond right now." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[75vh]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-semibold">
          AI
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">AI Mentor</h1>
          <p className="text-xs text-slate-400">Grounded in your notes and quiz history</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${
              m.role === "user"
                ? "bg-brand text-white ml-auto"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="max-w-[60%] rounded-2xl px-4 py-2.5 text-sm bg-white border border-slate-200 text-slate-400 shadow-soft">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.1s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" />
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {suggestedTopic && topicIdByName[suggestedTopic.name] && (
        <div className="my-3">
          <button
            className="btn-secondary text-sm"
            onClick={() => navigate(`/rescue/${topicIdByName[suggestedTopic.name]}`)}
          >
            Start Rescue Mode: {suggestedTopic.name} ({suggestedTopic.mastery}%)
          </button>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <input
          className="input-field"
          placeholder="e.g. I have 20 minutes, what should I study?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn-primary" onClick={send} disabled={sending}>
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}