"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

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
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {

        const fetchFutureAssets = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents-multi-agents/deduction-expectation`,
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
                        : "연말정산 공제 내역을 불러오는데 실패했습니다."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFutureAssets();
    }, [isLoggedIn, router]);

    if (loading) {
        return (
            <LoadingSpinner
                messages={[
                    "재무 데이터를 불러오는 중...",
                    "연말정산 공제 항목을 분석하고 있습니다...",
                    "세액 공제 가능 여부를 판단하고 있습니다...",
                    "공제 예상 금액을 계산하고 있습니다...",
                    "거의 완료되었습니다!"
                ]}
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

    if (!result) {
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
                        <h1 className="text-3xl font-bold text-white">연말정산 공제 예상 금액 산출</h1>
                        <p className="text-blue-100 mt-2">다가오는 세액공제에서 13월의 월급을 받아내자</p>
                    </div>

                    {/* 콘텐츠 */}
                    <div className="px-6 py-8">
                        <MarkdownRenderer content={result} />
                    </div>
                </div>
            </div>
        </div>
    );
}

