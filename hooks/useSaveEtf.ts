import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CreateFinanceRequest } from "@/types/finance";

interface UseSaveEtfReturn {
    save: (etfId: number) => Promise<void>;
    loading: boolean;
    error: string | null;
    success: boolean;
}

export const useSaveEtf = (): UseSaveEtfReturn => {
    const { user, isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const save = async (etfId: number) => {
        if (!isLoggedIn || !user) {
            setError("로그인이 필요합니다.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);  // ← 재시도 시 초기화

            const requestData: CreateFinanceRequest[] = [
                {
                    user_id: user.session_id,
                    type: "ETF",
                    base_dt: new Date().toISOString(),
                    key: "product_etf_id",
                    value: etfId.toString(),  // ← number를 string으로 변환
                },
            ];

            console.log('[useSaveEtf] Request data:', requestData);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/finance`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(requestData),
                }
            );

            console.log('[useSaveEtf] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    detail: "저장 실패",
                }));
                console.error('[useSaveEtf] Error response:', errorData);
                throw new Error(errorData.detail || "저장에 실패했습니다");
            }

            const result = await response.json();
            console.log('[useSaveEtf] Success:', result);

            setSuccess(true);
        } catch (err) {
            console.error("[useSaveEtf] Failed to save ETF:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "ETF 저장에 실패했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        save,
        loading,
        error,
        success,
    };
};