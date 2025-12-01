"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmColor?: "red" | "blue" | "green";
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "확인",
    cancelText = "취소",
    onConfirm,
    onCancel,
    confirmColor = "red",
}: ConfirmDialogProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const confirmColorClasses = {
        red: "bg-red-600 hover:bg-red-700",
        blue: "bg-blue-600 hover:bg-blue-700",
        green: "bg-green-600 hover:bg-green-700",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded transition-colors ${confirmColorClasses[confirmColor]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
