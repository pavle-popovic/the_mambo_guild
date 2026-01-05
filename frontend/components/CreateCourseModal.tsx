"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    slug: string;
    description?: string;
    difficulty: string;
    order_index: number;
    is_free: boolean;
    is_published: boolean;
    image_url?: string;
  }) => Promise<void>;
  defaultOrderIndex: number;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onCreate,
  defaultOrderIndex,
}: CreateCourseModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [isFree, setIsFree] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(autoSlug);
    }
  }, [title, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Course title is required");
      return;
    }
    
    if (!slug.trim()) {
      setError("Course slug is required");
      return;
    }

    setError("");
    setIsCreating(true);

    try {
      await onCreate({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        difficulty: difficulty.toUpperCase(),
        order_index: defaultOrderIndex,
        is_free: isFree,
        is_published: isPublished,
        image_url: imageUrl.trim() || undefined,
      });
      
      // Reset form
      setTitle("");
      setSlug("");
      setDescription("");
      setDifficulty("BEGINNER");
      setIsFree(false);
      setIsPublished(false);
      setImageUrl("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create course");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setTitle("");
      setSlug("");
      setDescription("");
      setDifficulty("BEGINNER");
      setIsFree(false);
      setIsPublished(false);
      setImageUrl("");
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-mambo-panel border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-mambo-text">Create New Course</h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-mambo-text mb-2">
              Course Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Mambo 101"
              required
              disabled={isCreating}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-bold text-mambo-text mb-2">
              URL Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., mambo-101"
              required
              disabled={isCreating}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-400">Auto-generated from title, but you can edit it</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-mambo-text mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a detailed description of the course..."
              rows={4}
              disabled={isCreating}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none resize-none disabled:opacity-50"
            />
          </div>

          {/* Difficulty and Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-bold text-mambo-text mb-2">
                Difficulty <span className="text-red-400">*</span>
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isCreating}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none disabled:opacity-50"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-bold text-mambo-text mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isCreating}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                disabled={isCreating}
                className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-mambo-blue focus:ring-2 focus:ring-mambo-blue focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer disabled:opacity-50"
              />
              <span className="text-mambo-text-light group-hover:text-mambo-text transition">
                Make this course free for all users
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                disabled={isCreating}
                className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-mambo-blue focus:ring-2 focus:ring-mambo-blue focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer disabled:opacity-50"
              />
              <span className="text-mambo-text-light group-hover:text-mambo-text transition">
                Publish course (make it visible to students)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !title.trim() || !slug.trim()}
              className="px-6 py-2 bg-mambo-blue hover:bg-blue-600 text-white rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

