"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";

interface NewsItem {
    title: string;
    description: string;
    content?: string;
    published_at: string;
    link: string;
    [key: string]: unknown; // 기타 필드들
}

interface LatestNewsResponse {
    items?: NewsItem[];
    news?: NewsItem[];
    [key: string]: unknown;
}

export default function NewsSearchPage() {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeQuery, setActiveQuery] = useState<string | null>(null);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    const queries = ["환율", "금리", "코스피", "주식", "ETF"];

    // 초기 최신 뉴스 로드
    useEffect(() => {
        fetchLatestNews();
    }, []);

    const fetchLatestNews = async () => {
        try {
            setLoading(true);
            setError(null);
            setActiveQuery(null);

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/news_info/latest?limit=10&display_per_query=20&sort=date&finance_only=true&include_content=true&require_content=true`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "뉴스 조회 실패" }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 뉴스 조회 실패`);
            }

            const data: LatestNewsResponse = await response.json();
            // 응답이 배열인 경우와 객체인 경우 모두 처리
            const items = Array.isArray(data) ? data : (data.items || []);
            setNewsItems(items);
        } catch (err) {
            console.error("[NewsSearch] Failed to fetch latest news:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "최신 뉴스를 불러오는데 실패했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchNewsByQuery = async (query: string) => {
        try {
            setLoading(true);
            setError(null);
            setActiveQuery(query);
            setSelectedNews(null);

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/news_info/fetch?query=${encodeURIComponent(query)}&display=100&start=1&sort=date&finance_only=true&include_content=true&require_content=true`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "뉴스 조회 실패" }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 뉴스 조회 실패`);
            }

            const data = await response.json();
            // 응답이 배열인 경우와 객체인 경우 모두 처리
            const items = Array.isArray(data) ? data : (data.items || data.news || []);
            setNewsItems(items);
        } catch (err) {
            console.error("[NewsSearch] Failed to fetch news by query:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "뉴스를 불러오는데 실패했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    const handleNewsClick = (news: NewsItem) => {
        setSelectedNews(news);
    };

    const handleCloseLink = () => {
        setSelectedNews(null);
    };

    // 로딩 메시지 설정
    const getLoadingMessages = () => {
        if (activeQuery) {
            return [
                `${activeQuery} 관련 뉴스를 검색하고 있습니다...`,
                "최신 뉴스 정보를 수집하고 있습니다...",
                "관련 뉴스를 필터링하고 있습니다...",
                "뉴스 내용을 분석하고 있습니다...",
                "거의 완료되었습니다!",
            ];
        }
        return [
            "최신 뉴스를 불러오는 중...",
            "금융 뉴스를 수집하고 있습니다...",
            "뉴스 내용을 분석하고 있습니다...",
            "거의 완료되었습니다!",
        ];
    };

    if (loading && newsItems.length === 0) {
        return (
            <LoadingSpinner
                messages={getLoadingMessages()}
                interval={1500}
            />
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg mb-8 px-6 py-6">
                    <h1 className="text-3xl font-bold text-white mb-2">뉴스 검색</h1>
                    <p className="text-blue-100">최신 금융 뉴스를 확인하세요</p>
                </div>

                {/* 쿼리 버튼들 */}
                <div className="mb-6 flex flex-wrap gap-3">
                    <button
                        onClick={fetchLatestNews}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeQuery === null
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                    >
                        최신 뉴스
                    </button>
                    {queries.map((query) => (
                        <button
                            key={query}
                            onClick={() => fetchNewsByQuery(query)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeQuery === query
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                        >
                            {query}
                        </button>
                    ))}
                </div>

                {/* 로딩 중 (기존 데이터가 있을 때) */}
                {loading && newsItems.length > 0 && (
                    <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-zinc-700">
                        <div className="flex items-center justify-center space-x-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {activeQuery ? `${activeQuery} 관련 뉴스를 불러오는 중...` : "최신 뉴스를 불러오는 중..."}
                                </p>
                                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 에러 메시지 */}
                {error && !loading && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={() => activeQuery ? fetchNewsByQuery(activeQuery) : fetchLatestNews()}
                            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {/* 뉴스 카드 그리드 */}
                {!loading && newsItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {newsItems.map((news, index) => (
                            <div
                                key={index}
                                onClick={() => handleNewsClick(news)}
                                className="bg-white dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden border border-gray-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400"
                            >
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                                        {news.title || "제목 없음"}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                        {news.description || "설명 없음"}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                                        <span>{formatDate(news.published_at || "")}</span>
                                        <span className="text-blue-600 dark:text-blue-400">자세히 보기 →</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !loading && (
                        <div className="text-center py-12">
                            <p className="text-zinc-600 dark:text-zinc-400">표시할 뉴스가 없습니다.</p>
                        </div>
                    )
                )}

                {/* 링크 모달 */}
                {selectedNews && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    뉴스 링크
                                </h2>
                                <button
                                    onClick={handleCloseLink}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {selectedNews.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {selectedNews.content || selectedNews.description || ""}
                                </p>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        링크:
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={selectedNews.link || ""}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm"
                                        />
                                        <a
                                            href={selectedNews.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                            열기
                                        </a>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    발행일: {formatDate(selectedNews.published_at || "")}
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCloseLink}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

