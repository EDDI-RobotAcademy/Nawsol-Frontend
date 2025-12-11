import { useState, useCallback } from "react";
import { apiFetch } from "@/utils/api";
import { BondApiResponse, BondDisplayItem } from "@/types/bond";

interface UseBondDataReturn {
    data: BondDisplayItem[] | null;
    loading: boolean;
    error: string | null;
    fetchedAt: string | null;
    fetchBondData: (date?: string) => Promise<void>;
    refetch: (date?: string) => Promise<void>;
}

export const useBondData = (): UseBondDataReturn => {
    const [data, setData] = useState<BondDisplayItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);

    const fetchBondData = useCallback(async (date?: string) => {
        try {
            setLoading(true);
            setError(null);

            const targetDate = date || getTodayDate();

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/bond/${targetDate}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            console.log('[useBondData] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    detail: "채권 데이터 조회 실패"
                }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 조회 실패`);
            }

            const result: BondApiResponse = await response.json();
            console.log('[useBondData] API Response:', result);
            console.log('[useBondData] Items count:', result.length);

            // Array인지 확인
            if (!Array.isArray(result)) {
                console.error('[useBondData] Response is not an array:', typeof result);
                throw new Error('API 응답 형식이 올바르지 않습니다. 배열이 아닙니다.');
            }

            // 데이터 가공
            const displayItems: BondDisplayItem[] = result.map((item, index) => ({
                ...item,
                displayId: `${item.basDt}-${item.isinCd || item.id}-${index}`,
            }));

            console.log('[useBondData] Display items created:', displayItems.length);

            setData(displayItems);
            setFetchedAt(new Date().toISOString());  // 현재 시간 사용

            console.log('[useBondData] Success');

        } catch (err) {
            console.error("[useBondData] Error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "채권 데이터를 불러오는데 실패했습니다."
            );
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async (date?: string) => {
        await fetchBondData(date);
    }, [fetchBondData]);

    return {
        data,
        loading,
        error,
        fetchedAt,
        fetchBondData,
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

