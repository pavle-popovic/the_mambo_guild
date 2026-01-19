import { useState, useCallback, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

interface UseGeminiReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  rateLimitRemaining: number | null;
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  stopGenerating: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useGemini(): UseGeminiReturn {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: "Splendid! Welcome to The Mambo Inn. I am MamboBot, your dedicated concierge. How may I assist your dance journey today, my friend?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    const botMessageId = "model-" + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: botMessageId,
        role: "model",
        content: "",
        timestamp: new Date(),
      },
    ]);

    try {
      const apiMessages = messages
        .filter((m) => m.id !== "welcome" && m.content.trim())
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        }));

      apiMessages.push({
        role: "user",
        content: message.trim(),
      });

      const response = await fetch(API_URL + "/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      const remaining = response.headers.get("X-RateLimit-Remaining");
      if (remaining) {
        setRateLimitRemaining(parseInt(remaining, 10));
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || "Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split(/\r?\n/);

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.content) {
                accumulatedText += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMessageId ? { ...m, content: accumulatedText } : m
                  )
                );
              }
              if (parsed.done) break;
            } catch (parseError) {
              if (parseError instanceof Error && !parseError.message.includes("JSON")) {
                throw parseError;
              }
            }
          }
        }
      }

      if (!accumulatedText.trim()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMessageId
              ? { ...m, content: "My apologies, I seem to have missed a step! Could you try that again?" }
              : m
          )
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMessageId ? { ...m, content: m.content || "[Response cancelled]" } : m
          )
        );
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMessageId
            ? { ...m, content: "My apologies, I seem to have missed a step! Could you try that again?" }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages]);

  const clearHistory = useCallback(() => {
    stopGenerating();
    setMessages([
      {
        id: "welcome",
        role: "model",
        content: "Splendid! Welcome to The Mambo Inn. I am MamboBot, your dedicated concierge. How may I assist your dance journey today, my friend?",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }, [stopGenerating]);

  return {
    messages,
    isLoading,
    error,
    rateLimitRemaining,
    sendMessage,
    clearHistory,
    stopGenerating,
  };
}
