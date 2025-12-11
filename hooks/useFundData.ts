import { useState, useCallback } from "react";
import { apiFetch } from "@/utils/api";
import { FundApiResponse, FundDisplayItem } from "@/types/fund";

interface UseFundDataReturn {
    data: FundDisplayItem[] | null;
    loading: boolean;
    error: string | null;
    fetchedAt: string | null;
    fetchFundData: (date?: string) => Promise<void>;
    refetch: (date?: string) => Promise<void>;
}

export const useFundData = (): UseFundDataReturn => {
    const [data, setData] = useState<FundDisplayItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);

    const fetchFundData = useCallback(async (date?: string) => {
        try {
            setLoading(true);
            setError(null);

            const targetDate = date || getTodayDate();

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/fund/${targetDate}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            console.log('[useFundData] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    detail: "Fund 데이터 조회 실패"
                }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 조회 실패`);
            }

            const result: FundApiResponse = await response.json();
            console.log('[useFundData] API Response:', result);
            console.log('[useFundData] Items count:', result.length);

            // Array인지 확인
            if (!Array.isArray(result)) {
                console.error('[useFundData] Response is not an array:', typeof result);
                throw new Error('API 응답 형식이 올바르지 않습니다. 배열이 아닙니다.');
            }

            // 데이터 가공
            const displayItems: FundDisplayItem[] = result.map((item, index) => ({
                ...item,
                displayId: `${item.basDt}-${item.srtnCd || item.id}-${index}`,
            }));

            console.log('[useFundData] Display items created:', displayItems.length);

            setData(displayItems);
            setFetchedAt(new Date().toISOString());  // 현재 시간 사용

            console.log('[useFundData] Success');

        } catch (err) {
            console.error("[useFundData] Error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Fund 데이터를 불러오는데 실패했습니다."
            );
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async (date?: string) => {
        await fetchFundData(date);
    }, [fetchFundData]);

    return {
        data,
        loading,
        error,
        fetchedAt,
        fetchFundData,
        refetch,
    };
};

// 오늘 날짜를 YYYYMMDD 형식으로 반환
function getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

