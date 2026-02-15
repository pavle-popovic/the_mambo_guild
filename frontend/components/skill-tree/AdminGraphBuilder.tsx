"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash2,
    Save,
    Link as LinkIcon,
    Unlink,
    Edit3,
    BookOpen,
    AlertTriangle,
    X,
} from "lucide-react";

interface Level {
    id: string;
    title: string;
    description?: string;
    x_position: number;
    y_position: number;
    lesson_count?: number;
    thumbnail_url?: string;
}

interface Edge {
    id: string;
    from_level_id: string;
    to_level_id: string;
}

interface AdminGraphBuilderProps {
    worldId: string;
    levels: Level[];
    edges: Edge[];
    onUpdate: () => void;
    onEditLevel?: (level: Level) => void;
    onManageLessons?: (levelId: string) => void;
}

export default function AdminGraphBuilder({
    worldId,
    levels: initialLevels,
    edges: initialEdges,
    onUpdate,
    onEditLevel,
    onManageLessons,
}: AdminGraphBuilderProps) {
    const [levels, setLevels] = useState<Level[]>(initialLevels);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [draggedNode, setDraggedNode] = useState<string | null>(null);
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLevelTitle, setNewLevelTitle] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLevels(initialLevels);
        setEdges(initialEdges);
    }, [initialLevels, initialEdges]);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const handleNodeDragStart = (levelId: string) => {
        setDraggedNode(levelId);
        setSelectedNode(levelId);
    };

    const handleNodeDrag = (levelId: string, e: React.MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Clamp to boundaries
        const clampedX = Math.max(5, Math.min(95, x));
        const clampedY = Math.max(5, Math.min(95, y));

        setLevels((prev) =>
            prev.map((level) =>
                level.id === levelId
                    ? { ...level, x_position: clampedX, y_position: clampedY }
                    : level
            )
        );
    };

    const handleNodeDragEnd = async (levelId: string) => {
        setDraggedNode(null);

        // Save position to backend
        const level = levels.find((l) => l.id === levelId);
        if (!level) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${levelId}/position`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include" as RequestCredentials,
                    body: JSON.stringify({
                        x_position: level.x_position,
                        y_position: level.y_position,
                    }),
                }
            );

            if (!response.ok) {
                console.error("Failed to save position");
            }
        } catch (err) {
            console.error("Error saving position:", err);
        }
    };

    const handleConnectStart = (levelId: string) => {
        setConnectingFrom(levelId);
    };

    const handleConnectEnd = async (toLevelId: string) => {
        if (!connectingFrom || connectingFrom === toLevelId) {
            setConnectingFrom(null);
            return;
        }

        // Check if edge already exists
        const exists = edges.some(
            (e) => e.from_level_id === connectingFrom && e.to_level_id === toLevelId
        );

        if (exists) {
            setConnectingFrom(null);
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/worlds/${worldId}/edges`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include" as RequestCredentials,
                    body: JSON.stringify({
                        from_level_id: connectingFrom,
                        to_level_id: toLevelId,
                    }),
                }
            );

            if (response.ok) {
                const newEdge = await response.json();
                setEdges((prev) => [...prev, newEdge]);
                onUpdate();
            }
        } catch (err) {
            console.error("Error creating edge:", err);
        }

        setConnectingFrom(null);
    };

    const handleDeleteEdge = async (edgeId: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/edges/${edgeId}`,
                {
                    method: "DELETE",
                    credentials: "include" as RequestCredentials,
                }
            );

            if (response.ok) {
                setEdges((prev) => prev.filter((e) => e.id !== edgeId));
                onUpdate();
            }
        } catch (err) {
            console.error("Error deleting edge:", err);
        }
    };

    const handleCreateLevel = async () => {
        if (!newLevelTitle.trim()) return;

        setIsCreating(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/worlds/${worldId}/levels`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include" as RequestCredentials,
                    body: JSON.stringify({
                        title: newLevelTitle.trim(),
                        description: "",
                        x_position: 50, // Center of canvas
                        y_position: 50,
                    }),
                }
            );

            if (response.ok) {
                const newLevel = await response.json();
                setLevels((prev) => [...prev, { ...newLevel, lesson_count: 0 }]);
                setNewLevelTitle("");
                setShowAddModal(false);
                onUpdate();
            }
        } catch (err) {
            console.error("Error creating level:", err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteLevel = async (levelId: string) => {
        setIsDeleting(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${levelId}`,
                {
                    method: "DELETE",
                    credentials: "include" as RequestCredentials,
                }
            );

            if (response.ok) {
                // Remove level and its edges
                setLevels((prev) => prev.filter((l) => l.id !== levelId));
                setEdges((prev) =>
                    prev.filter(
                        (e) => e.from_level_id !== levelId && e.to_level_id !== levelId
                    )
                );
                setShowDeleteConfirm(null);
                setSelectedNode(null);
                onUpdate();
            }
        } catch (err) {
            console.error("Error deleting level:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const getLevelPosition = (levelId: string) => {
        const level = levels.find((l) => l.id === levelId);
        if (!level) return { x: 0, y: 0 };
        return {
            x: (level.x_position / 100) * dimensions.width,
            y: (level.y_position / 100) * dimensions.height,
        };
    };

    return (
        <div className="w-full bg-mambo-panel border border-gray-700 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="bg-mambo-dark border-b border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-mambo-text">Graph Builder</h3>
                    {connectingFrom && (
                        <span className="text-sm text-blue-400">
                            Click another node to create edge...
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Level
                    </button>
                    <button
                        onClick={() => setConnectingFrom(null)}
                        className={`px-4 py-2 rounded-lg transition ${connectingFrom
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-gray-700 text-gray-400 cursor-not-allowed"
                            }`}
                        disabled={!connectingFrom}
                    >
                        <Unlink className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="relative bg-black/40"
                style={{ height: "600px" }}
            >
                {/* SVG Layer for Edges */}
                <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                        </marker>
                    </defs>

                    {edges.map((edge) => {
                        const from = getLevelPosition(edge.from_level_id);
                        const to = getLevelPosition(edge.to_level_id);

                        return (
                            <g key={edge.id}>
                                <line
                                    x1={from.x}
                                    y1={from.y}
                                    x2={to.x}
                                    y2={to.y}
                                    stroke="#6b7280"
                                    strokeWidth="2"
                                    markerEnd="url(#arrowhead)"
                                />
                                {/* Delete button for edge */}
                                <circle
                                    cx={(from.x + to.x) / 2}
                                    cy={(from.y + to.y) / 2}
                                    r="12"
                                    fill="#ef4444"
                                    className="cursor-pointer pointer-events-auto"
                                    onClick={() => handleDeleteEdge(edge.id)}
                                />
                                <text
                                    x={(from.x + to.x) / 2}
                                    y={(from.y + to.y) / 2 + 4}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="12"
                                    className="pointer-events-none"
                                >
                                    ×
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Nodes */}
                {levels.map((level) => {
                    const pos = getLevelPosition(level.id);
                    const isSelected = selectedNode === level.id;
                    const isConnecting = connectingFrom === level.id;

                    return (
                        <motion.div
                            key={level.id}
                            className={`absolute w-40 cursor-move ${isSelected ? "z-50" : "z-10"
                                }`}
                            style={{
                                left: pos.x,
                                top: pos.y,
                                transform: "translate(-50%, -50%)",
                            }}
                            drag
                            dragMomentum={false}
                            dragElastic={0}
                            onDragStart={() => handleNodeDragStart(level.id)}
                            onDrag={(e) => handleNodeDrag(level.id, e as any)}
                            onDragEnd={() => handleNodeDragEnd(level.id)}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div
                                className={`p-3 rounded-xl border-2 backdrop-blur-md transition-all ${isConnecting
                                        ? "bg-blue-500/30 border-blue-400"
                                        : isSelected
                                            ? "bg-amber-500/20 border-amber-400"
                                            : "bg-gray-800/80 border-gray-600 hover:border-gray-500"
                                    }`}
                            >
                                <div className="text-sm font-semibold text-mambo-text mb-1 truncate">
                                    {level.title}
                                </div>
                                <div className="text-xs text-gray-400 mb-2">
                                    {level.lesson_count || 0} lessons
                                </div>

                                {/* Primary Action Buttons Row */}
                                <div className="flex gap-1 mb-1">
                                    {onEditLevel && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditLevel(level);
                                            }}
                                            className="flex-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 rounded text-xs flex items-center justify-center gap-1 text-white"
                                            title="Edit Level"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                        </button>
                                    )}
                                    {onManageLessons && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onManageLessons(level.id);
                                            }}
                                            className="flex-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs flex items-center justify-center gap-1 text-white"
                                            title="Manage Lessons"
                                        >
                                            <BookOpen className="w-3 h-3" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm(level.id);
                                        }}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs flex items-center justify-center text-white"
                                        title="Delete Level"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Connection Buttons Row */}
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleConnectStart(level.id);
                                        }}
                                        className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs flex items-center justify-center gap-1 text-white"
                                        title="Start Connection"
                                    >
                                        <LinkIcon className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (connectingFrom) {
                                                handleConnectEnd(level.id);
                                            }
                                        }}
                                        className={`flex-1 px-2 py-1 rounded text-xs text-white ${connectingFrom && connectingFrom !== level.id
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-gray-700 opacity-50 cursor-not-allowed"
                                            }`}
                                        disabled={!connectingFrom || connectingFrom === level.id}
                                    >
                                        Connect
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Instructions */}
            <div className="bg-mambo-dark border-t border-gray-700 p-4 text-sm text-gray-400">
                <strong>Instructions:</strong> Drag nodes to reposition. Use Edit/Lessons buttons to manage content.
                Click Link icon then Connect on target to create edges. Click red X on edges to delete.
            </div>

            {/* Add Level Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-mambo-panel border border-gray-700 rounded-xl shadow-2xl w-full max-w-md pointer-events-auto"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                            >
                                <div className="p-6 border-b border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-mambo-text">Add New Level</h3>
                                        <button
                                            onClick={() => setShowAddModal(false)}
                                            className="p-2 hover:bg-gray-800 rounded-lg transition"
                                        >
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Level Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newLevelTitle}
                                        onChange={(e) => setNewLevelTitle(e.target.value)}
                                        placeholder="Enter level title..."
                                        className="w-full px-4 py-3 bg-mambo-dark border border-gray-700 rounded-lg text-mambo-text focus:outline-none focus:border-amber-500"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleCreateLevel();
                                        }}
                                    />
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => setShowAddModal(false)}
                                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateLevel}
                                            disabled={!newLevelTitle.trim() || isCreating}
                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4" />
                                                    Create Level
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteConfirm(null)}
                        />
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-mambo-panel border border-red-900/50 rounded-xl shadow-2xl w-full max-w-md pointer-events-auto"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                            >
                                <div className="p-6 border-b border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                            <AlertTriangle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-mambo-text">Delete Level?</h3>
                                            <p className="text-sm text-gray-400">This action cannot be undone</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-300 mb-4">
                                        Are you sure you want to delete{" "}
                                        <strong className="text-white">
                                            {levels.find((l) => l.id === showDeleteConfirm)?.title}
                                        </strong>
                                        ?
                                    </p>
                                    <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-3 mb-6">
                                        <p className="text-sm text-red-400">
                                            <strong>Warning:</strong> This will also delete all lessons and edges
                                            connected to this level.
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(null)}
                                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLevel(showDeleteConfirm)}
                                            disabled={isDeleting}
                                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete Level
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
