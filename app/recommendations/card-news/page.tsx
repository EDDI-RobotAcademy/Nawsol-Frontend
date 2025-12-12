"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";
import { formatDateTime } from "@/utils/etfUtils";

interface CardNewsItem {
    title: string;
    type_of_content: string;
    provider: string;
    content: string;
    link: string;
    published_at: string;
}

interface CardNewsRecommendationResponse {
    source: string;
    fetched_at: string;
    total_income: number;
    total_expense: number;
    available_amount: number;
    surplus_ratio: number;
    recommendation_reason: string;
    items: CardNewsItem[];
}

export default function CardNewsRecommendationPage() {
    const [data, setData] = useState<CardNewsItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);
    const [recommendationInfo, setRecommendationInfo] = useState<{
        totalIncome: number;
        totalExpense: number;
        availableAmount: number;
        surplusRatio: number;
        reason: string;
        showAdvancedInfo: boolean;
    } | null>(null);
    const [selectedNews, setSelectedNews] = useState<CardNewsItem | null>(null);

    const fetchCardNewsRecommendation = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/card-news-recommendation/card-news-info`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    detail: "카드 뉴스 추천 데이터 조회 실패"
                }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 조회 실패`);
            }

            const result: CardNewsRecommendationResponse = await response.json();

            // 소득+지출 정보가 둘 다 있는지 확인
            const hasCompleteData = result.total_income > 0 && result.total_expense > 0;
            const showAdvancedInfo = hasCompleteData;

            // 추천 정보 설정
            setRecommendationInfo({
                totalIncome: result.total_income || 0,
                totalExpense: result.total_expense || 0,
                availableAmount: result.available_amount || 0,
                surplusRatio: result.surplus_ratio || 0,
                reason: result.recommendation_reason || "",
                showAdvancedInfo: showAdvancedInfo
            });

            setData(result.items || []);
            setFetchedAt(result.fetched_at || new Date().toISOString());
        } catch (err) {
            console.error("[CardNewsRecommendation] Failed to fetch card news recommendation:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "카드 뉴스 추천 데이터를 불러오는데 실패했습니다."
            );
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCardNewsRecommendation();
    }, []);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white">📰 AI 카드 뉴스 추천</h1>
                                <p className="text-indigo-100 mt-2">
                                    사용자 재무 상황에 맞는 금융 뉴스 추천
                                </p>
                            </div>
                            <button
                                onClick={fetchCardNewsRecommendation}
                                disabled={loading}
                                className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-colors backdrop-blur-sm"
                            >
                                {loading ? "분석 중..." : "새로고침"}
                            </button>
                        </div>
                    </div>

                    {/* 추천 정보 카드 */}
                    {recommendationInfo && !loading && (
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-zinc-200 dark:border-zinc-700">
                            <div className={`grid grid-cols-2 ${recommendationInfo.showAdvancedInfo ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 mb-4`}>
                                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">총 소득</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
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
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {recommendationInfo.availableAmount.toLocaleString()}원
                                    </p>
                                </div>
                                {/* 저축률은 showAdvancedInfo가 true일 때만 표시 */}
                                {recommendationInfo.showAdvancedInfo && (
                                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">저축률</p>
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                            {recommendationInfo.surplusRatio.toFixed(1)}%
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 추천된 카드 뉴스 */}
                            {data && data.length > 0 && (
                                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow mb-4">
                                    <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4">
                                        🎯 AI 추천 카드 뉴스 ({data.length}개)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {data.map((news, idx) => (
                                            <a
                                                key={idx}
                                                href={news.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-lg p-4 shadow hover:shadow-lg transition-all duration-200 cursor-pointer border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                                        {news.provider}
                                                    </span>
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        {formatDate(news.published_at)}
                                                    </span>
                                                </div>
                                                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2">
                                                    {news.title}
                                                </h4>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-3">
                                                    {news.content}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        {news.type_of_content}
                                                    </span>
                                                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                        자세히 보기 →
                                                    </span>
                                                </div>
                                            </a>
                                        ))}
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
                                            return <h3 key={index} className="text-xl font-extrabold mt-6 mb-3 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-200 dark:border-indigo-800 pb-2">{line.replace(/^###\s*/, '')}</h3>;
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
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    AI가 맞춤 카드 뉴스를 분석하는 중...
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
                                            onClick={fetchCardNewsRecommendation}
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
                                카드 뉴스 데이터를 다시 조회해주세요.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 뉴스 상세 모달 */}
            {selectedNews && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedNews(null)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                            {selectedNews.provider}
                                        </span>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {formatDate(selectedNews.published_at)}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                                        {selectedNews.title}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedNews(null)}
                                    className="ml-4 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="mb-4">
                                <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                    {selectedNews.content}
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {selectedNews.type_of_content}
                                </span>
                                <a
                                    href={selectedNews.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                >
                                    원문 보기 →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

