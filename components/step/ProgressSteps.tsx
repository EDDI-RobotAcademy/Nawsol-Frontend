"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProgressSteps() {
    const pathname = usePathname();

    const steps = [
        { label: "소득 자료", href: "/flow/income" },
        { label: "지출 자료", href: "/flow/expense" },
        { label: "결과", href: "/flow/result" },
    ];

    const currentStepIndex = steps.findIndex((step) =>
        pathname.startsWith(step.href)
    );

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-6">
            <div className="relative">
                {/* 진행 바 배경 */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
                    {/* 진행된 부분 */}
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
                        style={{
                            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                        }}
                    />
                </div>

                {/* 단계 아이템들 */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const isActive = pathname.startsWith(step.href);
                        const isCompleted = index < currentStepIndex;

                        return (
                            <Link
                                key={step.href}
                                href={step.href}
                                className="flex flex-col items-center gap-2 group"
                            >
                                {/* 원형 인디케이터 */}
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center
                                        font-semibold text-sm transition-all duration-300
                                        ${
                                        isActive
                                            ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110"
                                            : isCompleted
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-gray-400 border-2 border-gray-200"
                                    }
                                        group-hover:scale-110
                                    `}
                                >
                                    {isCompleted ? (
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        index + 1
                                    )}
                                </div>

                                {/* 라벨 */}
                                <span
                                    className={`
                                        text-xs font-medium transition-colors whitespace-nowrap
                                        ${
                                        isActive
                                            ? "text-blue-600"
                                            : isCompleted
                                                ? "text-gray-700"
                                                : "text-gray-400"
                                    }
                                        group-hover:text-blue-600
                                    `}
                                >
                                    {step.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}