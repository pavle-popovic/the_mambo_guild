"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { useGemini } from "@/hooks/useGemini";

// Art Deco filigree SVG pattern for corners
const FiligreeCorner = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 0L16 0L16 4L4 4L4 16L0 16L0 0Z"
      fill="url(#filigree-gradient)"
    />
    <path
      d="M8 0L8 8L0 8L0 6L6 6L6 0L8 0Z"
      fill="url(#filigree-gradient-dark)"
    />
    <path
      d="M0 12L12 12L12 0L10 0L10 10L0 10L0 12Z"
      fill="url(#filigree-gradient)"
    />
    <circle cx="12" cy="12" r="2" fill="url(#filigree-gradient)" />
    <defs>
      <linearGradient
        id="filigree-gradient"
        x1="0"
        y1="0"
        x2="16"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#D4A574" />
        <stop offset="0.5" stopColor="#C9A227" />
        <stop offset="1" stopColor="#8B7355" />
      </linearGradient>
      <linearGradient
        id="filigree-gradient-dark"
        x1="0"
        y1="0"
        x2="8"
        y2="8"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8B7355" />
        <stop offset="1" stopColor="#5C4A32" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Mambobot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage } = useGemini();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');

        .mambobot-container {
          position: fixed;
          bottom: 0;
          right: 0;
          z-index: 9999;
          font-family: 'Cinzel', serif;
        }

        /* Always-visible base that covers the corner */
        .mambobot-base {
          position: relative;
          background: linear-gradient(145deg, #1a1209 0%, #0d0906 100%);
          box-shadow: 0 0 40px rgba(201, 162, 39, 0.15), 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        /* Brass frame effect */
        .mambobot-base::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: linear-gradient(145deg, #D4A574 0%, #C9A227 25%, #8B7355 50%, #C9A227 75%, #D4A574 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* Collapsed Plaque */
        .mambobot-plaque {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
          cursor: pointer;
          min-width: 210px;
          border: none;
          background: transparent;
          transition: all 0.2s ease;
        }

        .mambobot-plaque:hover {
          background: rgba(201, 162, 39, 0.08);
        }

        .mambobot-plaque:hover .mambobot-screen {
          box-shadow: inset 0 0 25px rgba(201, 162, 39, 0.35), 0 0 15px rgba(201, 162, 39, 0.15);
          border-color: rgba(201, 162, 39, 0.5);
        }

        .mambobot-plaque:hover .mambobot-title {
          text-shadow: 0 0 15px rgba(201, 162, 39, 0.6);
        }

        .mambobot-plaque:hover .mambobot-subtitle {
          color: rgba(201, 162, 39, 0.8);
        }

        .mambobot-plaque:hover .mambobot-filigree {
          opacity: 1;
        }

        .mambobot-plaque:hover .mambobot-button {
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.25), 0 0 25px rgba(201, 162, 39, 0.6);
        }

        /* Filigree corners */
        .mambobot-filigree {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.7;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .mambobot-filigree-tl { top: 4px; left: 4px; }
        .mambobot-filigree-tr { top: 4px; right: 4px; transform: scaleX(-1); }
        .mambobot-filigree-bl { bottom: 4px; left: 4px; transform: scaleY(-1); }
        .mambobot-filigree-br { bottom: 4px; right: 4px; transform: scale(-1); }

        /* Amber glass screen */
        .mambobot-screen {
          position: relative;
          flex: 1;
          padding: 10px 14px;
          background: linear-gradient(180deg, rgba(139, 90, 43, 0.35) 0%, rgba(50, 30, 10, 0.5) 100%);
          border: 1px solid rgba(201, 162, 39, 0.35);
          box-shadow: inset 0 0 15px rgba(201, 162, 39, 0.15), 0 0 10px rgba(201, 162, 39, 0.08);
          transition: all 0.3s ease;
        }

        .mambobot-screen::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(201, 162, 39, 0.12) 0%, transparent 70%);
          pointer-events: none;
          animation: mambobot-glow 3s ease-in-out infinite;
        }

        @keyframes mambobot-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .mambobot-title {
          font-family: 'Cinzel', serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #C9A227;
          text-shadow: 0 0 8px rgba(201, 162, 39, 0.4);
          margin: 0;
          line-height: 1;
          transition: text-shadow 0.3s ease;
        }

        .mambobot-subtitle {
          font-family: 'Cinzel', serif;
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.2em;
          color: rgba(201, 162, 39, 0.6);
          text-transform: uppercase;
          margin-top: 2px;
          transition: color 0.3s ease;
        }

        /* Brass button */
        .mambobot-button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(145deg, #D4A574 0%, #C9A227 30%, #8B7355 70%, #5C4A32 100%);
          border: 1px solid #C9A227;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.25), inset 0 -1px 2px rgba(0, 0, 0, 0.25), 0 0 10px rgba(201, 162, 39, 0.3);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .mambobot-button::before {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          right: 3px;
          bottom: 3px;
          border-radius: 50%;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .mambobot-button-icon {
          color: #1a1209;
          filter: drop-shadow(0 1px 1px rgba(255, 255, 255, 0.2));
        }

        .mambobot-plaque:hover .mambobot-button {
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.25), 0 0 18px rgba(201, 162, 39, 0.5);
        }

        /* Chat Window */
        .mambobot-chat {
          width: 340px;
          display: flex;
          flex-direction: column;
        }

        .mambobot-chat-header {
          padding: 12px 14px;
          background: linear-gradient(180deg, rgba(139, 90, 43, 0.25) 0%, rgba(50, 30, 10, 0.4) 100%);
          border-bottom: 1px solid rgba(201, 162, 39, 0.3);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mambobot-chat-header-content {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .mambobot-chat-title {
          font-family: 'Cinzel', serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #C9A227;
          text-shadow: 0 0 10px rgba(201, 162, 39, 0.4);
          margin: 0;
        }

        .mambobot-chat-subtitle {
          font-family: 'Cinzel', serif;
          font-size: 8px;
          letter-spacing: 0.2em;
          color: rgba(201, 162, 39, 0.5);
          text-transform: uppercase;
        }

        .mambobot-close-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(145deg, #5C4A32 0%, #3d2b1f 100%);
          border: 1px solid rgba(201, 162, 39, 0.3);
          color: rgba(201, 162, 39, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mambobot-close-btn:hover {
          background: linear-gradient(145deg, #8B7355 0%, #5C4A32 100%);
          color: #C9A227;
          border-color: #C9A227;
        }

        .mambobot-messages {
          height: 280px;
          padding: 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(13, 9, 6, 0.5);
        }

        .mambobot-messages::-webkit-scrollbar { width: 4px; }
        .mambobot-messages::-webkit-scrollbar-track { background: rgba(50, 30, 10, 0.3); }
        .mambobot-messages::-webkit-scrollbar-thumb { background: rgba(201, 162, 39, 0.25); border-radius: 2px; }

        .mambobot-message {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .mambobot-message-user {
          flex-direction: row-reverse;
        }

        .mambobot-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(145deg, #C9A227 0%, #8B7355 100%);
          border: 1px solid rgba(201, 162, 39, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-size: 10px;
          font-weight: 700;
          color: #1a1209;
          flex-shrink: 0;
        }

        .mambobot-avatar-user {
          background: linear-gradient(145deg, #3d2b1f 0%, #1a1209 100%);
          border-color: rgba(201, 162, 39, 0.25);
          color: #C9A227;
        }

        .mambobot-bubble {
          max-width: 78%;
          padding: 8px 11px;
          background: linear-gradient(145deg, rgba(139, 90, 43, 0.25) 0%, rgba(50, 30, 10, 0.35) 100%);
          border: 1px solid rgba(201, 162, 39, 0.25);
          font-size: 12px;
          line-height: 1.45;
          color: rgba(255, 248, 230, 0.85);
        }

        .mambobot-bubble-user {
          background: linear-gradient(145deg, rgba(201, 162, 39, 0.15) 0%, rgba(139, 90, 43, 0.25) 100%);
          border-color: rgba(201, 162, 39, 0.35);
        }

        .mambobot-input-container {
          padding: 12px;
          background: linear-gradient(180deg, rgba(50, 30, 10, 0.4) 0%, rgba(26, 18, 9, 0.6) 100%);
          border-top: 1px solid rgba(201, 162, 39, 0.25);
        }

        .mambobot-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 6px 10px;
          background: rgba(26, 18, 9, 0.7);
          border: 1px solid rgba(201, 162, 39, 0.25);
        }

        .mambobot-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: rgba(255, 248, 230, 0.85);
          font-size: 13px;
          font-family: inherit;
        }

        .mambobot-input::placeholder {
          color: rgba(201, 162, 39, 0.35);
        }

        .mambobot-send-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(145deg, #C9A227 0%, #8B7355 100%);
          border: none;
          color: #1a1209;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 0 8px rgba(201, 162, 39, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }

        .mambobot-send-btn:hover:not(:disabled) {
          background: linear-gradient(145deg, #D4A574 0%, #C9A227 100%);
          box-shadow: 0 0 15px rgba(201, 162, 39, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }

        .mambobot-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .mambobot-typing {
          display: flex;
          gap: 3px;
          padding: 6px 10px;
        }

        .mambobot-typing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #C9A227;
          animation: mambobot-typing 1.4s ease-in-out infinite;
        }

        .mambobot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .mambobot-typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes mambobot-typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-3px); opacity: 1; }
        }

        @media (max-width: 400px) {
          .mambobot-chat { width: 100vw; }
          .mambobot-plaque { min-width: 180px; padding: 12px 14px; }
          .mambobot-title { font-size: 12px; }
        }
      `}</style>

      <div className="mambobot-container">
        {/* Always-visible base that covers the corner - no gap during transitions */}
        <div className="mambobot-base">
          {isOpen ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, height: 68 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 68 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="mambobot-chat"
            >
              {/* Header */}
              <div className="mambobot-chat-header">
                <div className="mambobot-chat-header-content">
                  <h3 className="mambobot-chat-title">MAMBOBOT</h3>
                  <span className="mambobot-chat-subtitle">Concierge Service</span>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="mambobot-close-btn"
                  aria-label="Close chat"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <FaTimes size={11} />
                </motion.button>
              </div>

              {/* Messages */}
              <motion.div
                className="mambobot-messages"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                {messages.map((message) => {
                  // Skip rendering empty bot messages - they're placeholders during streaming
                  if (message.role === "model" && !message.content) {
                    return (
                      <div key={message.id} className="mambobot-message">
                        <div className="mambobot-avatar">M</div>
                        <div className="mambobot-bubble">
                          <div className="mambobot-typing">
                            <span className="mambobot-typing-dot" />
                            <span className="mambobot-typing-dot" />
                            <span className="mambobot-typing-dot" />
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={message.id}
                      className={`mambobot-message ${
                        message.role === "user" ? "mambobot-message-user" : ""
                      }`}
                    >
                      <div
                        className={`mambobot-avatar ${
                          message.role === "user" ? "mambobot-avatar-user" : ""
                        }`}
                      >
                        {message.role === "user" ? "U" : "M"}
                      </div>
                      <div
                        className={`mambobot-bubble ${
                          message.role === "user" ? "mambobot-bubble-user" : ""
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </motion.div>

              {/* Input */}
              <motion.div
                className="mambobot-input-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.2 }}
              >
                <div className="mambobot-input-wrapper">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask MamboBot anything..."
                    className="mambobot-input"
                    disabled={isLoading}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="mambobot-send-btn"
                    aria-label="Send message"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9, x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <FaPaperPlane size={11} />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="plaque"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setIsOpen(true)}
              className="mambobot-plaque"
              aria-label="Open MamboBot chat"
            >
              {/* Filigree corners */}
              <FiligreeCorner className="mambobot-filigree mambobot-filigree-tl" />
              <FiligreeCorner className="mambobot-filigree mambobot-filigree-tr" />
              <FiligreeCorner className="mambobot-filigree mambobot-filigree-bl" />
              <FiligreeCorner className="mambobot-filigree mambobot-filigree-br" />

              {/* Amber screen with text */}
              <div className="mambobot-screen">
                <h3 className="mambobot-title">MAMBOBOT</h3>
                <p className="mambobot-subtitle">Concierge Service</p>
              </div>

              {/* Brass button */}
              <div className="mambobot-button">
                <svg
                  className="mambobot-button-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                  <circle cx="8" cy="10" r="1.5" />
                  <circle cx="12" cy="10" r="1.5" />
                  <circle cx="16" cy="10" r="1.5" />
                </svg>
              </div>
            </motion.button>
          )}
        </div>
      </div>
    </>
  );
}
