"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error401Page() {
    const router = useRouter();

    useEffect(() => {
        // 5초 후 자동으로 로그인 페이지로 리다이렉트
        const timer = setTimeout(() => {
            router.push("/login");
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    const handleGoToLogin = () => {
        router.push("/login");
    };

    const handleGoToHome = () => {
        router.push("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
                        <svg
                            className="h-12 w-12 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        401 Unauthorized
                    </h1>
                    <p className="text-gray-600 mb-1">
                        인증이 필요합니다
                    </p>
                    <p className="text-sm text-gray-500">
                        로그인이 만료되었거나 유효하지 않은 세션입니다.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleGoToLogin}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        로그인 페이지로 이동
                    </button>
                    <button
                        onClick={handleGoToHome}
                        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                        홈으로 이동
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-6">
                    5초 후 자동으로 로그인 페이지로 이동합니다.
                </p>
            </div>
        </div>
    );
}

