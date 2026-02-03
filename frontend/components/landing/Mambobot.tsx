"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPaperPlane, FaRedo } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useGemini, Message } from "@/hooks/useGemini";
import RecommendationCard from "./RecommendationCard";

// Message bubble component
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  const hasRecommendation = message.functionCall?.result?.type === "recommendation";
  const hasKnowledgeBase = message.functionCall?.result?.type === "knowledge_base";

  const getRecommendationData = () => {
    if (message.functionCall?.result?.type === "recommendation") {
      return message.functionCall.result as {
        type: "recommendation";
        tier_info: {
          name: string;
          tier: string;
          price: string;
          period: string;
          description: string;
          features: string[];
          cta: string;
          ctaLink: string;
          highlighted?: boolean;
        };
        reasoning: string;
      };
    }
    return null;
  };

  const getKnowledgeBaseData = () => {
    if (message.functionCall?.result?.type === "knowledge_base") {
      return message.functionCall.result as {
        type: "knowledge_base";
        query: string;
        result: string;
      };
    }
    return null;
  };

  const recommendationData = getRecommendationData();
  const knowledgeBaseData = getKnowledgeBaseData();

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isUser
            ? "bg-zinc-700 text-white"
            : "bg-gradient-to-br from-mambo-gold to-amber-600 text-black"
        }`}
      >
        {isUser ? "U" : "T"}
      </div>
      
      <div className="flex flex-col gap-2 max-w-[85%]">
        {message.content && (
          <div
            className={`px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
              isUser
                ? "bg-mambo-gold/20 text-white border border-mambo-gold/30 rounded-br-md"
                : "bg-zinc-800/80 text-gray-200 border border-zinc-700/50 rounded-bl-md"
            }`}
          >
            {message.content}
          </div>
        )}

        {hasRecommendation && recommendationData && (
          <RecommendationCard
            tierInfo={recommendationData.tier_info}
            reasoning={recommendationData.reasoning}
          />
        )}

        {hasKnowledgeBase && knowledgeBaseData && (
          <div className="px-4 py-2.5 text-sm bg-purple-500/10 border border-purple-500/30 rounded-2xl rounded-bl-md">
            <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
              <HiSparkles className="text-xs" />
              Knowledge Base
            </div>
            <div className="text-gray-300">{knowledgeBaseData.result}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Mambobot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearHistory } = useGemini();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div className="fixed bottom-4 right-4 z-[9999]">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[360px] max-w-[calc(100vw-2rem)] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 border-b border-zinc-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mambo-gold to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="text-black font-bold text-sm">T</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Tito P</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-gray-400">AI Concierge</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={clearHistory}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  whileHover={{ rotate: -180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  title="Reset conversation"
                >
                  <FaRedo size={10} />
                </motion.button>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes size={12} />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[320px] p-4 overflow-y-auto flex flex-col gap-4 bg-gradient-to-b from-zinc-900/50 to-black/50 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700">
              {messages.map((message) => {
                if (message.role === "model" && !message.content && !message.functionCall) {
                  return (
                    <div key={message.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-mambo-gold to-amber-600 flex items-center justify-center text-xs font-bold text-black">
                        T
                      </div>
                      <div className="px-4 py-2.5 bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-mambo-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-mambo-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-mambo-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  );
                }
                return <MessageBubble key={message.id} message={message} />;
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-zinc-900/80 border-t border-zinc-700/50">
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/80 border border-zinc-700/50 rounded-full focus-within:border-mambo-gold/50 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Tito P anything..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
                  disabled={isLoading}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-mambo-gold to-amber-500 hover:from-amber-500 hover:to-mambo-gold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-black transition-all shadow-lg shadow-amber-500/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPaperPlane size={12} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="bubble"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 hover:border-mambo-gold/50 rounded-full shadow-2xl shadow-black/50 transition-all"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-mambo-gold/0 via-mambo-gold/10 to-mambo-gold/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Avatar */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-mambo-gold to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-black font-bold text-sm">T</span>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-900" />
            </div>

            {/* Text */}
            <div className="relative text-left pr-2">
              <div className="text-sm font-bold text-white">Tito P</div>
              <div className="text-[11px] text-gray-400">AI Concierge</div>
            </div>

            {/* Chat icon indicator */}
            <div className="relative w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-mambo-gold/20 flex items-center justify-center transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 group-hover:text-mambo-gold transition-colors">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
              </svg>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
