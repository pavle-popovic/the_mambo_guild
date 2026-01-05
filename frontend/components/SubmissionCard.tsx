"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Inferring SubmissionResponse based on the HTML content
interface SubmissionResponse {
    id: string; // Assuming an ID for unique identification
    studentName: string;
    timeAgo: string;
    challengeTitle: string;
}

interface SubmissionCardProps {
    submission: SubmissionResponse;
    onSelect: () => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, onSelect }) => {
    return (
        <motion.div
            whileHover={{ x: 4, borderColor: "rgba(59, 130, 246, 0.5)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-5 bg-mambo-panel border-l-4 border-mambo-blue cursor-pointer rounded-r-lg hover:bg-gray-800/50 transition-all duration-300 shadow-md"
            onClick={onSelect}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-mambo-text tracking-tight">{submission.studentName}</span>
                <span className="text-xs text-gray-400">{submission.timeAgo}</span>
            </div>
            <div className="text-xs text-gray-300 leading-relaxed">{submission.challengeTitle}</div>
        </motion.div>
    );
};

export default SubmissionCard;