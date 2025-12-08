import { useState, useCallback } from "react";
import { apiFetch } from "@/utils/api";
import { EtfApiResponse, EtfDisplayItem } from "@/types/etf";

interface UseEtfDataReturn {
    data: EtfDisplayItem[] | null;
    loading: boolean;
    error: string | null;
    fetchedAt: string | null;
    fetchEtfData: () => Promise<void>;
    refetch: () => Promise<void>;
}

export const useEtfData = (): UseEtfDataReturn => {
    const [data, setData] = useState<EtfDisplayItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);

    const fetchEtfData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/etf`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    detail: "ETF 데이터 조회 실패"
                }));
                throw new Error(errorData.detail || `HTTP ${response.status}: 조회 실패`);
            }

            const result: EtfApiResponse = await response.json();

            // 데이터 가공: 고유 ID 추가 및 Display 형식으로 변환
            const displayItems: EtfDisplayItem[] = result.items.map((item, index) => ({
                ...item,
                id: `${item.basDt}-${item.bssIdxIdxNm}-${index}`,
            }));

            setData(displayItems);
            setFetchedAt(result.fetched_at);
        } catch (err) {
            console.error("[useEtfData] Failed to fetch ETF data:", err);
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

    const refetch = useCallback(async () => {
        await fetchEtfData();
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