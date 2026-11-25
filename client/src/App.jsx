import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, thinking]);

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || thinking) return;

    const userMsg = { role: "user", text: trimmed, time: getTime() };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setThinking(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        message: trimmed,
      });

      setChat((prev) => [
        ...prev,
        { role: "ai", text: res.data.reply, time: getTime() },
      ]);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;

      setChat((prev) => [
        ...prev,
        { role: "ai", text: `⚠️ ${errMsg}`, time: getTime(), error: true },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  return (
    <>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-icon">✦</div>
          <div>
            <div className="header-title">AI Chatbot</div>
            <div className="header-sub">Powered by Gemini 3.8 Flash</div>
          </div>
          <div className="status-dot" />
        </div>

        {/* Chat */}
        <div className="chat-area">
          {chat.length === 0 && !thinking && (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <div className="empty-text">Start a conversation</div>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`msg-row ${msg.role}`}>
              <div className={`avatar ${msg.role}`}>
                {msg.role === "ai" ? "G" : "U"}
              </div>

              <div>
                <div className={`bubble ${msg.role}${msg.error ? " error" : ""}`}>
                  {msg.text}
                </div>
                <div className="timestamp">{msg.time}</div>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <div className="msg-row ai">
              <div className="avatar ai">G</div>
              <div className="thinking-bubble">
                <span className="thinking-label">thinking</span>
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-row">
            <textarea
              ref={textareaRef}
              className="chat-input"
              rows={1}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={thinking}
            />

            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!message.trim() || thinking}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <div className="hint">Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </>
  );
}