"use client";

import React, { useEffect } from "react";
import { useEtfData } from "@/hooks/useEftData";
import { EtfTable } from "@/components/etf/EtfTable";
import { EtfDisplayItem } from "@/types/etf";
import { formatDateTime } from "@/utils/etfUtils";

export default function EtfPage() {
    const { data, loading, error, fetchedAt, fetchEtfData, refetch } = useEtfData();

    // 페이지 로드 시 데이터 자동 조회
    useEffect(() => {
        fetchEtfData();
    }, [fetchEtfData]);

    // 행 클릭 핸들러 (나중에 상세 페이지 연동)
    const handleRowClick = (item: EtfDisplayItem) => {
        console.log("ETF 선택:", item);
        // TODO: 상세 페이지로 이동
        alert(`${item.bssIdxIdxNm} 상세 정보 (준비 중)`);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white">ETF 정보</h1>
                                <p className="text-green-100 mt-2">
                                    상장지수펀드(ETF) 상품 정보 조회
                                </p>
                            </div>
                            <button
                                onClick={refetch}
                                disabled={loading}
                                className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-colors backdrop-blur-sm"
                            >
                                {loading ? "조회 중..." : "새로고침"}
                            </button>
                        </div>
                    </div>

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
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400 mx-auto mb-4"></div>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    ETF 데이터를 불러오는 중...
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
                                            onClick={refetch}
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
                    {!loading && !error && data && data.length === 0 && (
                        <div className="px-6 py-16 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-zinc-400"
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
                                조회된 데이터가 없습니다
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                ETF 데이터를 다시 조회해주세요.
                            </p>
                        </div>
                    )}

                    {/* 테이블 */}
                    {!loading && !error && data && data.length > 0 && (
                        <div className="px-6 py-6">
                            <div className="mb-4">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    총 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{data.length}</span>개의 ETF 상품
                                </p>
                            </div>
                            <EtfTable data={data} onRowClick={handleRowClick} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}