"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { EtfTable } from "@/components/etf/EtfTable";
import { DatePicker } from "@/components/DatePicker";
import { EtfDisplayItem } from "@/types/etf";
import { formatDateTime } from "@/utils/etfUtils";
import {useEtfData} from "@/hooks/useEftData";

// 기준 날짜로부터 n일 전/후 날짜를 YYYYMMDD 형식으로 반환
function getDateOffset(daysOffset: number = 0, baseDate: Date = new Date()): string {
    const targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + daysOffset);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// 오늘 날짜를 YYYYMMDD 형식으로 반환
function getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

export default function EtfPage() {
    const router = useRouter();
    const { user, isLoggedIn, loading: authLoading } = useAuth();
    const [selectedDate, setSelectedDate] = useState<string>(getDateOffset(-1)); // 어제 날짜 = -1일 (하루 전)
    const { data, loading, error, fetchedAt, fetchEtfData, refetch } = useEtfData();

    // 페이지 로드 시 데이터 자동 조회
    useEffect(() => {
        fetchEtfData(selectedDate);
    }, [selectedDate]);

    // 날짜 변경 핸들러
    const handleDateChange = (date: string) => {
        setSelectedDate(date);
    };

    // 새로고침 핸들러
    const handleRefresh = () => {
        refetch(selectedDate);
    };

    // 행 클릭 핸들러 - 상세 페이지로 이동
    const handleRowClick = (item: EtfDisplayItem) => {
        localStorage.setItem(`etf_${item.id}`, JSON.stringify(item));

        router.push(`/etf/${item.id}`);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white">ETF 정보</h1>
                                <p className="text-green-100 mt-2">
                                    상장지수펀드(ETF) 상품 정보 조회
                                </p>
                                {isLoggedIn && user && (
                                    <p className="text-green-200 text-sm mt-1">
                                        {user.nickname || user.name}님 환영합니다
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-colors backdrop-blur-sm"
                                >
                                    {loading ? "조회 중..." : "새로고침"}
                                </button>
                                <button
                                    onClick={() => router.push("/")}
                                    className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors backdrop-blur-sm"
                                >
                                    홈으로
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 필터 영역 (날짜 선택) */}
                    <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <DatePicker
                                value={selectedDate}
                                onChange={handleDateChange}
                                label="조회 날짜"
                            />
                            {fetchedAt && !loading && (
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    데이터 조회 시간: {formatDateTime(fetchedAt)}
                                </p>
                            )}
                        </div>
                    </div>

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
                                            onClick={handleRefresh}
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
                                선택한 날짜에 ETF 데이터가 없습니다. 다른 날짜를 선택해주세요.
                            </p>
                        </div>
                    )}

                    {/* 테이블 */}
                    {!loading && !error && data && data.length > 0 && (
                        <div className="px-6 py-6">
                            <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                                총{" "}
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {data.length}
                                </span>
                                개의 ETF 상품
                            </div>
                            <EtfTable data={data} onRowClick={handleRowClick} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}