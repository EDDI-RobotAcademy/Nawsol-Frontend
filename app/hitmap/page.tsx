"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ApiResponse {
    success: boolean;
    summary: {
        total_income: number;
        total_expense: number;
        surplus: number;
        surplus_ratio: number;
        status: string;
    };
    income: {
        [category: string]: {
            [item: string]: number;
        };
    };
    expense: {
        [category: string]: {
            [item: string]: number;
        };
    };
    chart_data: {
        income_by_category: {
            [key: string]: number;
        };
        expense_by_main_category: {
            [key: string]: number;
        };
    };
}

export default function HeatmapPage() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents-multi-agents/result`,
                    {
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: "데이터 조회 실패" }));
                    throw new Error(errorData.detail || `HTTP ${response.status}: 데이터 조회 실패`);
                }

                const result: ApiResponse = await response.json();
                setData(result);
            } catch (err) {
                console.error("[Heatmap] Failed to fetch data:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "데이터를 불러오는데 실패했습니다."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isLoggedIn, router]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
        }).format(value);
    };

    // 지출 데이터를 히트맵 형식으로 변환
    const prepareHeatmapData = (): { category: string; total: number; items: Array<{ name: string; value: number }> }[] => {
        if (!data?.expense) return [];

        const categories = Object.keys(data.expense);
        const result = categories.map((category) => {
            const items = Object.entries(data.expense[category])
                .filter(([, value]) => value > 0)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            const total = items.reduce((sum, item) => sum + item.value, 0);

            return {
                category,
                total,
                items,
            };
        }).filter(item => item.total > 0)
          .sort((a, b) => b.total - a.total);

        return result;
    };

    // 색상 강도 계산 (0-1 사이 값)
    const getIntensity = (value: number, maxValue: number): number => {
        if (maxValue === 0) return 0;
        return Math.min(value / maxValue, 1);
    };

    // 색상 계산
    const getColor = (intensity: number): string => {
        // 빨간색 계열로 히트맵 색상 생성
        const red = Math.floor(255 * intensity);
        const green = Math.floor(255 * (1 - intensity * 0.5));
        const blue = Math.floor(255 * (1 - intensity * 0.5));
        return `rgb(${red}, ${green}, ${blue})`;
    };

    if (loading) {
        return (
            <LoadingSpinner
                messages={[
                    "Redis에서 지출 데이터를 가져오는 중...",
                    "카테고리별로 지출을 분류하고 있습니다...",
                    "히트맵 색상을 계산하고 있습니다...",
                    "지출 패턴을 분석하고 있습니다...",
                    "거의 완료되었습니다!"
                ]}
                interval={1500}
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

    if (!data) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-black">
                <p className="text-zinc-600 dark:text-zinc-400">
                    데이터를 찾을 수 없습니다.
                </p>
            </div>
        );
    }

    const heatmapData = prepareHeatmapData();

    const maxValue = Math.max(...heatmapData.map(item => item.total), 1);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-lg shadow-lg mb-8 px-6 py-6">
                    <h1 className="text-3xl font-bold text-white mb-2">월별 지출 히트맵</h1>
                    <p className="text-red-100">카테고리별 지출 현황을 한눈에 확인하세요</p>
                </div>

                {/* 요약 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">총 지출</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(data.summary.total_expense)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">지출 카테고리 수</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {heatmapData.length}개
                        </p>
                    </div>
                </div>

                {/* 히트맵 */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        카테고리별 지출 히트맵
                    </h2>
                    {heatmapData.length > 0 ? (
                        <div className="space-y-4">
                            {heatmapData.map((categoryData) => {
                                const intensity = getIntensity(categoryData.total, maxValue);
                                const color = getColor(intensity);

                                return (
                                    <div
                                        key={categoryData.category}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                                    >
                                        <div
                                            className="p-4 text-white font-semibold"
                                            style={{ backgroundColor: color }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg">{categoryData.category}</span>
                                                <span className="text-sm opacity-90">
                                                    {formatCurrency(categoryData.total)} ({(intensity * 100).toFixed(1)}%)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {categoryData.items.map((item) => {
                                                    const itemIntensity = getIntensity(item.value, categoryData.total);
                                                    const itemColor = getColor(itemIntensity * 0.7); // 하위 항목은 약간 더 연하게
                                                    return (
                                                        <div
                                                            key={item.name}
                                                            className="p-3 rounded border border-gray-200 dark:border-gray-700"
                                                            style={{ backgroundColor: itemColor + "20" }}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                                    {item.name}
                                                                </span>
                                                                <div
                                                                    className="w-3 h-3 rounded ml-2 flex-shrink-0"
                                                                    style={{ backgroundColor: itemColor }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                {formatCurrency(item.value)} ({(itemIntensity * 100).toFixed(1)}%)
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            지출 데이터가 없습니다.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

