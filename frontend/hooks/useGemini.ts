import { useState, useCallback, useRef } from "react";

// Types for function call results
interface RecommendationResult {
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
}

interface KnowledgeBaseResult {
  type: "knowledge_base";
  query: string;
  result: string;
}

type FunctionCallResult = RecommendationResult | KnowledgeBaseResult;

interface FunctionCall {
  name: string;
  args: Record<string, string>;
  result: FunctionCallResult;
}

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
  functionCall?: FunctionCall;
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

const DIEGO_WELCOME_MESSAGE = `Bienvenido to The Mambo Guild! I'm Diego, your concierge. Whether you're taking your first steps or ready to shine on stage, I'm here to guide you. What brings you to salsa today?`;

export function useGemini(): UseGeminiReturn {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: DIEGO_WELCOME_MESSAGE,
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
      // Build API messages from history (excluding welcome message and function calls)
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
      let functionCall: FunctionCall | undefined;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const parts = buffer.split(/\n\n/);
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split(/\r?\n/);
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);

                // Handle different message types
                switch (parsed.type) {
                  case "text":
                    if (parsed.content) {
                      accumulatedText += parsed.content;
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === botMessageId
                            ? { ...m, content: accumulatedText }
                            : m
                        )
                      );
                    }
                    break;

                  case "function_call":
                    functionCall = {
                      name: parsed.name,
                      args: parsed.args,
                      result: parsed.result,
                    };
                    // Update message with function call
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === botMessageId
                          ? { ...m, functionCall }
                          : m
                      )
                    );
                    break;

                  case "error":
                    throw new Error(parsed.error || "An error occurred");

                  case "done":
                    // Stream complete
                    break;
                }
              } catch (parseError) {
                if (parseError instanceof Error && !parseError.message.includes("JSON")) {
                  throw parseError;
                }
              }
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split(/\r?\n/);
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "text" && parsed.content) {
                accumulatedText += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMessageId
                      ? { ...m, content: accumulatedText }
                      : m
                  )
                );
              } else if (parsed.type === "function_call") {
                functionCall = {
                  name: parsed.name,
                  args: parsed.args,
                  result: parsed.result,
                };
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMessageId
                      ? { ...m, functionCall }
                      : m
                  )
                );
              }
            } catch {
              // Ignore incomplete JSON
            }
          }
        }
      }

      // If no text content and no function call, show a fallback
      if (!accumulatedText.trim() && !functionCall) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMessageId
              ? { ...m, content: "Perdón, I missed a step there. Could you try again, mi amigo?" }
              : m
          )
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMessageId
              ? { ...m, content: m.content || "[Response cancelled]" }
              : m
          )
        );
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMessageId
            ? { ...m, content: "Ay, something went wrong on my end. Please try again in a moment." }
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
        content: DIEGO_WELCOME_MESSAGE,
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
