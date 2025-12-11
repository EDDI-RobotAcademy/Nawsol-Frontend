import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CreateFinanceRequest } from "@/types/finance";

interface UseSaveBondReturn {
    save: (bondId: number) => Promise<void>;
    loading: boolean;
    error: string | null;
    success: boolean;
}

export const useSaveBond = (): UseSaveBondReturn => {
    const { user, isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const save = async (bondId: number) => {
        if (!isLoggedIn || !user) {
            setError("로그인이 필요합니다.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const requestData: CreateFinanceRequest[] = [
                {
                    user_id: user.session_id,
                    type: "BOND",
                    base_dt: new Date().toISOString(),
                    key: "product_bond_id",
                    value: bondId.toString(),
                },
            ];

            console.log('[useSaveBond] Request data:', requestData);

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

            console.log('[useSaveBond] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    detail: "저장 실패",
                }));
                console.error('[useSaveBond] Error response:', errorData);
                throw new Error(errorData.detail || "저장에 실패했습니다");
            }

            const result = await response.json();
            console.log('[useSaveBond] Success:', result);

            setSuccess(true);
        } catch (err) {
            console.error("[useSaveBond] Failed to save Bond:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "채권 저장에 실패했습니다."
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

