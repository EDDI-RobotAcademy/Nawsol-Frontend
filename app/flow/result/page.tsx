"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// 쿠키 설정 헬퍼 함수
function setCookie(name: string, value: string, days: number = 1) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

interface Summary {
    total_income: number;
    total_expense: number;
    surplus: number;
    surplus_ratio: number;
    status: string;
}

// 소득 카테고리 타입
interface IncomeCategory {
    [key: string]: string | number | Record<string, string | number>;
}

// 지출 카테고리 타입
interface ExpenseCategory {
    [key: string]: string | number | Record<string, string | number>;
}

// 차트 데이터 타입
interface ChartData {
    income_by_category?: Record<string, number>;
    expense_by_main_category?: Record<string, number>;
    expense_detail?: ExpenseCategory;
}

interface ResultData {
    success: boolean;
    summary: Summary;
    income: IncomeCategory;
    expense: ExpenseCategory;
    chart_data: ChartData;
}

export default function ResultPage() {
    const router = useRouter();
    const [data, setData] = useState<ResultData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        // 페이지 로드 시 기존 session_id를 쿠키로 복원
        const savedSessionId = localStorage.getItem("session_id");
        if (savedSessionId) {
            setCookie("session_id", savedSessionId, 1);
            console.log("[DEBUG] Restored session_id to cookie:", savedSessionId);
        }
        
        fetchResult();
    }, []);

    async function fetchResult() {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents-multi-agents/result`,
                {
                    withCredentials: true,
                }
            );

            setData(response.data);
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : axios.isAxiosError(err)
                    ? err.response?.data?.detail || "데이터를 불러오는데 실패했습니다."
                    : "데이터를 불러오는데 실패했습니다.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    function formatCurrency(value: number): string {
        return new Intl.NumberFormat("ko-KR").format(value) + "원";
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600">데이터를 불러오는 중...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-red-800 font-semibold mb-2">오류 발생</h3>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={() => router.push("/flow/income")}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        처음부터 다시 시작
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const { summary, income, expense } = data;

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            {/* 헤더 */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    재무 분석 결과
                </h2>
                <p className="text-gray-600">
                    입력하신 소득과 지출 데이터를 분석한 결과입니다.
                </p>
            </div>

            {/* 요약 카드 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    재무 요약
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">총 소득</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(summary.total_income)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">총 지출</p>
                        <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(summary.total_expense)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">수지 차액</p>
                        <p
                            className={`text-2xl font-bold ${
                                summary.surplus >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {formatCurrency(summary.surplus)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">수지 비율</p>
                        <p
                            className={`text-2xl font-bold ${
                                summary.surplus >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {summary.surplus_ratio.toFixed(1)}%
                        </p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">재무 상태:</span>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                summary.status === "흑자"
                                    ? "bg-green-100 text-green-800"
                                    : summary.status === "적자"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {summary.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* 소득 상세 */}
            {income && Object.keys(income).length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        소득 상세
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(income).map(([key, value]) => {
                            if (typeof value === "object" && value !== null) {
                                return (
                                    <div key={key} className="space-y-2">
                                        <p className="font-medium text-gray-700">{key}:</p>
                                        <div className="ml-4 space-y-1">
                                            {Object.entries(value).map(([subKey, subValue]) => (
                                                <div
                                                    key={subKey}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span className="text-gray-600">{subKey}</span>
                                                    <span className="text-gray-900 font-medium">
                                                        {typeof subValue === "number"
                                                            ? formatCurrency(subValue)
                                                            : typeof subValue === "string"
                                                            ? subValue
                                                            : JSON.stringify(subValue)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <div key={key} className="flex justify-between">
                                    <span className="text-gray-600">{key}</span>
                                    <span className="text-gray-900 font-medium">
                                        {typeof value === "number"
                                            ? formatCurrency(value)
                                            : typeof value === "string"
                                            ? value
                                            : JSON.stringify(value)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 지출 상세 */}
            {expense && Object.keys(expense).length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        지출 상세
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(expense).map(([key, value]) => {
                            if (typeof value === "object" && value !== null) {
                                return (
                                    <div key={key} className="space-y-2">
                                        <p className="font-medium text-gray-700">{key}:</p>
                                        <div className="ml-4 space-y-1">
                                            {Object.entries(value).map(([subKey, subValue]) => (
                                                <div
                                                    key={subKey}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span className="text-gray-600">{subKey}</span>
                                                    <span className="text-gray-900 font-medium">
                                                        {typeof subValue === "number"
                                                            ? formatCurrency(subValue)
                                                            : typeof subValue === "string"
                                                            ? subValue
                                                            : JSON.stringify(subValue)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <div key={key} className="flex justify-between">
                                    <span className="text-gray-600">{key}</span>
                                    <span className="text-gray-900 font-medium">
                                        {typeof value === "number"
                                            ? formatCurrency(value)
                                            : typeof value === "string"
                                            ? value
                                            : JSON.stringify(value)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-4">
                <button
                    onClick={() => router.push("/flow/income")}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                    다시 입력하기
                </button>
                <button
                    onClick={() => router.push("/")}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    홈으로
                </button>
            </div>
        </div>
    );
}
