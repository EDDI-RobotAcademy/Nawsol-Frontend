"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { apiFetch } from "@/utils/api";

interface MarkdownRendererProps {
    content: string;
}

function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];

    // 볼드 텍스트 처리 헬퍼 함수
    const processBold = (text: string): string => {
        return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    };

    const flushList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1 ml-4">
                    {currentList.map((item, idx) => (
                        <li 
                            key={idx} 
                            className="text-zinc-700 dark:text-zinc-300"
                            dangerouslySetInnerHTML={{ __html: processBold(item.trim()) }}
                        />
                    ))}
                </ul>
            );
            currentList = [];
        }
    };

    const flushTable = () => {
        if (tableRows.length > 0 && tableHeaders.length > 0) {
            elements.push(
                <div key={`table-${elements.length}`} className="overflow-x-auto mb-6">
                    <table className="min-w-full border-collapse border border-zinc-300 dark:border-zinc-700">
                        <thead>
                            <tr className="bg-zinc-100 dark:bg-zinc-800">
                                {tableHeaders.map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left font-semibold text-zinc-900 dark:text-zinc-100"
                                        dangerouslySetInnerHTML={{ __html: processBold(header.trim()) }}
                                    />
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    className={rowIdx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800"}
                                >
                                    {row.map((cell, cellIdx) => (
                                        <td
                                            key={cellIdx}
                                            className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300"
                                            dangerouslySetInnerHTML={{ __html: processBold(cell.trim()) }}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
            tableHeaders = [];
            inTable = false;
        }
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // 테이블 처리
        if (trimmed.includes("|") && trimmed.split("|").length > 2) {
            flushList();
            const cells = trimmed
                .split("|")
                .map((cell) => cell.trim())
                .filter((cell) => cell.length > 0);

            if (cells.length > 0) {
                if (!inTable) {
                    // 헤더 행
                    tableHeaders = cells;
                    inTable = true;
                } else if (trimmed.includes("---")) {
                    // 구분선 무시
                } else {
                    // 데이터 행
                    tableRows.push(cells);
                }
            }
            return;
        } else if (inTable) {
            flushTable();
        }

        // 헤더 처리
        if (trimmed.startsWith("###")) {
            flushList();
            const text = trimmed.substring(3).trim();
            elements.push(
                <h3 
                    key={`h3-${index}`} 
                    className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-3"
                    dangerouslySetInnerHTML={{ __html: processBold(text) }}
                />
            );
            return;
        }

        if (trimmed.startsWith("####")) {
            flushList();
            const text = trimmed.substring(4).trim();
            elements.push(
                <h4 
                    key={`h4-${index}`} 
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-4 mb-2"
                    dangerouslySetInnerHTML={{ __html: processBold(text) }}
                />
            );
            return;
        }

        if (trimmed.startsWith("##")) {
            flushList();
            const text = trimmed.substring(2).trim();
            elements.push(
                <h2 
                    key={`h2-${index}`} 
                    className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4"
                    dangerouslySetInnerHTML={{ __html: processBold(text) }}
                />
            );
            return;
        }

        if (trimmed.startsWith("#")) {
            flushList();
            const text = trimmed.substring(1).trim();
            elements.push(
                <h1 
                    key={`h1-${index}`} 
                    className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4"
                    dangerouslySetInnerHTML={{ __html: processBold(text) }}
                />
            );
            return;
        }

        // 리스트 처리
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            const text = trimmed.substring(1).trim();
            if (text.length > 0) {
                currentList.push(text);
            }
            return;
        }

        // 구분선 처리
        if (trimmed === "---" || trimmed.startsWith("---")) {
            flushList();
            elements.push(
                <hr key={`hr-${index}`} className="my-6 border-zinc-300 dark:border-zinc-700" />
            );
            return;
        }

        // 일반 텍스트
        if (trimmed.length > 0) {
            flushList();
            elements.push(
                <p
                    key={`p-${index}`}
                    className="text-zinc-700 dark:text-zinc-300 mb-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: processBold(trimmed) }}
                />
            );
        } else {
            // 빈 줄
            flushList();
        }
    });

    flushList();
    flushTable();

    return <div className="markdown-content">{elements}</div>;
}

export default function AssetsSimulationPage() {
    const [result, setResult] = useState<any>(null);  // 🔥 any로 변경 (객체)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [requestingAI, setRequestingAI] = useState(false);  // 🔥 AI 상세 분석 요청 상태
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {

        const fetchFutureAssets = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiFetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents-multi-agents/future-assets`,
                    {
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: "분석 실패" }));
                    throw new Error(errorData.detail || `HTTP ${response.status}: 분석 실패`);
                }

                const data = await response.json();
                setResult(data);
            } catch (err) {
                console.error("[AssetsSimulation] Failed to fetch future assets:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "미래 자산 시뮬레이션을 불러오는데 실패했습니다."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFutureAssets();
    }, [isLoggedIn, router]);

    // 🔥 AI 상세 분석 요청 함수
    const handleAIDetailedAnalysis = async () => {
        try {
            setRequestingAI(true);
            setError(null);

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents-multi-agents/future-assets-ai-detailed`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "AI 분석 실패" }));
                throw new Error(errorData.detail || `HTTP ${response.status}: AI 분석 실패`);
            }

            const data = await response.json();
            setResult(data);  // 새로운 AI 분석 결과로 업데이트
        } catch (err) {
            console.error("[AssetsSimulation] AI detailed analysis failed:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "AI 상세 분석에 실패했습니다."
            );
        } finally {
            setRequestingAI(false);
        }
    };

    if (loading || requestingAI) {
        return (
            <LoadingSpinner
                messages={
                    requestingAI
                        ? [
                            "AI가 상세 분석을 시작합니다...",
                            "소득 패턴을 재분석하고 있습니다...",
                            "개인화된 자산 전략을 수립 중입니다...",
                            "거의 완료되었습니다!"
                          ]
                        : [
                            "재무 데이터를 가져오는 중...",
                            "AI가 소득 증가 시나리오를 계산하고 있습니다...",
                            "자산 분배 전략을 수립하고 있습니다...",
                            "세액 절감 방안을 분석 중입니다...",
                            "거의 완료되었습니다!"
                          ]
                }
                interval={1800}
            />
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-black">
                <div className="text-center max-w-md">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    if (!result || !result.advice) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-black">
                <p className="text-zinc-600 dark:text-zinc-400">
                    분석 결과를 찾을 수 없습니다.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-6">
                        <h1 className="text-3xl font-bold text-white">미래 자산 시뮬레이션</h1>
                        <p className="text-blue-100 mt-2">재무 컨설팅 및 자산 분배 전략</p>
                    </div>

                    {/* 콘텐츠 */}
                    <div className="px-6 py-8">
                        {/* 🔥 학습 기반 조언 안내 (method가 "learned"인 경우) */}
                        {result.method === "learned" && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            💡 <strong>학습된 조언</strong>
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                            유사한 패턴의 사용자에게 제공된 조언입니다 (유사도: {result.similarity_score?.toFixed(1)}점, {result.use_count}회 재사용)
                                        </p>
                                    </div>
                                    {result.can_request_ai && (
                                        <button
                                            onClick={handleAIDetailedAnalysis}
                                            disabled={requestingAI}
                                            className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            🤖 AI 상세 분석
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 🔥 새로운 GPT 분석 안내 (method가 "gpt_new"인 경우) */}
                        {result.method === "gpt_new" && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    ✨ <strong>새로운 AI 분석</strong>
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                                    당신의 소비 패턴에 맞춘 개인화된 조언입니다
                                </p>
                            </div>
                        )}

                        {/* 🔥 AI 상세 분석 결과 안내 (method가 "gpt_detailed"인 경우) */}
                        {result.method === "gpt_detailed" && (
                            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                <p className="text-sm text-purple-800 dark:text-purple-200">
                                    🎯 <strong>AI 상세 분석 완료</strong>
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                                    AI가 당신의 재무 상황을 심층 분석한 결과입니다
                                </p>
                            </div>
                        )}

                        <MarkdownRenderer content={result.advice} />
                    </div>
                </div>
            </div>
        </div>
    );
}

