"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ChartData {
    name: string;
    value: number;
    total?: number;
}

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

type ChartType = "income" | "expense";
type Level = 1 | 2;

interface ChartState {
    type: ChartType;
    level: Level;
    selectedCategory?: string;
}

const COLORS = {
    income: ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#14b8a6", "#f97316"],
    expense: ["#ef4444", "#f97316", "#eab308", "#06b6d4", "#8b5cf6", "#ec4899"],
};

export default function PieChartPage() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [incomeState, setIncomeState] = useState<ChartState>({ type: "income", level: 1 });
    const [expenseState, setExpenseState] = useState<ChartState>({ type: "expense", level: 1 });
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
                console.error("[PieChart] Failed to fetch data:", err);
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

    // 레벨 1 데이터 준비 (카테고리별)
    const prepareLevel1IncomeData = (): ChartData[] => {
        if (!data?.chart_data?.income_by_category) return [];
        return Object.entries(data.chart_data.income_by_category)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name,
                value,
            }));
    };

    const prepareLevel1ExpenseData = (): ChartData[] => {
        if (!data?.chart_data?.expense_by_main_category) return [];
        return Object.entries(data.chart_data.expense_by_main_category)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name,
                value,
            }));
    };

    // 레벨 2 데이터 준비 (하위 항목)
    const prepareLevel2IncomeData = (category: string): ChartData[] => {
        if (!data?.income?.[category]) return [];
        return Object.entries(data.income[category])
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name,
                value,
            }));
    };

    const prepareLevel2ExpenseData = (category: string): ChartData[] => {
        if (!data?.expense?.[category]) return [];
        return Object.entries(data.expense[category])
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name,
                value,
            }));
    };

    // 현재 표시할 데이터 가져오기
    const getCurrentIncomeData = (): ChartData[] => {
        if (incomeState.level === 1) {
            return prepareLevel1IncomeData();
        } else if (incomeState.level === 2 && incomeState.selectedCategory) {
            return prepareLevel2IncomeData(incomeState.selectedCategory);
        }
        return [];
    };

    const getCurrentExpenseData = (): ChartData[] => {
        if (expenseState.level === 1) {
            return prepareLevel1ExpenseData();
        } else if (expenseState.level === 2 && expenseState.selectedCategory) {
            return prepareLevel2ExpenseData(expenseState.selectedCategory);
        }
        return [];
    };

    interface TooltipProps {
        active?: boolean;
        payload?: Array<{
            name: string;
            value: number;
            payload: {
                name: string;
                value: number;
                total: number;
            };
        }>;
    }

    const CustomTooltip = ({ active, payload }: TooltipProps) => {
        if (active && payload && payload.length) {
            const total = payload[0].payload.total || 0;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">{payload[0].name}</p>
                    <p className="text-blue-600 dark:text-blue-400">
                        {formatCurrency(payload[0].value)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        비율: {total > 0 ? ((payload[0].value / total) * 100).toFixed(2) : 0}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        합계: {formatCurrency(total)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderLabel = (entry: { name?: string; value?: number; percent?: number; total?: number }) => {
        if (!entry.name || entry.value === undefined) return "";
        // 합계 금액만 표시 (100% 기준)
        return `${formatCurrency(entry.value)}`;
    };

    // 파이 차트 클릭 핸들러
    const handlePieClick = (type: ChartType, categoryName: string) => {
        if (type === "income") {
            if (incomeState.level === 1) {
                // 레벨 2로 이동
                setIncomeState({ type: "income", level: 2, selectedCategory: categoryName });
            }
        } else {
            if (expenseState.level === 1) {
                // 레벨 2로 이동
                setExpenseState({ type: "expense", level: 2, selectedCategory: categoryName });
            }
        }
    };

    // 리스트 항목 클릭 핸들러 (레벨 업)
    const handleListClick = (type: ChartType) => {
        if (type === "income") {
            if (incomeState.level === 2) {
                setIncomeState({ type: "income", level: 1 });
            }
        } else {
            if (expenseState.level === 2) {
                setExpenseState({ type: "expense", level: 1 });
            }
        }
    };

    if (loading) {
        return (
            <LoadingSpinner
                messages={[
                    "Redis에서 재무 데이터를 가져오는 중...",
                    "소득 항목을 카테고리별로 분류하고 있습니다...",
                    "지출 항목을 카테고리별로 분류하고 있습니다...",
                    "차트 데이터를 준비하고 있습니다...",
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

    const incomeData = getCurrentIncomeData();
    const expenseData = getCurrentExpenseData();

    // 총합 계산
    const incomeTotal = incomeData.reduce((sum, item) => sum + item.value, 0);
    const expenseTotal = expenseData.reduce((sum, item) => sum + item.value, 0);

    const renderChart = (
        type: ChartType,
        state: ChartState,
        data: ChartData[],
        total: number,
        colors: string[],
        setState: (state: ChartState) => void
    ) => {
        // 원래 인덱스와 함께 데이터 준비
        const dataWithIndex = data.map((item, index) => ({ ...item, originalIndex: index }));
        
        // 금액 순으로 정렬 (내림차순)
        const sortedData = [...dataWithIndex].sort((a, b) => b.value - a.value);
        const dataWithTotal = sortedData.map(item => ({ ...item, total }));
        
        // 항목이 많을 경우 레이블을 표시하지 않음 (5개 이하일 때만 표시)
        const showLabel = data.length <= 5;

        return (
            <div className="w-full">
                <div className="mb-4 flex items-center gap-2">
                    {state.level === 2 && (
                        <button
                            onClick={() => setState({ type, level: 1 })}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                            ← 뒤로
                        </button>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {state.level === 2 && state.selectedCategory
                            ? `${state.selectedCategory} 상세`
                            : type === "income"
                            ? "소득 카테고리별 분포"
                            : "지출 카테고리별 분포"}
                    </h3>
                </div>
                {data.length > 0 ? (
                    <>
                        <div className="flex gap-4">
                            <ResponsiveContainer width="60%" height={450}>
                                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <Pie
                                        data={dataWithTotal}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={showLabel ? renderLabel : false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        onClick={(data: ChartData) => {
                                            if (state.level === 1) {
                                                handlePieClick(type, data.name);
                                            }
                                        }}
                                        style={{ cursor: state.level === 1 ? "pointer" : "default" }}
                                    >
                                        {dataWithTotal.map((entry) => {
                                            const colorIndex = (entry as ChartData & { originalIndex: number }).originalIndex;
                                            return (
                                                <Cell
                                                    key={`cell-${entry.name}`}
                                                    fill={colors[colorIndex % colors.length]}
                                                />
                                            );
                                        })}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 flex items-start pt-4">
                                <div className="w-full">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        상위 5개 항목
                                    </h4>
                                    <div className="space-y-2">
                                        {dataWithTotal
                                            .slice(0, 5)
                                            .map((item) => {
                                                const colorIndex = (item as ChartData & { originalIndex: number }).originalIndex;
                                                return (
                                                    <div
                                                        key={item.name}
                                                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                                                    >
                                                        <div
                                                            className="w-4 h-4 rounded flex-shrink-0"
                                                            style={{
                                                                backgroundColor: colors[colorIndex % colors.length],
                                                            }}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                {formatCurrency(item.value)} ({total > 0 ? ((item.value / total) * 100).toFixed(2) : 0}%)
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            {dataWithTotal.map((item) => {
                                const colorIndex = (item as ChartData & { originalIndex: number }).originalIndex;
                                
                                return (
                                    <div
                                        key={item.name}
                                        onClick={() => {
                                            if (state.level === 1) {
                                                handlePieClick(type, item.name);
                                            } else {
                                                handleListClick(type);
                                            }
                                        }}
                                        className={`flex items-center justify-between gap-4 p-2 rounded transition-colors ${
                                            state.level === 1
                                                ? "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                                : "bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div
                                                className="w-4 h-4 rounded flex-shrink-0"
                                                style={{
                                                    backgroundColor: colors[colorIndex % colors.length],
                                                }}
                                            ></div>
                                            <span className="text-gray-700 dark:text-gray-300 truncate">
                                                {item.name}
                                            </span>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                                {formatCurrency(item.value)}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {total > 0 ? ((item.value / total) * 100).toFixed(2) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        {type === "income" ? "소득" : "지출"} 데이터가 없습니다.
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg mb-8 px-6 py-6">
                    <h1 className="text-3xl font-bold text-white mb-2">소득/지출 분석</h1>
                    <p className="text-blue-100">카테고리별 소득 및 지출 현황</p>
                </div>

                {/* 요약 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">총 소득</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(data.summary.total_income)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">총 지출</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(data.summary.total_expense)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">흑자/적자</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(data.summary.surplus)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">흑자 비율</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {data.summary.surplus_ratio.toFixed(2)}%
                        </p>
                    </div>
                </div>

                {/* 차트 영역 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 소득 파이 차트 */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            소득 카테고리별 분포
                        </h2>
                        {renderChart(
                            "income",
                            incomeState,
                            incomeData,
                            incomeTotal,
                            COLORS.income,
                            setIncomeState
                        )}
                    </div>

                    {/* 지출 파이 차트 */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            지출 카테고리별 분포
                        </h2>
                        {renderChart(
                            "expense",
                            expenseState,
                            expenseData,
                            expenseTotal,
                            COLORS.expense,
                            setExpenseState
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
