"use client";

import React, { useState } from "react";

interface MarkdownRendererProps {
    content: string;
}

function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const normalized = content.replace(/\\n/g, "\n");
    const lines = normalized.split("\n");
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

export default function FinancialGuidePage() {
    const [nowMon, setNowMon] = useState<string>("");
    const [tarMon, setTarMon] = useState<string>("");
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const formatNumber = (value: string): string => {
        // 숫자만 추출
        const numbers = value.replace(/[^0-9]/g, "");
        if (!numbers) return "";
        // 천 단위 콤마 추가
        return parseInt(numbers).toLocaleString("ko-KR");
    };

    const handleNowMonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatNumber(e.target.value);
        setNowMon(formatted);
        setValidationError(null);
    };

    const handleTarMonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatNumber(e.target.value);
        setTarMon(formatted);
        setValidationError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationError(null);

        // 숫자만 추출
        const nowMonNum = parseInt(nowMon.replace(/[^0-9]/g, ""));
        const tarMonNum = parseInt(tarMon.replace(/[^0-9]/g, ""));

        // 유효성 검사
        if (!nowMonNum || !tarMonNum) {
            setValidationError("현재 총 자산과 목표 금액을 모두 입력해주세요.");
            return;
        }

        // 총 자산보다 목표 금액이 작거나 같으면 에러
        if (nowMonNum >= tarMonNum) {
            setValidationError("총 자산보다 목표 금액이 커야 합니다.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents-multi-agents/financial-guide?now_mon=${nowMonNum}&tar_mon=${tarMonNum}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "분석 실패" }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 분석 실패`);
            }

            const data = await response.text();
            setResult(data);
        } catch (err) {
            console.error("[FinancialGuide] Failed to fetch financial guide:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "재무 가이드를 불러오는데 실패했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setNowMon("");
        setTarMon("");
        setResult(null);
        setError(null);
        setValidationError(null);
    };


    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-6">
                        <h1 className="text-3xl font-bold text-white">재무 가이드</h1>
                        <p className="text-blue-100 mt-2">목표 금액 달성을 위한 재무 전략 분석</p>
                    </div>

                    {/* 폼 섹션 */}
                    {!result && (
                        <div className="px-6 py-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label 
                                            htmlFor="nowMon" 
                                            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                                        >
                                            현재 총 자산 (원)
                                        </label>
                                        <input
                                            type="text"
                                            id="nowMon"
                                            value={nowMon}
                                            onChange={handleNowMonChange}
                                            placeholder="예: 50,000,000"
                                            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label 
                                            htmlFor="tarMon" 
                                            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                                        >
                                            목표 금액 (원)
                                        </label>
                                        <input
                                            type="text"
                                            id="tarMon"
                                            value={tarMon}
                                            onChange={handleTarMonChange}
                                            placeholder="예: 100,000,000"
                                            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                            disabled={loading}
                                        />
                                        {validationError && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                {validationError}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                    >
                                        {loading ? "분석 중..." : "분석 시작"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* 로딩 상태 */}
                    {loading && (
                        <div className="px-6 py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                                <p className="text-zinc-600 dark:text-zinc-400">재무 가이드 분석 중...</p>
                            </div>
                        </div>
                    )}

                    {/* 에러 상태 */}
                    {error && !loading && (
                        <div className="px-6 py-8">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={handleReset}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                                >
                                    다시 시도
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 결과 표시 */}
                    {result && !loading && (
                        <div className="px-6 py-8">
                            <div className="mb-6">
                                <button
                                    onClick={handleReset}
                                    className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-lg transition-colors"
                                >
                                    새로운 분석하기
                                </button>
                            </div>
                            <div className="px-6 py-8">
                                <MarkdownRenderer content={result} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

