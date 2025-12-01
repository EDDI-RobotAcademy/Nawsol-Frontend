"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import TaxCreditHeader from "../../components/tax-credit/TaxCreditHeader";
import TaxCreditTabs from "../../components/tax-credit/TaxCreditTabs";
import TaxCreditContent from "../../components/tax-credit/TaxCreditContent";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TaxCreditPage() {
    const [activeTab, setActiveTab] = useState<"detail" | "checklist">("detail");
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    // API 요청 취소를 위한 AbortController ref
    const abortControllerRef = useRef<AbortController | null>(null);
    // 첫 마운트 여부 체크
    const isFirstMountRef = useRef(true);

    useEffect(() => {
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
                setResult(null); // 이전 결과 초기화

                const endpoint =
                    activeTab === "checklist"
                        ? "/documents-multi-agents/tax-credit/checklist"
                        : "/documents-multi-agents/tax-credit";

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
                    {
                        credentials: "include",
                        signal: abortController.signal // 취소 시그널 전달
                    }
                );

                if (!response.ok) {
                    const err = await response.json().catch(() => null);
                    throw new Error(err?.detail || "분석 실패");
                }

                const data = await response.json();

                // 요청이 취소되지 않았을 때만 결과 업데이트
                if (!abortController.signal.aborted) {
                    setResult(data);
                    setError(null);
                }

            } catch (e: any) {
                // AbortError는 무시 (정상적인 취소)
                if (e.name === 'AbortError') {
                    return;
                }

                if (!abortController.signal.aborted) {
                    setError(e.message || "분석 실패");
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
    }, [activeTab]);

    const handleTabChange = (tab: "detail" | "checklist") => {
        setActiveTab(tab);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    <TaxCreditHeader />
                    <TaxCreditTabs activeTab={activeTab} onTabChange={handleTabChange} />
                    <TaxCreditContent
                        loading={loading}
                        error={error}
                        result={result}
                        activeTab={activeTab}
                    />
                </div>
            </div>
        </div>
    );
}