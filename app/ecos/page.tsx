"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import EcosHeader from "../../components/ecos/EcosHeader";
import EcosTabs from "../../components/ecos/EcosTabs";
import EcosContent from "../../components/ecos/EcosContent";
import MonthNavigator from "../../components/ecos/MonthNavigator";

interface ExchangeRateItem {
    exchange_type: "DOLLAR" | "YEN" | "EURO";
    exchange_rate: number;
    erm_date: string; // ISO date string
    created_at: string;
}

// 환율 데이터는 배열로 직접 반환
type ExchangeRateData = ExchangeRateItem[];

// 금리 데이터도 배열로 직접 반환
interface InterestRateItem {
    interest_type: string;
    interest_rate: number;
    erm_date: string; // ISO date string
    created_at: string;
}

type InterestRateData = InterestRateItem[];

type EcosData = ExchangeRateData | InterestRateData;

export default function EcosPage() {
    const [activeTab, setActiveTab] = useState<"exchange_rate" | "interest_rate">("exchange_rate");
    const [data, setData] = useState<EcosData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    // 날짜 선택 (YYYYMM 형식)
    const getCurrentMonthString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        return `${year}${month}`;
    };
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());

    // API 요청 취소를 위한 AbortController ref
    const abortControllerRef = useRef<AbortController | null>(null);
    // 첫 마운트 여부 체크
    const isFirstMountRef = useRef(true);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            // 첫 마운트가 아닐 때만 이전 요청 취소
            if (!isFirstMountRef.current && abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // 첫 마운트 체크 완료
            isFirstMountRef.current = false;

            // 새로운 AbortController 생성
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                setLoading(true);
                setError(null);
                setData(null); // 이전 결과 초기화

                let endpoint: string;
                if (activeTab === "exchange_rate") {
                    // 날짜를 YYYYMM 형식으로 사용
                    endpoint = `/ecos/exchange_rate_by_date/${selectedMonth}`;
                } else {
                    endpoint = `/ecos/interest_rate_by_date/${selectedMonth}`;
                }

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
                    {
                        credentials: "include",
                        signal: abortController.signal, // 취소 시그널 전달
                    }
                );

                if (!response.ok) {
                    const err = await response.json().catch(() => null);
                    throw new Error(err?.detail || "데이터 조회 실패");
                }

                const result = await response.json();

                // 요청이 취소되지 않았을 때만 결과 업데이트
                if (!abortController.signal.aborted) {
                    setData(result);
                    setError(null);
                }
            } catch (e: any) {
                // AbortError는 무시 (정상적인 취소)
                if (e.name === "AbortError") {
                    return;
                }

                if (!abortController.signal.aborted) {
                    setError(e.message || "데이터 조회 실패");
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        // cleanup: 컴포넌트 언마운트 시 진행 중인 요청 취소
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [activeTab, selectedMonth, isLoggedIn, router]);

    const handleTabChange = (tab: "exchange_rate" | "interest_rate") => {
        setActiveTab(tab);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    <EcosHeader />
                    <EcosTabs activeTab={activeTab} onTabChange={handleTabChange} />
                    <div className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                        <MonthNavigator
                            currentMonth={selectedMonth}
                            onMonthChange={setSelectedMonth}
                        />
                    </div>
                    <EcosContent loading={loading} error={error} data={data} activeTab={activeTab} />
                </div>
            </div>
        </div>
    );
}

