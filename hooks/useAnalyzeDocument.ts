"use client";

import { useState } from "react";

// 쿠키 설정 헬퍼 함수
function setCookie(name: string, value: string, days: number = 1) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function useAnalyzeDocument() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function analyzeDocument(file: File, type: "income" | "expense") {
        setLoading(true);
        setError(null);

        try {
            const form = new FormData();
            form.append("file", file);
            form.append("type_of_doc", type);

            // 쿠키에서 CSRF 토큰 읽기
            const csrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrf_token="))
            ?.split("=")[1];

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents-multi-agents/analyze`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                    "X-CSRF-Token": csrfToken || "",
                    },
                    body: form,
                }
            );

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.detail || "분석 실패");
            }

            const result = await res.json();
            
            // session_id를 localStorage와 쿠키에 모두 저장
            if (result.session_id) {
                localStorage.setItem("session_id", result.session_id);
                setCookie("session_id", result.session_id, 1);
                console.log("[DEBUG] Session ID saved:", result.session_id);
            }

            return result;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function analyzeForm(data: Record<string, string>, type: "income" | "expense") {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents-multi-agents/analyze_form`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ document_type: type, data }),
                }
            );

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.detail || d.message || "저장 실패");
            }

            const result = await res.json();
            
            // session_id를 localStorage와 쿠키에 모두 저장
            if (result.session_id) {
                localStorage.setItem("session_id", result.session_id);
                setCookie("session_id", result.session_id, 1);
                console.log("[DEBUG] Session ID saved:", result.session_id);
            }

            return result;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return { analyzeDocument, analyzeForm, loading, error };
}
