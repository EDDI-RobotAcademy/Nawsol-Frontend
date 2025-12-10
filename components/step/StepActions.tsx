"use client";

import React from "react";

interface StepActionsProps {
    onPrev?: React.MouseEventHandler<HTMLButtonElement>;
    onNext?: React.MouseEventHandler<HTMLButtonElement>;
    onSkip?: React.MouseEventHandler<HTMLButtonElement>;
    nextLabel?: string;
    nextDisabled?: boolean;
}

export default function StepActions({
    onNext,
    onSkip,
    nextLabel = "다음",
    nextDisabled = false,
}: StepActionsProps) {
    return (
        <div className="flex justify-end gap-3 mt-10">
            {onSkip && (
                <button
                    onClick={onSkip}
                    className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-900"
                >
                    건너뛰기
                </button>
            )}
            {onNext && (
                <button
                    onClick={onNext}
                    disabled={nextDisabled}
                    className={`px-5 py-2 rounded-lg transition-colors ${
                        nextDisabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                    {nextLabel}
                </button>
            )}
        </div>
    );
}