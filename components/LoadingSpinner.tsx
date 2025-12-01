"use client";

import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
    messages?: string[];
    interval?: number;
}

export default function LoadingSpinner({ 
    messages = [
        "데이터를 분석하고 있습니다...",
        "AI가 열심히 계산 중입니다...",
        "카테고리별로 분류하고 있습니다...",
        "거의 다 됐어요!"
    ],
    interval = 2000 
}: LoadingSpinnerProps) {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, interval);

        return () => clearInterval(timer);
    }, [messages.length, interval]);

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-zinc-50 dark:bg-black">
            <div className="text-center">
                {/* 스피너 애니메이션 */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    {/* 외부 원 */}
                    <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                    {/* 회전하는 원 */}
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                    {/* 내부 펄스 */}
                    <div className="absolute inset-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse opacity-20"></div>
                </div>

                {/* 진행률 표시 */}
                <div className="mb-4">
                    <div className="flex justify-center space-x-2 mb-2">
                        {messages.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                    index <= currentMessageIndex
                                        ? "bg-blue-600 dark:bg-blue-400"
                                        : "bg-gray-300 dark:bg-gray-700"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* 메시지 */}
                <p className="text-zinc-700 dark:text-zinc-300 text-lg font-medium mb-2 transition-all duration-500">
                    {messages[currentMessageIndex]}
                </p>

                {/* 보조 메시지 */}
                <p className="text-zinc-500 dark:text-zinc-500 text-sm">
                    잠시만 기다려주세요
                </p>
            </div>
        </div>
    );
}
