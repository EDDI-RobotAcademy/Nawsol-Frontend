"use client";

import { useState, useEffect } from "react";
import { useAnalyzeDocument } from "@/hooks/useAnalyzeDocument";
import StepActions from "@/components/step/StepActions";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/common/ConfirmDialog";

// 쿠키 설정 헬퍼 함수
function setCookie(name: string, value: string, days: number = 1) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export default function ExpensePage() {
    const router = useRouter();
    const { analyzeDocument, analyzeForm } = useAnalyzeDocument();

    // 페이지 로드 시 기존 session_id를 쿠키로 복원
    useEffect(() => {
        const savedSessionId = localStorage.getItem("session_id");
        if (savedSessionId) {
            setCookie("session_id", savedSessionId, 1);
            console.log("[DEBUG] Restored session_id to cookie:", savedSessionId);
        }
    }, []);

    // 기본 제공 필드
    const [defaultFields, setDefaultFields] = useState<Record<string, string>>({
        교통비: "",
        식비: "",
        통신비: "",
    });

    // 사용자가 직접 추가한 필드
    const [customFields, setCustomFields] = useState<
        { id: string; key: string; value: string }[]
    >([]);

    const [file, setFile] = useState<File | null>(null);
    const [inputMethod, setInputMethod] = useState<"upload" | "manual">("upload");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");

    // 다이얼로그 상태
    const [dialog, setDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "info";
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    // 기본 필드 변경
    const updateDefaultField = (key: string, value: string) => {
        setDefaultFields((prev) => ({ ...prev, [key]: value }));
    };

    // 사용자 정의 필드 변경
    const updateCustomField = (id: string, key: string, value: string) => {
        setCustomFields((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            )
        );
    };

    // 사용자 정의 필드 추가
    const addCustomField = () => {
        setCustomFields((prev) => [
            ...prev,
            { id: crypto.randomUUID(), key: "", value: "" },
        ]);
    };

    // 사용자 정의 필드 삭제
    const removeCustomField = (id: string) => {
        setCustomFields((prev) => prev.filter((item) => item.id !== id));
    };

    async function handleNext() {
        setError("");

        // 입력 방식에 따른 유효성 검사
        if (inputMethod === "upload") {
            if (!file) {
                setError("PDF 파일을 업로드해주세요.");
                return;
            }
        } else {
            // 기본 필드 + 커스텀 필드 중 하나라도 입력되었는지 확인
            const hasDefaultInput = Object.values(defaultFields).some(
                (value) => value.trim() !== ""
            );
            const hasCustomInput = customFields.some(
                (field) => field.key.trim() !== "" || field.value.trim() !== ""
            );

            if (!hasDefaultInput && !hasCustomInput) {
                setError("최소 하나 이상의 항목을 입력해주세요.");
                return;
            }
        }

        setIsLoading(true);

        try {
            if (inputMethod === "manual") {
                // 기본 필드 + 커스텀 필드를 하나의 객체로 조합
                const merged = {
                    ...defaultFields,
                };

                customFields.forEach((field) => {
                    if (field.key.trim()) {
                        merged[field.key] = field.value;
                    }
                });

                await analyzeForm(merged, "expense");

                setDialog({
                    isOpen: true,
                    title: "저장 완료",
                    message: "지출 자료가 성공적으로 저장되었습니다.",
                    type: "success",
                    onConfirm: () => {
                        setDialog({ ...dialog, isOpen: false });
                        router.push("/flow/result");
                    },
                });
            } else {
                await analyzeDocument(file!, "expense");
                router.push("/flow/result");
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "알 수 없는 오류가 발생했습니다.";
            setError(errorMessage);
            setDialog({
                isOpen: true,
                title: "오류 발생",
                message: errorMessage,
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4 px-6 py-3">
           {/* 헤더 섹션 */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    지출 자료 입력
                </h2>
                <p className="text-gray-600">
                    지출 관련 PDF를 업로드하거나 직접 입력하세요.
                </p>
            </div>

            {/* 보안 안내 문구 */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
                <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
                <p className="text-sm">
                    업로드된 자료는 보안을 위해 최대 24시간 암호화되어 관리되며, 서버에 저장되지 않습니다.
                </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            {/* 입력 방식 선택 */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => {
                        setInputMethod("upload");
                        setError(""); // 탭 전환 시 에러 초기화
                    }}
                    className={`px-4 py-2 font-medium transition-colors ${
                        inputMethod === "upload"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    PDF 업로드
                </button>

                <button
                    onClick={() => {
                        setInputMethod("manual");
                        setError(""); // 탭 전환 시 에러 초기화
                    }}
                    className={`px-4 py-2 font-medium transition-colors ${
                        inputMethod === "manual"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    직접 입력
                </button>
            </div>

            {/* 컨텐츠 카드 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* PDF 업로드 */}
                {inputMethod === "upload" && (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="expense-upload"
                            />

                            <label
                                htmlFor="expense-upload"
                                className="cursor-pointer flex flex-col items-center gap-3"
                            >
                                <svg
                                    className="w-12 h-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>

                                {file ? (
                                    <div className="space-y-1">
                                        <span className="text-gray-700 font-medium">
                                            {file.name}
                                        </span>
                                        <p className="text-sm text-gray-500">
                                            클릭하여 다른 파일 선택
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <span className="text-gray-700 font-medium">
                                            파일을 선택하거나 드래그하세요
                                        </span>
                                        <p className="text-sm text-gray-500">
                                            PDF 파일만 가능
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                )}

                {/* 직접 입력 */}
                {inputMethod === "manual" && (
                    <div className="space-y-6">
                        {/* 기본 필드 */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                기본 지출 항목
                            </h3>
                            <div className="space-y-3">
                                {Object.keys(defaultFields).map((key) => (
                                    <div key={key} className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {key}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={defaultFields[key]}
                                                onChange={(e) =>
                                                    updateDefaultField(key, e.target.value)
                                                }
                                                placeholder="금액을 입력하세요"
                                                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                                원
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 구분선 */}
                        <div className="border-t border-gray-200"></div>

                        {/* 사용자 추가 필드 */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900">
                                사용자 정의 항목
                            </h3>

                            {customFields.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm">추가 항목이 없습니다</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {customFields.map((field) => (
                                        <div key={field.id} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                                placeholder="항목명 (예: 주거비)"
                                                value={field.key}
                                                onChange={(e) =>
                                                    updateCustomField(field.id, "key", e.target.value)
                                                }
                                            />
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                                                    placeholder="금액을 입력하세요"
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        updateCustomField(field.id, "value", e.target.value)
                                                    }
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                                    원
                                                </span>
                                            </div>
                                            <button
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded transition-colors"
                                                onClick={() => removeCustomField(field.id)}
                                                title="삭제"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                onClick={addCustomField}
                            >
                                + 항목 추가
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <StepActions
                onPrev={() => router.push("/flow/income")}
                onNext={handleNext}
                nextLabel={isLoading ? "처리 중..." : "다음 단계로"}
                nextDisabled={isLoading}
                onSkip={() => router.push("/flow/result")}
            />

            {/* 확인 다이얼로그 */}
            <ConfirmDialog
                isOpen={dialog.isOpen}
                title={dialog.title}
                message={dialog.message}
                confirmText="확인"
                cancelText="닫기"
                confirmColor={
                    dialog.type === "success"
                        ? "green"
                        : dialog.type === "error"
                            ? "red"
                            : "blue"
                }
                onConfirm={() => {
                    if (dialog.onConfirm) {
                        dialog.onConfirm();
                    } else {
                        setDialog({ ...dialog, isOpen: false });
                    }
                }}
                onCancel={() => setDialog({ ...dialog, isOpen: false })}
            />
        </div>
    );
}