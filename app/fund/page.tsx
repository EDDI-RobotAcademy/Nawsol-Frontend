"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { FundTable } from "@/components/fund/FundTable";
import { DatePicker } from "@/components/DatePicker";
import { formatDateTime } from "@/utils/etfUtils";
import { useFundData } from "@/hooks/useFundData";
import { FundDisplayItem } from "@/types/fund";

// 기준 날짜로부터 n일 전/후 날짜를 YYYYMMDD 형식으로 반환
function getDateOffset(daysOffset: number = 0, baseDate: Date = new Date()): string {
    const targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + daysOffset);
    const year = targetDate.getFullYear();  
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

export default function FundPage() {
    const router = useRouter();
    const { user, isLoggedIn } = useAuth();
    const [selectedDate, setSelectedDate] = useState<string>(getDateOffset(-1)); // 어제 날짜 = -1일 (하루 전)
    const [selectedFundType, setSelectedFundType] = useState<string>("all"); // 선택된 펀드유형
    const { data, loading, error, fetchedAt, fetchFundData, refetch } = useFundData();

    // 페이지 로드 시 데이터 자동 조회
    useEffect(() => {
        fetchFundData(selectedDate);
    }, [selectedDate, fetchFundData]);

    // 날짜 변경 핸들러
    const handleDateChange = (date: string) => {
        setSelectedDate(date);
    };

    // 새로고침 핸들러
    const handleRefresh = () => {
        refetch(selectedDate);
    };

    // 고유한 펀드유형 목록 추출
    const fundTypes = data
        ? Array.from(new Set(data.map((item) => item.fndTp).filter((type): type is string => type !== null)))
        : [];

    // 필터링된 데이터
    const filteredData: FundDisplayItem[] = data
        ? selectedFundType === "all"
            ? data
            : data.filter((item) => item.fndTp === selectedFundType)
        : [];


    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Fund 정보</h1>
                                <p className="text-green-100 mt-2">
                                    펀드 상품 정보 조회
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

                    {/* 필터 영역 (날짜 선택 및 펀드유형 필터) */}
                    <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                        <div className="flex flex-col gap-4">
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
                            
                            {/* 펀드유형 필터 */}
                            {!loading && data && data.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        펀드유형 필터:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedFundType("all")}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                selectedFundType === "all"
                                                    ? "bg-green-600 text-white hover:bg-green-700"
                                                    : "bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600"
                                            }`}
                                        >
                                            전체
                                        </button>
                                        {fundTypes.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedFundType(type)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    selectedFundType === type
                                                        ? "bg-green-600 text-white hover:bg-green-700"
                                                        : "bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600"
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 로딩 상태 */}
                    {loading && (
                        <div className="px-6 py-16">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400 mx-auto mb-4"></div>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    Fund 데이터를 불러오는 중...
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

                    {/* 필터링된 데이터 없음 */}
                    {!loading && !error && data && data.length > 0 && filteredData.length === 0 && (
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
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                선택한 펀드유형에 해당하는 데이터가 없습니다
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                다른 펀드유형을 선택해주세요.
                            </p>
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
                                선택한 날짜에 Fund 데이터가 없습니다. 다른 날짜를 선택해주세요.
                            </p>
                        </div>
                    )}

                    {/* 테이블 */}
                    {!loading && !error && filteredData.length > 0 && data && (
                        <div className="px-6 py-6">
                            <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                                {selectedFundType === "all" ? (
                                    <>
                                        총{" "}
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            {filteredData.length}
                                        </span>
                                        개의 Fund 상품
                                    </>
                                ) : (
                                    <>
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            {selectedFundType}
                                        </span>
                                        {" "}유형{" "}
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            {filteredData.length}
                                        </span>
                                        개 (전체 {data.length}개)
                                    </>
                                )}
                            </div>
                            <FundTable data={filteredData} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

