"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CommunityPostItem {
    provider: string;
    external_post_id: string;
    title: string;
    author: string;
    content: string;
    url: string;
    view_count: number;
    recommend_count: number;
    comment_count: number;
    posted_at: string;
    fetched_at: string;
}

interface CommunityResponse {
    message?: string;
    board_id?: string;
    saved_count?: number;
    items: CommunityPostItem[];
}

export default function CommunityReportPage() {
    const [posts, setPosts] = useState<CommunityPostItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeBoardId, setActiveBoardId] = useState<string>("N11022");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit] = useState<number>(20);
    const [selectedPost, setSelectedPost] = useState<CommunityPostItem | null>(null);

    const boardIds = [
        { id: "N11022", name: "시황분석실" },
        // 필요시 다른 board_id 추가 가능
    ];

    // 초기 게시글 로드
    useEffect(() => {
        fetchPosts();
    }, [activeBoardId, currentPage]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            setSelectedPost(null);

            const params = new URLSearchParams({
                board_id: activeBoardId,
                page: currentPage.toString(),
                limit: limit.toString(),
            });

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/community/fetch?${params.toString()}`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "게시글 조회 실패" }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 게시글 조회 실패`);
            }

            const data: CommunityResponse = await response.json();
            setPosts(data.items || []);
        } catch (err) {
            console.error("[CommunityReport] Failed to fetch posts:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "게시글을 불러오는데 실패했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBoardChange = (boardId: string) => {
        setActiveBoardId(boardId);
        setCurrentPage(1); // 보드 변경 시 첫 페이지로
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
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

    const handlePostClick = (post: CommunityPostItem) => {
        setSelectedPost(post);
    };

    const handleCloseModal = () => {
        setSelectedPost(null);
    };

    // 로딩 메시지 설정
    const getLoadingMessages = () => {
        return [
            "커뮤니티 게시글을 불러오는 중...",
            "최신 게시글을 수집하고 있습니다...",
            "게시글 내용을 분석하고 있습니다...",
            "거의 완료되었습니다!",
        ];
    };

    if (loading && posts.length === 0) {
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
                <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg mb-8 px-6 py-6">
                    <h1 className="text-3xl font-bold text-white mb-2">커뮤니티 리포트</h1>
                    <p className="text-green-100">파스넷 커뮤니티 게시글을 확인하세요</p>
                </div>

                {/* 보드 선택 버튼들 */}
                <div className="mb-6 flex flex-wrap gap-3">
                    {boardIds.map((board) => (
                        <button
                            key={board.id}
                            onClick={() => handleBoardChange(board.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeBoardId === board.id
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                        >
                            {board.name}
                        </button>
                    ))}
                </div>

                {/* 로딩 중 (기존 데이터가 있을 때) */}
                {loading && posts.length > 0 && (
                    <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-zinc-700">
                        <div className="flex items-center justify-center space-x-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    게시글을 불러오는 중...
                                </p>
                                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-green-600 dark:bg-green-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
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
                            onClick={fetchPosts}
                            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {/* 게시글 카드 그리드 */}
                {!loading && posts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {posts.map((post, index) => (
                                <div
                                    key={`${post.external_post_id}-${index}`}
                                    onClick={() => handlePostClick(post)}
                                    className="bg-white dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden border border-gray-200 dark:border-zinc-700 hover:border-green-500 dark:hover:border-green-400"
                                >
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                                            {post.title || "제목 없음"}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                            {post.content || "내용 없음"}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-2">
                                            <span className="font-medium">{post.author || "익명"}</span>
                                            <span>{formatDate(post.posted_at || "")}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                            <span>👁 {post.view_count || 0}</span>
                                            <span>👍 {post.recommend_count || 0}</span>
                                            <span>💬 {post.comment_count || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 페이지네이션 */}
                        <div className="flex justify-center items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    currentPage === 1
                                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                            >
                                이전
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                페이지 {currentPage}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={posts.length < limit}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    posts.length < limit
                                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                            >
                                다음
                            </button>
                        </div>
                    </>
                ) : (
                    !loading && (
                        <div className="text-center py-12">
                            <p className="text-zinc-600 dark:text-zinc-400">표시할 게시글이 없습니다.</p>
                        </div>
                    )
                )}

                {/* 게시글 상세 모달 */}
                {selectedPost && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 px-6 py-4 flex justify-between items-start">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    게시글 상세
                                </h2>
                                <button
                                    onClick={handleCloseModal}
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
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    {selectedPost.title}
                                </h3>
                                <div className="mb-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">작성자: {selectedPost.author || "익명"}</span>
                                    <span>작성일: {formatDate(selectedPost.posted_at || "")}</span>
                                </div>
                                <div className="mb-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>👁 조회수: {selectedPost.view_count || 0}</span>
                                    <span>👍 추천수: {selectedPost.recommend_count || 0}</span>
                                    <span>💬 댓글수: {selectedPost.comment_count || 0}</span>
                                </div>
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {selectedPost.content || "내용 없음"}
                                    </p>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        링크:
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={selectedPost.url || ""}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm"
                                        />
                                        <a
                                            href={selectedPost.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                        >
                                            열기
                                        </a>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}