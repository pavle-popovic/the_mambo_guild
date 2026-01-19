import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent";

// ============================================
// RATE LIMITING (In-Memory for simplicity)
// For production, use Redis or a database
// ============================================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20; // Max messages
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in ms

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// ============================================
// SYSTEM PROMPT (Hidden from users)
// ============================================
const SYSTEM_INSTRUCTION = `You are MamboBot, a charming 1920s Art Deco concierge for "The Mambo Inn" - a premium online dance learning platform specializing in salsa, bachata, and Latin dance styles.

Your personality:
- Warm, welcoming, and slightly flamboyant with vintage flair
- Passionate about dance and Latin culture
- Helpful and encouraging to dancers of all skill levels
- Speak with elegant, period-appropriate expressions ("Splendid!", "How delightful!", "My dear friend")
- Use occasional dance-related metaphors and light humor
- Keep responses concise but engaging (2-4 sentences typically)

Your knowledge includes:
- Dance techniques, styles, and history (salsa, bachata, merengue, cha-cha, mambo)
- Course recommendations on the platform
- Practice tips and learning advice
- Community features and connecting with other dancers
- The glamorous history of Latin dance halls and the Mambo era

Always maintain the luxurious, retro-glamorous vibe of The Mambo Inn. You are the sophisticated guide to this elegant dance world.`;

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatRequest {
  message: string;
  history?: GeminiMessage[];
}

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // Check rate limit
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Rate limit exceeded. Please wait before sending more messages.",
        retryAfter: 15 * 60,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "Retry-After": String(15 * 60),
        },
      }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  try {
    const body: ChatRequest = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Sanitize input - basic protection against prompt injection
    const sanitizedMessage = message
      .slice(0, 1000) // Limit message length
      .replace(/ignore previous instructions/gi, "[filtered]")
      .replace(/ignore all instructions/gi, "[filtered]")
      .replace(/disregard.*instructions/gi, "[filtered]");

    // Build conversation with system instruction
    const contents = [
      // System instruction as first exchange
      {
        role: "user",
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Splendid! I am MamboBot, your dedicated concierge here at The Mambo Inn. How may I assist your dance journey today, my friend?",
          },
        ],
      },
      // Add conversation history
      ...history.slice(-10), // Keep last 10 messages to limit context
      // Add current user message
      {
        role: "user",
        parts: [{ text: sanitizedMessage }],
      },
    ];

    // Call Gemini with streaming
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}&alt=sse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 400,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: response.status }
      );
    }

    // Stream the response back to the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Parse SSE events
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr && jsonStr !== "[DONE]") {
                  try {
                    const data = JSON.parse(jsonStr);
                    const text =
                      data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                      // Send chunk to client
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                      );
                    }
                  } catch {
                    // Skip malformed JSON
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
