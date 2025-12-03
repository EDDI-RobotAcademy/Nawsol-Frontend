"use client";

import { useRouter } from "next/navigation";

export default function Error500Page() {
    const router = useRouter();

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleGoToHome = () => {
        router.push("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-orange-100 mb-4">
                        <svg
                            className="h-12 w-12 text-orange-600"
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
                        500 Internal Server Error
                    </h1>
                    <p className="text-gray-600 mb-1">
                        서버 오류 또는 네트워크 오류가 발생했습니다
                    </p>
                    <p className="text-sm text-gray-500">
                        일시적인 문제일 수 있습니다. 네트워크 연결을 확인하고 잠시 후 다시 시도해주세요.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleRefresh}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        새로고침
                    </button>
                    <button
                        onClick={handleGoToHome}
                        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                        홈으로 이동
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-6">
                    문제가 지속되면 고객센터로 문의해주세요.
                </p>
            </div>
        </div>
    );
}

