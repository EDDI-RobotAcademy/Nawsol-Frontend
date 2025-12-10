import { useState, useCallback } from "react";
import { apiFetch } from "@/utils/api";
import { EtfApiResponse, EtfDisplayItem } from "@/types/etf";

interface UseEtfDataReturn {
    data: EtfDisplayItem[] | null;
    loading: boolean;
    error: string | null;
    fetchedAt: string | null;
    fetchEtfData: (date?: string) => Promise<void>;
    refetch: (date?: string) => Promise<void>;
}

export const useEtfData = (): UseEtfDataReturn => {
    const [data, setData] = useState<EtfDisplayItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);

    const fetchEtfData = useCallback(async (date?: string) => {
        try {
            setLoading(true);
            setError(null);

            const targetDate = date || getTodayDate();

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/etf/${targetDate}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            console.log('[useEtfData] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    detail: "ETF 데이터 조회 실패"
                }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 조회 실패`);
            }

            const result: EtfApiResponse = await response.json();
            console.log('[useEtfData] API Response:', result);
            console.log('[useEtfData] Items count:', result.length);

            // Array인지 확인
            if (!Array.isArray(result)) {
                console.error('[useEtfData] Response is not an array:', typeof result);
                throw new Error('API 응답 형식이 올바르지 않습니다. 배열이 아닙니다.');
            }

            // 데이터 가공
            const displayItems: EtfDisplayItem[] = result.map((item, index) => ({
                ...item,
                displayId: `${item.basDt}-${item.bssIdxIdxNm}-${index}`,
            }));

            console.log('[useEtfData] Display items created:', displayItems.length);

            setData(displayItems);
            setFetchedAt(new Date().toISOString());  // 현재 시간 사용

            console.log('[useEtfData] Success');

        } catch (err) {
            console.error("[useEtfData] Error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "ETF 데이터를 불러오는데 실패했습니다."
            );
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async (date?: string) => {
        await fetchEtfData(date);
    }, [fetchEtfData]);

    return {
        data,
        loading,
        error,
        fetchedAt,
        fetchEtfData,
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