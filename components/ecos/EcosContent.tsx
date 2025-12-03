"use client";

import { useMemo, useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
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

// 금리 데이터 타입
interface InterestRateItem {
    interest_type: string;
    interest_rate: number;
    erm_date: string; // ISO date string
    created_at: string;
}

type InterestRateData = InterestRateItem[];

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

// 금리 데이터를 차트 형식으로 변환
function prepareInterestRateChartData(data: InterestRateData): Array<{ date: string; [interestType: string]: string | number }> {
    // 날짜별로 그룹화
    const dateMap = new Map<string, { [interestType: string]: number }>();

    data.forEach((item) => {
        const date = new Date(item.erm_date);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, {});
        }

        const dayData = dateMap.get(dateKey)!;
        dayData[item.interest_type] = item.interest_rate;
    });

    // 날짜순으로 정렬하여 배열로 변환
    return Array.from(dateMap.entries())
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, rates]) => ({
            date,
            ...rates,
        }));
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
        if (activeTab !== "interest_rate" || !data || !Array.isArray(data) || data.length === 0) {
            return [];
        }
        return prepareInterestRateChartData(data as InterestRateData);
    }, [data, activeTab]);

    const interestRateTypes = useMemo(() => {
        if (activeTab !== "interest_rate" || !data || !Array.isArray(data)) {
            return [];
        }
        return Array.from(new Set((data as InterestRateData).map((item) => item.interest_type)));
    }, [data, activeTab]);

    // 현재 탭에 맞는 차트 데이터와 타입
    const chartData = activeTab === "exchange_rate" ? exchangeRateChartData : interestRateChartData;
    const dataTypes = activeTab === "exchange_rate" ? exchangeRateTypes : interestRateTypes;

    // 각 항목의 min/max 계산 및 Y축 domain 설정
    const itemDomains = useMemo(() => {
        const domains: Record<string, [number, number]> = {};
        
        if (!chartData || chartData.length === 0) return domains;

        // 금리 데이터는 모든 항목의 값을 통합해서 하나의 domain 계산
        if (activeTab === "interest_rate") {
            const allValues: number[] = [];
            chartData.forEach((item) => {
                const record = item as Record<string, number | string | undefined>;
                dataTypes.forEach((itemName) => {
                    const value = record[itemName];
                    if (typeof value === "number") {
                        allValues.push(value);
                    }
                });
            });

            if (allValues.length > 0) {
                const min = Math.min(...allValues);
                const max = Math.max(...allValues);
                const range = max - min;
                const padding = range * 0.1; // 10% 패딩
                const commonDomain: [number, number] = [
                    Math.max(0, min - padding),
                    max + padding,
                ];
                // 모든 금리 항목에 같은 domain 적용
                dataTypes.forEach((itemName) => {
                    domains[itemName] = commonDomain;
                });
            }
        } else {
            // 환율 데이터는 각 항목별로 독립적인 domain 계산
            dataTypes.forEach((itemName) => {
                const values: number[] = [];
                chartData.forEach((item) => {
                    const record = item as Record<string, number | string | undefined>;
                    const value = record[itemName];
                    if (typeof value === "number") {
                        values.push(value);
                    }
                });

                if (values.length > 0) {
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const range = max - min;
                    const padding = range * 0.1; // 10% 패딩
                    domains[itemName] = [
                        Math.max(0, min - padding),
                        max + padding,
                    ];
                }
            });
        }

        return domains;
    }, [chartData, dataTypes, activeTab]);

    // 각 항목의 표시/숨김 상태 관리
    const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

    // 탭이 변경되거나 데이터 타입이 변경되면 숨김 상태 초기화
    useEffect(() => {
        setHiddenItems(new Set());
    }, [activeTab, dataTypes.join(",")]);

    // 항목 토글 함수
    const toggleItem = (itemName: string) => {
        setHiddenItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(itemName)) {
                newSet.delete(itemName);
            } else {
                newSet.add(itemName);
            }
            return newSet;
        });
    };
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
    const hasNoData = !data || !Array.isArray(data) || data.length === 0;

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

            {chartData.length > 0 ? (
                <div className="mt-6">
                    <ResponsiveContainer width="100%" height={500}>
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                tick={{ fill: "#6b7280" }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                }}
                            />
                            {activeTab === "exchange_rate"
                                ? exchangeRateTypes.map((exchangeType, index) => {
                                      const yAxisId = `yAxis-${exchangeType}`;
                                      const domain = itemDomains[exchangeType] || [0, 100];
                                      const isHidden = hiddenItems.has(exchangeType);

                                      return (
                                          <g key={exchangeType}>
                                              <YAxis
                                                  yAxisId={yAxisId}
                                                  orientation={index === 0 ? "left" : "right"}
                                                  stroke={EXCHANGE_RATE_COLORS[exchangeType] || COLORS[0]}
                                                  tick={{ fill: EXCHANGE_RATE_COLORS[exchangeType] || COLORS[0] }}
                                                  domain={domain}
                                                  width={60}
                                                  hide={true}
                                              />
                                              <Line
                                                  yAxisId={yAxisId}
                                                  type="monotone"
                                                  dataKey={exchangeType}
                                                  name={EXCHANGE_RATE_NAMES[exchangeType] || exchangeType}
                                                  stroke={EXCHANGE_RATE_COLORS[exchangeType] || COLORS[0]}
                                                  strokeWidth={2}
                                                  dot={{ r: 4 }}
                                                  activeDot={{ r: 6 }}
                                                  hide={isHidden}
                                              />
                                          </g>
                                      );
                                  })
                                : (() => {
                                      // 금리는 하나의 공통 Y축 사용
                                      const commonYAxisId = "yAxis-interest-rate";
                                      const firstDomain = interestRateTypes.length > 0 
                                          ? itemDomains[interestRateTypes[0]] || [0, 100]
                                          : [0, 100];

                                      return (
                                          <>
                                              <YAxis
                                                  yAxisId={commonYAxisId}
                                                  orientation="left"
                                                  stroke="#6b7280"
                                                  tick={{ fill: "#6b7280" }}
                                                  domain={firstDomain}
                                                  width={60}
                                                  hide={true}
                                              />
                                              {interestRateTypes.map((interestType, index) => {
                                                  const isHidden = hiddenItems.has(interestType);
                                                  return (
                                                      <Line
                                                          key={interestType}
                                                          yAxisId={commonYAxisId}
                                                          type="monotone"
                                                          dataKey={interestType}
                                                          name={interestType}
                                                          stroke={COLORS[index % COLORS.length]}
                                                          strokeWidth={2}
                                                          dot={{ r: 4 }}
                                                          activeDot={{ r: 6 }}
                                                          hide={isHidden}
                                                      />
                                                  );
                                              })}
                                          </>
                                      );
                                  })()}
                        </LineChart>
                    </ResponsiveContainer>
                    {/* 커스텀 범례 */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {dataTypes.map((itemName, index) => {
                            const displayName =
                                activeTab === "exchange_rate"
                                    ? EXCHANGE_RATE_NAMES[itemName as keyof typeof EXCHANGE_RATE_NAMES] || itemName
                                    : itemName;
                            const color =
                                activeTab === "exchange_rate"
                                    ? EXCHANGE_RATE_COLORS[itemName as keyof typeof EXCHANGE_RATE_COLORS] || COLORS[0]
                                    : COLORS[index % COLORS.length];
                            const isHidden = hiddenItems.has(itemName);

                            return (
                                <button
                                    key={itemName}
                                    onClick={() => toggleItem(itemName)}
                                    className="flex items-center gap-2 px-3 py-1 rounded-lg transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    style={{
                                        opacity: isHidden ? 0.3 : 1,
                                        textDecoration: isHidden ? "line-through" : "none",
                                    }}
                                >
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{displayName}</span>
                                </button>
                            );
                        })}
                    </div>
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
                                    <th key="exchange-type" className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        환율 타입
                                    </th>
                                    <th key="exchange-date" className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        날짜
                                    </th>
                                    <th key="exchange-rate" className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        환율
                                    </th>
                                </>
                            ) : (
                                <>
                                    <th key="interest-type" className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        금리 타입
                                    </th>
                                    <th key="interest-date" className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        날짜
                                    </th>
                                    <th key="interest-rate" className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left">
                                        금리
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
                                              {item.exchange_rate != null && typeof item.exchange_rate === "number"
                                                  ? item.exchange_rate.toLocaleString("ko-KR", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })
                                                  : item.exchange_rate ?? "-"}
                                          </td>
                                      </tr>
                                  );
                              })
                            : activeTab === "interest_rate" && Array.isArray(data)
                            ? (data as InterestRateData).map((item, index) => {
                                  const date = new Date(item.erm_date);
                                  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

                                  return (
                                      <tr
                                          key={index}
                                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                      >
                                          <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300">
                                              {item.interest_type}
                                          </td>
                                          <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300">
                                              {formattedDate}
                                          </td>
                                          <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300 font-semibold">
                                              {item.interest_rate != null && typeof item.interest_rate === "number"
                                                  ? item.interest_rate.toLocaleString("ko-KR", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })
                                                  : item.interest_rate ?? "-"}
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

