
// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import "./App.css";

// const API_URL =
//   import.meta.env.VITE_API_URL || "http://localhost:5000";

// function getTime() {
//   return new Date().toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// export default function App() {
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([]);
//   const [thinking, setThinking] = useState(false);

//   const bottomRef = useRef(null);
//   const textareaRef = useRef(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({
//       behavior: "smooth",
//       block: "end",
//     });
//   }, [chat, thinking]);

//   const sendMessage = async () => {
//     const trimmed = message.trim();

//     if (!trimmed || thinking) return;

//     const userMsg = {
//       role: "user",
//       text: trimmed,
//       time: getTime(),
//     };

//     setChat((prev) => [...prev, userMsg]);
//     setMessage("");
//     setThinking(true);

//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//     }

//     try {
//       const res = await axios.post(`${API_URL}/chat`, {
//         message: trimmed,
//       });

//       setChat((prev) => [
//         ...prev,
//         {
//           role: "ai",
//           text: res.data.reply,
//           time: getTime(),
//         },
//       ]);
//     } catch (err) {
//       const errMsg =
//         err.response?.data?.error ||
//         err.message ||
//         "Something went wrong";

//       setChat((prev) => [
//         ...prev,
//         {
//           role: "ai",
//           text: `⚠️ ${errMsg}`,
//           time: getTime(),
//           error: true,
//         },
//       ]);
//     } finally {
//       setThinking(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const handleInput = (e) => {
//     setMessage(e.target.value);

//     e.target.style.height = "auto";
//     e.target.style.height =
//       Math.min(e.target.scrollHeight, 120) + "px";
//   };

//   return (
//     <main className="app">
//       {/* Header */}
//       <header className="header">
//         <div className="header-icon">✦</div>

//         <div className="header-content">
//           <div className="header-title">AI Chatbot</div>
//           <div className="header-sub">
//             Powered by Gemini 3.8 Flash
//           </div>
//         </div>

//         <div className="status-dot" />
//       </header>

//       {/* Chat */}
//       <section className="chat-area">
//         {chat.length === 0 && !thinking && (
//           <div className="empty-state">
//             <div className="empty-icon">✦</div>
//             <div className="empty-text">
//               Start a conversation
//             </div>
//           </div>
//         )}

//         {chat.map((msg, i) => (
//           <div key={i} className={`msg-row ${msg.role}`}>
//             <div className={`avatar ${msg.role}`}>
//               {msg.role === "ai" ? "G" : "U"}
//             </div>

//             <div className="message-content">
//               <div
//                 className={`bubble ${msg.role}${
//                   msg.error ? " error" : ""
//                 }`}
//               >
//                 {msg.text}
//               </div>

//               <div className="timestamp">{msg.time}</div>
//             </div>
//           </div>
//         ))}

//         {/* Thinking Indicator */}
//         {thinking && (
//           <div className="msg-row ai">
//             <div className="avatar ai">G</div>

//             <div className="thinking-bubble">
//               <span className="thinking-label">thinking</span>
//               <div className="dot" />
//               <div className="dot" />
//               <div className="dot" />
//             </div>
//           </div>
//         )}

//         <div ref={bottomRef} />
//       </section>

//       {/* Input */}
//       <footer className="input-area">
//         <div className="input-row">
//           <textarea
//             ref={textareaRef}
//             className="chat-input"
//             rows={1}
//             value={message}
//             onChange={handleInput}
//             onKeyDown={handleKeyDown}
//             placeholder="Ask me anything..."
//             disabled={thinking}
//           />

//           <button
//             className="send-btn"
//             onClick={sendMessage}
//             disabled={!message.trim() || thinking}
//             aria-label="Send message"
//             type="button"
//           >
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2.5"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <line x1="22" y1="2" x2="11" y2="13" />
//               <polygon points="22 2 15 22 11 13 2 9 22 2" />
//             </svg>
//           </button>
//         </div>

//         <div className="hint">
//           Enter to send · Shift+Enter for new line
//         </div>
//       </footer>
//     </main>
//   );
// }


import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [chat, thinking]);

  // Send Message
  const sendMessage = async () => {
    const trimmed = message.trim();

    if (!trimmed || thinking) return;

    const userMsg = {
      role: "user",
      text: trimmed,
      time: getTime(),
    };

    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setThinking(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await axios.post(`${API_URL}/chat`, {
        message: trimmed,
      });

      const responseData = res.data;

      // Get AI reply
      const aiReply =
        responseData.reply || "No response generated.";

      // Get unique source links
      const sourceList = Array.isArray(responseData.sources)
        ? responseData.sources
        : [];

      const uniqueSources = [
        ...new Map(
          sourceList
            .filter((source) => source?.url)
            .map((source) => [source.url, source])
        ).values(),
      ];

      // Google Search Grounding HTML
      const searchWidgetHtml =
        responseData.searchWidgetHtml || null;

      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          text: aiReply,
          time: getTime(),
          sources: uniqueSources,
          searchedWeb: Boolean(responseData.searchedWeb),
          searchWidgetHtml,
        },
      ]);
    } catch (err) {
      console.error("Chat API Error:", err);

      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Something went wrong";

      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          text: `⚠️ ${errMsg}`,
          time: getTime(),
          error: true,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  // Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto resize textarea
  const handleInput = (e) => {
    setMessage(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height =
      Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <main className="app">

      {/* Header */}
      <header className="header">
        <div className="header-icon">✦</div>

        <div className="header-content">
          <div className="header-title">AI Chatbot</div>

          <div className="header-sub">
            Powered by Gemma 4 26B
          </div>
        </div>

        <div className="status-dot" />
      </header>

      {/* Chat Area */}
      <section className="chat-area">

        {/* Empty State */}
        {chat.length === 0 && !thinking && (
          <div className="empty-state">
            <div className="empty-icon">✦</div>

            <div className="empty-text">
              Start a conversation
            </div>
          </div>
        )}

        {/* Messages */}
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`msg-row ${msg.role}`}
          >
            <div className={`avatar ${msg.role}`}>
              {msg.role === "ai" ? "G" : "U"}
            </div>

            <div className="message-content">

              {/* Message Bubble */}
              <div
                className={`bubble ${msg.role}${
                  msg.error ? " error" : ""
                }`}
              >
                {msg.text}
              </div>

              {/* Google Search Sources */}
              {msg.role === "ai" &&
                !msg.error &&
                msg.sources?.length > 0 && (
                  <div className="sources-container">

                    <div className="sources-heading">
                      <span className="sources-icon">🌐</span>
                      <span>Sources</span>
                    </div>

                    <div className="sources-list">
                      {msg.sources.map((source, index) => (
                        <a
                          key={`${source.url}-${index}`}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          <span className="source-number">
                            {index + 1}
                          </span>

                          <span className="source-title">
                            {source.title || "Read source"}
                          </span>

                          <span className="source-arrow">
                            ↗
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Google Search Suggestions HTML */}
              {msg.role === "ai" &&
                !msg.error &&
                msg.searchWidgetHtml && (
                  <div
                    className="google-search-widget"
                    dangerouslySetInnerHTML={{
                      __html: msg.searchWidgetHtml,
                    }}
                  />
                )}

              {/* Timestamp */}
              <div className="timestamp">
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {thinking && (
          <div className="msg-row ai">
            <div className="avatar ai">G</div>

            <div className="thinking-bubble">
              <span className="thinking-label">
                thinking
              </span>

              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      {/* Input Area */}
      <footer className="input-area">
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
            aria-label="Send message"
            type="button"
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

        <div className="hint">
          Enter to send · Shift+Enter for new line
        </div>
      </footer>
    </main>
  );
}
