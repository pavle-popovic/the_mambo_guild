"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-lg max-w-none">
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-bold text-white mt-6 mb-3">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-lg font-bold text-white mt-4 mb-2">{children}</h4>
        ),
        p: ({ children }) => (
          <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="text-white font-bold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-gray-200 italic">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2 ml-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2 ml-4">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-gray-300">{children}</li>
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-gray-800 text-green-400 px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ) : (
            <code className="block bg-gray-900 text-green-400 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm">
              {children}
            </code>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-mambo-blue pl-4 my-4 italic text-gray-400">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mambo-blue hover:text-blue-400 underline"
          >
            {children}
          </a>
        ),
        hr: () => (
          <hr className="border-gray-700 my-6" />
        ),
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            className="rounded-lg my-4 max-w-full"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}

