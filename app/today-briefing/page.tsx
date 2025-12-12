"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";
import { formatDateTime } from "@/utils/etfUtils";

interface TodayBriefingResponse {
    source: string;
    items: string;
}

export default function TodayBriefingPage() {
    const [data, setData] = useState<TodayBriefingResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);

    const fetchTodayBriefing = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/today-briefing/today-briefing-info`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    detail: "오늘의 브리핑 데이터 조회 실패"
                }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 조회 실패`);
            }

            const result: TodayBriefingResponse = await response.json();

            setData(result);
            setFetchedAt(new Date().toISOString());
        } catch (err) {
            console.error("[TodayBriefing] Failed to fetch today briefing:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "오늘의 브리핑 데이터를 불러오는데 실패했습니다."
            );
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayBriefing();
    }, []);

    const renderMarkdown = (text: string) => {
        if (!text) return null;

        return text.split('\n').map((line, index) => {
            // 헤딩 처리
            if (line.startsWith('###')) {
                return <h3 key={index} className="text-2xl font-extrabold mt-8 mb-4 text-blue-600 dark:text-blue-400 border-b-2 border-blue-200 dark:border-blue-800 pb-2">{line.replace(/^###\s*/, '')}</h3>;
            }
            if (line.startsWith('##')) {
                return <h2 key={index} className="text-3xl font-extrabold mt-8 mb-4 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-200 dark:border-indigo-800 pb-2">{line.replace(/^##\s*/, '')}</h2>;
            }
            if (line.startsWith('#')) {
                return <h1 key={index} className="text-4xl font-extrabold mt-8 mb-4 text-purple-600 dark:text-purple-400 border-b-2 border-purple-200 dark:border-purple-800 pb-2">{line.replace(/^#\s*/, '')}</h1>;
            }
            // 리스트 처리 (하위 리스트 포함)
            if (line.trim().startsWith('-')) {
                const indentLevel = line.match(/^(\s*)-/)?.[1]?.length || 0;
                const content = line.replace(/^(\s*)-\s*/, '');
                return (
                    <li 
                        key={index} 
                        className={`${indentLevel > 0 ? 'ml-8' : 'ml-4'} mb-1 list-disc`}
                    >
                        {content}
                    </li>
                );
            }
            // 볼드 처리
            if (line.includes('**')) {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={index} className="mb-3 leading-relaxed">
                        {parts.map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="font-bold text-zinc-800 dark:text-zinc-200">{part}</strong> : part
                        )}
                    </p>
                );
            }
            // 일반 텍스트
            if (line.trim()) {
                return <p key={index} className="mb-3 leading-relaxed text-zinc-700 dark:text-zinc-300">{line}</p>;
            }
            // 빈 줄
            return <br key={index} />;
        });
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white">📊 오늘의 금융 브리핑</h1>
                                <p className="text-blue-100 mt-2">
                                    주요 금융 정보를 한눈에 확인하세요
                                </p>
                                {data && (
                                    <p className="text-blue-200 text-xs mt-1">
                                        📡 Source: {data.source.toUpperCase()}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={fetchTodayBriefing}
                                disabled={loading}
                                className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-colors backdrop-blur-sm"
                            >
                                {loading ? "로딩 중..." : "새로고침"}
                            </button>
                        </div>
                    </div>

                    {/* 브리핑 내용 */}
                    {data && !loading && (
                        <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-lg">
                                <div className="prose prose-lg dark:prose-invert max-w-none">
                                    {renderMarkdown(data.items)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 데이터 조회 시간 */}
                    {fetchedAt && !loading && (
                        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                데이터 조회 시간: {formatDateTime(fetchedAt)}
                            </p>
                        </div>
                    )}

                    {/* 로딩 상태 */}
                    {loading && (
                        <div className="px-6 py-16">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    오늘의 브리핑을 준비하는 중...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 에러 상태 */}
                    {error && !loading && (
                        <div className="px-6 py-8">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-6 w-6 text-red-600 dark:text-red-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                            데이터 조회 실패
                                        </h3>
                                        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                                            {error}
                                        </p>
                                        <button
                                            onClick={fetchTodayBriefing}
                                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            다시 시도
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 데이터 없음 */}
                    {!loading && !error && !data && (
                        <div className="px-6 py-16 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                브리핑 데이터가 없습니다
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                브리핑 데이터를 다시 조회해주세요.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

