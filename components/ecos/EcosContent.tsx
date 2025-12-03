"use client";

import { useMemo } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// 환율 데이터 타입
interface ExchangeRateItem {
    exchange_type: "DOLLAR" | "YEN" | "EURO";
    exchange_rate: number;
    erm_date: string; // ISO date string
    created_at: string;
}

type ExchangeRateData = ExchangeRateItem[];

// 금리 데이터 타입 (기존 형식)
interface InterestRateItem {
    item_type: string;
    time: string;
    value: string;
}

interface InterestRateData {
    source: {
        source: string;
    };
    fetched_at: string;
    items: InterestRateItem[];
}

type EcosData = ExchangeRateData | InterestRateData;

interface EcosContentProps {
    loading: boolean;
    error: string | null;
    data: EcosData | null;
    activeTab: "exchange_rate" | "interest_rate";
}

// 환율 데이터를 차트 형식으로 변환
function prepareExchangeRateChartData(data: ExchangeRateData): Array<{ date: string; DOLLAR?: number; YEN?: number; EURO?: number }> {
    // 날짜별로 그룹화
    const dateMap = new Map<string, { DOLLAR?: number; YEN?: number; EURO?: number }>();

    data.forEach((item) => {
        const date = new Date(item.erm_date);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, {});
        }

        const dayData = dateMap.get(dateKey)!;
        dayData[item.exchange_type] = item.exchange_rate;
    });

    // 날짜순으로 정렬하여 배열로 변환
    return Array.from(dateMap.entries())
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, rates]) => ({
            date,
            ...rates,
        }));
}

// 금리 데이터를 차트 형식으로 변환 (기존 로직 유지)
function prepareInterestRateChartData(items: InterestRateItem[]): Array<{ week: string; [key: string]: string | number }> {
    const grouped: { [key: string]: { [itemType: string]: number } } = {};

    items.forEach((item) => {
        // time 형식: "20251202" -> Date 객체로 변환
        const year = parseInt(item.time.substring(0, 4));
        const month = parseInt(item.time.substring(4, 6)) - 1;
        const day = parseInt(item.time.substring(6, 8));
        const date = new Date(year, month, day);

        // 주의 시작일(월요일)을 기준으로 주 그룹 키 생성
        const dayOfWeek = date.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(date);
        monday.setDate(date.getDate() + mondayOffset);

        const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;

        if (!grouped[weekKey]) {
            grouped[weekKey] = {};
        }

        const value = parseFloat(item.value);
        if (!isNaN(value)) {
            if (grouped[weekKey][item.item_type]) {
                grouped[weekKey][item.item_type] = (grouped[weekKey][item.item_type] + value) / 2;
            } else {
                grouped[weekKey][item.item_type] = value;
            }
        }
    });

    const itemTypes = new Set<string>();
    items.forEach((item) => itemTypes.add(item.item_type));

    return Object.keys(grouped)
        .sort()
        .map((weekKey) => {
            const dataPoint: { week: string; [key: string]: string | number } = {
                week: weekKey,
            };

            itemTypes.forEach((itemType) => {
                dataPoint[itemType] = grouped[weekKey][itemType] || 0;
            });

            return dataPoint;
        });
}

// 색상 팔레트
const COLORS = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#10b981", // green
    "#f59e0b", // amber
    "#14b8a6", // teal
    "#f97316", // orange
    "#ef4444", // red
    "#06b6d4", // cyan
];

// 환율 타입별 색상
const EXCHANGE_RATE_COLORS: Record<string, string> = {
    DOLLAR: "#3b82f6", // blue
    YEN: "#ef4444", // red
    EURO: "#10b981", // green
};

// 환율 타입 한글명
const EXCHANGE_RATE_NAMES: Record<string, string> = {
    DOLLAR: "달러",
    YEN: "엔",
    EURO: "유로",
};

export default function EcosContent({ loading, error, data, activeTab }: EcosContentProps) {
    // 환율 데이터 처리
    const exchangeRateChartData = useMemo(() => {
        if (activeTab !== "exchange_rate" || !data || !Array.isArray(data) || data.length === 0) {
            return [];
        }
        return prepareExchangeRateChartData(data as ExchangeRateData);
    }, [data, activeTab]);

    const exchangeRateTypes = useMemo(() => {
        if (activeTab !== "exchange_rate" || !data || !Array.isArray(data)) {
            return [];
        }
        return Array.from(new Set((data as ExchangeRateData).map((item) => item.exchange_type)));
    }, [data, activeTab]);

    // 금리 데이터 처리
    const interestRateChartData = useMemo(() => {
        if (activeTab !== "interest_rate" || !data || !("items" in data) || !data.items || data.items.length === 0) {
            return [];
        }
        return prepareInterestRateChartData((data as InterestRateData).items);
    }, [data, activeTab]);

    const interestRateTypes = useMemo(() => {
        if (activeTab !== "interest_rate" || !data || !("items" in data) || !data.items) {
            return [];
        }
        return Array.from(new Set((data as InterestRateData).items.map((item) => item.item_type)));
    }, [data, activeTab]);

    // 현재 탭에 맞는 차트 데이터와 타입
    const chartData = activeTab === "exchange_rate" ? exchangeRateChartData : interestRateChartData;
    if (loading) {
        return (
            <div className="px-6 py-8 min-h-[300px]">
                <LoadingSpinner
                    messages={[
                        `${activeTab === "exchange_rate" ? "환율" : "금리"} 데이터를 불러오는 중...`,
                        "경제 데이터를 분석하고 있습니다...",
                        "차트를 생성하고 있습니다...",
                        "거의 완료되었습니다!",
                    ]}
                    interval={1800}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-6 py-8 min-h-[300px]">
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                    <svg
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    // 데이터가 없는 경우 체크
    const hasNoData =
        activeTab === "exchange_rate"
            ? !data || !Array.isArray(data) || data.length === 0
            : !data || !("items" in data) || !data.items || data.items.length === 0;

    if (hasNoData) {
        return (
            <div className="px-6 py-8 min-h-[300px]">
                <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
                    데이터가 없습니다.
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="px-6 py-8 min-h-[300px]">
                <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
                    데이터가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 py-8 min-h-[300px]">
            {activeTab === "interest_rate" && "fetched_at" in data && (
                <div className="mb-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        최종 업데이트: {data.fetched_at ? new Date(data.fetched_at).toLocaleString("ko-KR") : "알 수 없음"}
                    </p>
                </div>
            )}

            {chartData.length > 0 ? (
                <div className="mt-6">
                    <ResponsiveContainer width="100%" height={500}>
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey={activeTab === "exchange_rate" ? "date" : "week"}
                                stroke="#6b7280"
                                tick={{ fill: "#6b7280" }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis stroke="#6b7280" tick={{ fill: "#6b7280" }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                }}
                            />
                            <Legend />
                            {activeTab === "exchange_rate"
                                ? exchangeRateTypes.map((exchangeType) => (
                                      <Line
                                          key={exchangeType}
                                          type="monotone"
                                          dataKey={exchangeType}
                                          name={EXCHANGE_RATE_NAMES[exchangeType] || exchangeType}
                                          stroke={EXCHANGE_RATE_COLORS[exchangeType] || COLORS[0]}
                                          strokeWidth={2}
                                          dot={{ r: 4 }}
                                          activeDot={{ r: 6 }}
                                      />
                                  ))
                                : interestRateTypes.map((itemType, index) => (
                                      <Line
                                          key={itemType}
                                          type="monotone"
                                          dataKey={itemType}
                                          stroke={COLORS[index % COLORS.length]}
                                          strokeWidth={2}
                                          dot={{ r: 4 }}
                                          activeDot={{ r: 6 }}
                                      />
                                  ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
                    차트 데이터를 생성할 수 없습니다.
                </div>
            )}

            {/* 데이터 테이블 */}
            <div className="mt-8 overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                    상세 데이터
                </h3>
                <table className="w-full border-collapse border border-zinc-300 dark:border-zinc-700">
                    <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-800">
                            {activeTab === "exchange_rate" ? (
                                <>
                                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        환율 타입
                                    </th>
                                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        날짜
                                    </th>
                                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        환율
                                    </th>
                                </>
                            ) : (
                                <>
                                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        항목
                                    </th>
                                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        날짜
                                    </th>
                                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        값
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === "exchange_rate" && Array.isArray(data)
                            ? (data as ExchangeRateData).map((item, index) => {
                                  const date = new Date(item.erm_date);
                                  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

                                  return (
                                      <tr
                                          key={index}
                                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                      >
                                          <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300">
                                              {EXCHANGE_RATE_NAMES[item.exchange_type] || item.exchange_type}
                                          </td>
                                          <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300">
                                              {formattedDate}
                                          </td>
                                          <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300 font-semibold">
                                              {item.exchange_rate.toLocaleString("ko-KR", {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                              })}
                                          </td>
                                      </tr>
                                  );
                              })
                            : "items" in data && data.items
                            ? (data as InterestRateData).items.map((item, index) => {
                                  const year = item.time.substring(0, 4);
                                  const month = item.time.substring(4, 6);
                                  const day = item.time.substring(6, 8);
                                  const formattedDate = `${year}-${month}-${day}`;

                                  return (
                                      <tr
                                          key={index}
                                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                      >
                                          <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300">
                                              {item.item_type}
                                          </td>
                                          <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300">
                                              {formattedDate}
                                          </td>
                                          <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300 font-semibold">
                                              {item.value}
                                          </td>
                                      </tr>
                                  );
                              })
                            : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

