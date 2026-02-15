"use client";

import { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import DOMPurify from "dompurify";

interface ContentBlock {
  type: "video" | "text" | "image" | "quiz";
  id?: string;
  [key: string]: any;
}

interface RichContentRendererProps {
  contentJson: any | null;
}

export default function RichContentRenderer({ contentJson }: RichContentRendererProps) {
  if (!contentJson || !contentJson.blocks || contentJson.blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {contentJson.blocks.map((block: ContentBlock, index: number) => (
        <div key={block.id || index} className="rich-content-block">
          {block.type === "video" && <VideoBlock block={block} />}
          {block.type === "text" && <TextBlock block={block} />}
          {block.type === "image" && <ImageBlock block={block} />}
          {block.type === "quiz" && <QuizBlock block={block} />}
        </div>
      ))}
    </div>
  );
}

// Video Block Component
function VideoBlock({ block }: { block: ContentBlock }) {
  const [playing, setPlaying] = useState(false);

  if (block.embed_code) {
    return (
      <div
        className="video-container"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.embed_code, { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"] }) }}
      />
    );
  }

  if (block.url) {
    if (playing) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
          <video
            controls
            autoPlay
            className="w-full h-full"
            src={block.url}
          />
        </div>
      );
    }

    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg relative group cursor-pointer overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: `url(${block.url})`,
          }}
        />
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-blue-600/90 hover:bg-blue-600 rounded-full flex items-center justify-center backdrop-blur-sm transition hover:scale-110 shadow-lg shadow-blue-500/50">
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </button>
      </div>
    );
  }

  return null;
}

// Text Block Component
function TextBlock({ block }: { block: ContentBlock }) {
  const format = block.format || "markdown";
  const content = block.content || "";

  if (format === "html") {
    return (
      <div
        className="prose prose-invert prose-lg max-w-none text-gray-300"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      />
    );
  }

  if (format === "markdown") {
    // Simple markdown rendering (for full markdown support, consider using react-markdown)
    const html = content
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/\n/gim, "<br />");

    return (
      <div
        className="prose prose-invert prose-lg max-w-none text-gray-300"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
      />
    );
  }

  // Plain text
  return (
    <div className="prose prose-invert prose-lg max-w-none text-gray-300 whitespace-pre-wrap">
      {content}
    </div>
  );
}

// Image Block Component
function ImageBlock({ block }: { block: ContentBlock }) {
  if (!block.url) return null;

  return (
    <figure className="my-6">
      <div className="rounded-lg overflow-hidden bg-gray-900">
        <img
          src={block.url}
          alt={block.alt || block.caption || "Image"}
          className="w-full h-auto"
        />
      </div>
      {block.caption && (
        <figcaption className="mt-3 text-sm text-gray-400 text-center italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

// Quiz Block Component
function QuizBlock({ block }: { block: ContentBlock }) {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const questions = block.questions || [];

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionIndex]: optionIndex });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((q: any, qIndex: number) => {
      if (answers[qIndex] === q.correct_answer) {
        correct++;
      }
    });
    return { correct, total: questions.length };
  };

  const score = submitted ? getScore() : null;

  return (
    <div className="bg-mambo-panel border border-white/10 rounded-xl p-6">
      {block.title && (
        <h3 className="text-xl font-bold text-mambo-text mb-6">{block.title}</h3>
      )}

      <div className="space-y-6">
        {questions.map((q: any, qIndex: number) => {
          const isCorrect = submitted && answers[qIndex] === q.correct_answer;
          const isWrong = submitted && answers[qIndex] !== q.correct_answer && answers[qIndex] !== undefined;

          return (
            <div
              key={qIndex}
              className={`border rounded-lg p-4 ${isCorrect
                  ? "border-green-500 bg-green-500/10"
                  : isWrong
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-700"
                }`}
            >
              <h4 className="font-bold text-mambo-text mb-3">
                {qIndex + 1}. {q.question}
              </h4>

              <div className="space-y-2">
                {q.options?.map((option: string, oIndex: number) => {
                  const isSelected = answers[qIndex] === oIndex;
                  const isCorrectAnswer = submitted && oIndex === q.correct_answer;

                  return (
                    <button
                      key={oIndex}
                      onClick={() => handleAnswer(qIndex, oIndex)}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded-lg border transition ${isSelected
                          ? isCorrectAnswer
                            ? "bg-green-600/20 border-green-500 text-green-300"
                            : isWrong
                              ? "bg-red-600/20 border-red-500 text-red-300"
                              : "bg-blue-600/20 border-blue-500 text-blue-300"
                          : isCorrectAnswer && submitted
                            ? "bg-green-600/10 border-green-500/50 text-green-400"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                        } ${submitted ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-3">
                        {isSelected && (
                          <FaCheck
                            className={isCorrectAnswer ? "text-green-400" : "text-red-400"}
                          />
                        )}
                        {isCorrectAnswer && submitted && !isSelected && (
                          <FaCheck className="text-green-400" />
                        )}
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <div className="mt-3 p-3 bg-gray-900/50 rounded text-sm text-gray-400">
                  <strong className="text-gray-300">Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== questions.length}
          className="mt-6 w-full py-3 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg text-center">
          <div className="text-2xl font-bold text-mambo-text mb-2">
            Score: {score?.correct} / {score?.total}
          </div>
          <div className="text-gray-400">
            {score && score.correct === score.total
              ? "Perfect! 🎉"
              : score && score.correct >= score.total / 2
                ? "Good job! 👍"
                : "Keep practicing! 💪"}
          </div>
        </div>
      )}
    </div>
  );
}

