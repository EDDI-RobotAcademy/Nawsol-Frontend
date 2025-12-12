"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";
import { FundDisplayItem } from "@/types/fund";
import { formatDateTime, formatDate } from "@/utils/etfUtils";

interface FundRecommendationResponse {
    source?: string;
    fetched_at?: string;
    total_income?: number;
    total_expense?: number;
    available_amount?: number;
    recommendation_reason?: string;
    items: FundDisplayItem[];
}

export default function FundRecommendationPage() {
    const [data, setData] = useState<FundDisplayItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);
    const [recommendationInfo, setRecommendationInfo] = useState<{
        totalIncome: number;
        totalExpense: number;
        availableAmount: number;
        reason: string;
    } | null>(null);

    const fetchFundRecommendation = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/fund-recommendation/fund-info`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    detail: "펀드 추천 데이터 조회 실패"
                }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 조회 실패`);
            }

            const result: FundRecommendationResponse = await response.json();

            // 추천 정보 설정
            setRecommendationInfo({
                totalIncome: result.total_income || 0,
                totalExpense: result.total_expense || 0,
                availableAmount: result.available_amount || 0,
                reason: result.recommendation_reason || ""
            });

            // Fund 데이터 가공
            const displayItems: FundDisplayItem[] = (result.items || []).map((item: FundDisplayItem, index: number) => ({
                ...item,
                id: item.id || index,
                displayId: `${item.basDt || ''}-${item.srtnCd || String(item.id) || String(index)}-${index}`,
            }));

            setData(displayItems);
            setFetchedAt(result.fetched_at || new Date().toISOString());
        } catch (err) {
            console.error("[FundRecommendation] Failed to fetch Fund recommendation:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "펀드 추천 데이터를 불러오는데 실패했습니다."
            );
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFundRecommendation();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white">✨ AI 펀드 상품 추천</h1>
                                <p className="text-blue-100 mt-2">
                                    사용자 재무 상황에 맞는 펀드 상품 추천
                                </p>
                            </div>
                            <button
                                onClick={fetchFundRecommendation}
                                disabled={loading}
                                className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-colors backdrop-blur-sm"
                            >
                                {loading ? "분석 중..." : "새로고침"}
                            </button>
                        </div>
                    </div>

                    {/* 추천 정보 카드 */}
                    {recommendationInfo && !loading && (
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-zinc-200 dark:border-zinc-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">총 소득</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {recommendationInfo.totalIncome.toLocaleString()}원
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">총 지출</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {recommendationInfo.totalExpense.toLocaleString()}원
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">가용 자산</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {recommendationInfo.availableAmount.toLocaleString()}원
                                    </p>
                                </div>
                            </div>
                            {/* 추천된 펀드 표 */}
                            {data && data.length > 0 && (
                                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow mb-4">
                                    <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-3">🎯 AI 추천 펀드 목록</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                                            <thead className="bg-zinc-50 dark:bg-zinc-900">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">펀드명</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">단축코드</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">펀드유형</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">구분</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">설정일</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {data.slice(0, 3).map((fund, idx) => (
                                                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                        {fund.fndNm || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                                                        {fund.srtnCd || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                                                        {fund.fndTp || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                                                        {fund.ctg || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                                                        {fund.setpDt ? formatDate(fund.setpDt.replace(/[-T:]/g, '').slice(0, 8)) : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* AI 추천 분석 */}
                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow">
                                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                    💡 AI 추천 분석
                                </p>
                                <div className="text-zinc-600 dark:text-zinc-400 prose prose-sm dark:prose-invert max-w-none">
                                    {recommendationInfo.reason.split('\n').map((line, index) => {
                                        // 헤딩 처리
                                        if (line.startsWith('###')) {
                                            return <h3 key={index} className="text-xl font-extrabold mt-6 mb-3 text-blue-600 dark:text-blue-400 border-b-2 border-blue-200 dark:border-blue-800 pb-2">{line.replace(/^###\s*/, '')}</h3>;
                                        }
                                        if (line.startsWith('##')) {
                                            return <h2 key={index} className="text-2xl font-extrabold mt-6 mb-3 text-purple-600 dark:text-purple-400 border-b-2 border-purple-200 dark:border-purple-800 pb-2">{line.replace(/^##\s*/, '')}</h2>;
                                        }
                                        // 리스트 처리
                                        if (line.trim().startsWith('-')) {
                                            return <li key={index} className="ml-4">{line.replace(/^-\s*/, '')}</li>;
                                        }
                                        // 볼드 처리
                                        if (line.includes('**')) {
                                            const parts = line.split(/\*\*(.*?)\*\*/g);
                                            return (
                                                <p key={index} className="mb-2">
                                                    {parts.map((part, i) =>
                                                        i % 2 === 1 ? <strong key={i} className="font-bold text-zinc-800 dark:text-zinc-200">{part}</strong> : part
                                                    )}
                                                </p>
                                            );
                                        }
                                        // 일반 텍스트
                                        if (line.trim()) {
                                            return <p key={index} className="mb-2">{line}</p>;
                                        }
                                        return null;
                                    })}
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
                                    AI가 맞춤 펀드를 분석하는 중...
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
                                            onClick={fetchFundRecommendation}
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
                    {!loading && !error && (!data || data.length === 0) && (
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
                                추천 데이터가 없습니다
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                펀드 데이터를 다시 조회해주세요.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}