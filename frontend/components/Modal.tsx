import React, { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-mambo-panel border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <div className="text-gray-400">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;