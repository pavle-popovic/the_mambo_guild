"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaVideo, FaImage, FaFileAlt, FaQuestionCircle, FaArrowUp, FaArrowDown, FaTrash } from "react-icons/fa";

interface ContentBlock {
  type: "video" | "text" | "image" | "quiz";
  id: string;
  [key: string]: any;
}

interface LessonContentEditorProps {
  contentJson: any | null;
  onSave: (content: { blocks: any[] }) => void;
  onClose: () => void;
}

export default function LessonContentEditor({
  contentJson,
  onSave,
  onClose,
}: LessonContentEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    if (contentJson && contentJson.blocks) {
      // Add IDs to blocks if they don't have them
      setBlocks(
        contentJson.blocks.map((block: any, index: number) => ({
          ...block,
          id: block.id || `block-${index}`,
        }))
      );
    } else {
      setBlocks([]);
    }
  }, [contentJson]);

  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      type,
      id: `block-${Date.now()}-${Math.random()}`,
      ...(type === "video" && { url: "", embed_code: "", provider: "youtube" }),
      ...(type === "text" && { content: "", format: "markdown" }),
      ...(type === "image" && { url: "", caption: "", alt: "" }),
      ...(type === "quiz" && { title: "", questions: [] }),
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(
      blocks.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    ) {
      return;
    }
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
  };

  const handleSave = () => {
    onSave({ blocks });
    onClose();
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case "video":
        return (
          <VideoBlockEditor
            block={block}
            onUpdate={(updates) => updateBlock(block.id, updates)}
          />
        );
      case "text":
        return (
          <TextBlockEditor
            block={block}
            onUpdate={(updates) => updateBlock(block.id, updates)}
          />
        );
      case "image":
        return (
          <ImageBlockEditor
            block={block}
            onUpdate={(updates) => updateBlock(block.id, updates)}
          />
        );
      case "quiz":
        return (
          <QuizBlockEditor
            block={block}
            onUpdate={(updates) => updateBlock(block.id, updates)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-mambo-panel border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-mambo-text">Edit Lesson Content</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-mambo-text transition"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {blocks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">No content blocks yet.</p>
              <p className="text-sm">Add your first content block below.</p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div
                key={block.id}
                className="bg-black border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {block.type === "video" && <FaVideo className="text-blue-400" />}
                    {block.type === "text" && <FaFileAlt className="text-green-400" />}
                    {block.type === "image" && <FaImage className="text-purple-400" />}
                    {block.type === "quiz" && <FaQuestionCircle className="text-yellow-400" />}
                    <span className="text-xs font-bold text-gray-400 uppercase">
                      {block.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveBlock(index, "up")}
                      disabled={index === 0}
                      className="text-gray-500 hover:text-mambo-text disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => moveBlock(index, "down")}
                      disabled={index === blocks.length - 1}
                      className="text-gray-500 hover:text-mambo-text disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <FaArrowDown />
                    </button>
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="text-gray-500 hover:text-red-400"
                      title="Delete block"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                {renderBlockEditor(block, index)}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Add block:</span>
              <button
                onClick={() => addBlock("video")}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <FaVideo /> Video
              </button>
              <button
                onClick={() => addBlock("text")}
                className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <FaFileAlt /> Text
              </button>
              <button
                onClick={() => addBlock("image")}
                className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <FaImage /> Image
              </button>
              <button
                onClick={() => addBlock("quiz")}
                className="px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <FaQuestionCircle /> Quiz
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-mambo-blue hover:bg-blue-600 text-white rounded-lg font-medium"
              >
                Save Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Video Block Editor
function VideoBlockEditor({
  block,
  onUpdate,
}: {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Video URL
        </label>
        <input
          type="text"
          value={block.url || ""}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-blue-600 outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Or Embed Code
        </label>
        <textarea
          value={block.embed_code || ""}
          onChange={(e) => onUpdate({ embed_code: e.target.value })}
          placeholder="<iframe>...</iframe>"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-blue-600 outline-none font-mono"
        />
      </div>
    </div>
  );
}

// Text Block Editor
function TextBlockEditor({
  block,
  onUpdate,
}: {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Format
        </label>
        <select
          value={block.format || "markdown"}
          onChange={(e) => onUpdate({ format: e.target.value })}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-green-600 outline-none"
        >
          <option value="markdown">Markdown</option>
          <option value="html">HTML</option>
          <option value="plain">Plain Text</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Content
        </label>
        <textarea
          value={block.content || ""}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Enter your text content..."
          rows={8}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-green-600 outline-none font-mono"
        />
      </div>
    </div>
  );
}

// Image Block Editor
function ImageBlockEditor({
  block,
  onUpdate,
}: {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Image URL
        </label>
        <input
          type="text"
          value={block.url || ""}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-purple-600 outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Alt Text
        </label>
        <input
          type="text"
          value={block.alt || ""}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Description for screen readers"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-purple-600 outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Caption (optional)
        </label>
        <input
          type="text"
          value={block.caption || ""}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          placeholder="Image caption"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-purple-600 outline-none"
        />
      </div>
    </div>
  );
}

// Quiz Block Editor
function QuizBlockEditor({
  block,
  onUpdate,
}: {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}) {
  const questions = block.questions || [];

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      options: [""],
      correct_answer: 0,
      explanation: "",
    };
    onUpdate({ questions: [...questions, newQuestion] });
  };

  const updateQuestion = (index: number, updates: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ questions: updated });
  };

  const deleteQuestion = (index: number) => {
    onUpdate({ questions: questions.filter((_, i) => i !== index) });
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = [...updated[questionIndex].options, ""];
    onUpdate({ questions: updated });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    onUpdate({ questions: updated });
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    // Adjust correct_answer if needed
    if (updated[questionIndex].correct_answer >= updated[questionIndex].options.length) {
      updated[questionIndex].correct_answer = Math.max(0, updated[questionIndex].options.length - 1);
    }
    onUpdate({ questions: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Quiz Title (optional)
        </label>
        <input
          type="text"
          value={block.title || ""}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Quiz Title"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-yellow-600 outline-none"
        />
      </div>

      <div className="space-y-4">
        {questions.map((q: any, qIndex: number) => (
          <div key={qIndex} className="bg-gray-900 border border-gray-700 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-400">Question {qIndex + 1}</span>
              <button
                onClick={() => deleteQuestion(qIndex)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                <FaTrash />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={q.question || ""}
                  onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                  placeholder="Enter question..."
                  className="w-full bg-black border border-gray-600 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-yellow-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Options
                </label>
                {q.options?.map((option: string, oIndex: number) => (
                  <div key={oIndex} className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correct_answer === oIndex}
                      onChange={() => updateQuestion(qIndex, { correct_answer: oIndex })}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      className="flex-1 bg-black border border-gray-600 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-yellow-600 outline-none"
                    />
                    {q.options.length > 1 && (
                      <button
                        onClick={() => deleteOption(qIndex, oIndex)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addOption(qIndex)}
                  className="text-sm text-yellow-400 hover:text-yellow-300 mt-2"
                >
                  + Add Option
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Explanation (optional)
                </label>
                <textarea
                  value={q.explanation || ""}
                  onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                  placeholder="Explain why this answer is correct..."
                  rows={2}
                  className="w-full bg-black border border-gray-600 rounded px-3 py-2 text-sm text-mambo-text-light focus:border-yellow-600 outline-none"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-2 border border-dashed border-gray-600 hover:border-yellow-400 text-gray-400 hover:text-yellow-400 rounded-lg text-sm font-medium"
        >
          + Add Question
        </button>
      </div>
    </div>
  );
}

