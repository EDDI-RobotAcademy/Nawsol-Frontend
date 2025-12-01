"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AccountResponse } from "@/types/account";
import Image from "next/image";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function MyPage() {
    const [account, setAccount] = useState<AccountResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        nickname: "",
        profile_image: "",
        phone_number: "",
        automatic_analysis_cycle: 0,
        target_period: 0,
        target_amount: 0,
    });
    const [submitting, setSubmitting] = useState(false);
    const [showDepartureDialog, setShowDepartureDialog] = useState(false);
    const { isLoggedIn, depart } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        // 먼저 현재 사용자 정보를 가져오는 API를 시도
        // 만약 이 API가 없다면, authentication/status에서 사용자 정보를 가져오거나
        // 다른 방법을 사용해야 할 수 있습니다.
        const fetchAccountInfo = async () => {
            try {
                setLoading(true);
                setError(null);

                // 방법 1: 세션에서 현재 사용자 정보를 가져오는 API 시도
                let response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/account/me`,
                    {
                        credentials: "include",
                    }
                );
                console.log(response)
                // 404면 다른 방법 시도
                if (response.status === 404) {
                    // 방법 2: authentication/status에서 사용자 정보 가져오기
                    const statusResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/authentication/status`,
                        {
                            credentials: "include",
                        }
                    );
                    const statusData = await statusResponse.json();

                    // status API에서 oauth_type과 oauth_id를 가져올 수 있다면
                    if (statusData.oauth_type && statusData.oauth_id) {
                        response = await fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/account/${statusData.oauth_type}/${statusData.oauth_id}`,
                            {
                                credentials: "include",
                            }
                        );
                    } else {
                        throw new Error("사용자 정보를 가져올 수 없습니다.");
                    }
                }

                if (!response.ok) {
                    throw new Error("계정 정보를 가져오는데 실패했습니다.");
                }

                const data: AccountResponse = await response.json();
                setAccount(data);
                // 편집 폼 초기화
                setEditForm({
                    nickname: data?.nickname ?? "",
                    profile_image: data?.profile_image ?? "",
                    phone_number: data?.phone_number ?? "",
                    automatic_analysis_cycle: data?.automatic_analysis_cycle ?? 0,
                    target_period: data?.target_period ?? 0,
                    target_amount: data?.target_amount ?? 0,
                });
            } catch (err) {
                console.error("[MyPage] Failed to fetch account:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "계정 정보를 불러오는데 실패했습니다."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAccountInfo();
    }, [isLoggedIn, router]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (account) {
            setEditForm({
                nickname: account?.nickname ?? "",
                profile_image: account?.profile_image ?? "",
                phone_number: account?.phone_number ?? "",
                automatic_analysis_cycle: account?.automatic_analysis_cycle ?? 0,
                target_period: account?.target_period ?? 0,
                target_amount: account?.target_amount ?? 0,
            });
        }
        setIsEditing(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return;

        try {
            setSubmitting(true);
            setError(null);

            const payload: {
                nickname: string | null;
                profile_image: string | null;
                phone_number: string | null;
                automatic_analysis_cycle?: number | 0;
                target_period?: number | 0;
                target_amount?: number | 0;
            } = {
                nickname: editForm.nickname || null,
                profile_image: editForm.profile_image || null,
                phone_number: editForm.phone_number || null,
            };

            // 편집 모드에서만 보이는 필드들
            if (editForm.automatic_analysis_cycle) {
                payload.automatic_analysis_cycle = editForm.automatic_analysis_cycle;
            }
            if (editForm.target_period) {
                payload.target_period = editForm.target_period;
            }
            if (editForm.target_amount) {
                payload.target_amount = editForm.target_amount;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/account/${account.session_id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error("계정 정보 수정에 실패했습니다.");
            }

            const updatedData: AccountResponse = await response.json();
            setAccount(updatedData);
            setIsEditing(false);
        } catch (err) {
            console.error("[MyPage] Failed to update account:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "계정 정보 수정에 실패했습니다."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDepartureClick = () => {
        setShowDepartureDialog(true);
    };

    const handleDepartureConfirm = () => {
        setShowDepartureDialog(false);
        depart();
        router.push("/");
    };

    const handleDepartureCancel = () => {
        setShowDepartureDialog(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
                    <p className="text-zinc-600 dark:text-zinc-400">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-black">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-black">
                <p className="text-zinc-600 dark:text-zinc-400">
                    계정 정보를 찾을 수 없습니다.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    {/* 수정 버튼 */}
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-end">
                        {!isEditing ? (
                            <button
                                onClick={handleEdit}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                수정
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                    disabled={submitting}
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                    disabled={submitting}
                                >
                                    {submitting ? "저장 중..." : "저장"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 프로필 헤더 */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="relative w-24 h-24 rounded-full bg-white dark:bg-zinc-800 overflow-hidden border-4 border-white dark:border-zinc-700">
                                {account.profile_image ? (
                                    <Image
                                        src={account.profile_image}
                                        alt={account.nickname || account.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {(account.nickname || account.name || "U").charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {account.nickname || account.name}
                                </h1>
                                {account.nickname && account.name && (
                                    <p className="text-blue-100 text-lg">{account.name}</p>
                                )}
                                <p className="text-blue-100 mt-2">{account.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* 계정 정보 */}
                    <div className="px-6 py-6">
                        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
                            계정 정보
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                        OAuth 타입
                                    </div>
                                    <div className="flex-1 text-black dark:text-zinc-50">
                                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                            {account.oauth_type}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                        OAuth ID
                                    </div>
                                    <div className="flex-1 text-black dark:text-zinc-50 font-mono text-sm">
                                        {account.oauth_id}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                        닉네임
                                    </div>
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.nickname}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, nickname: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="text-black dark:text-zinc-50">
                                                {account.nickname || "-"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                        이름
                                    </div>
                                    <div className="flex-1 text-black dark:text-zinc-50">
                                        {account.name || "-"}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                        이메일
                                    </div>
                                    <div className="flex-1 text-black dark:text-zinc-50">
                                        {account.email || "-"}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                        전화번호
                                    </div>
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.phone_number}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, phone_number: e.target.value })
                                                }
                                                placeholder="전화번호"
                                                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="text-black dark:text-zinc-50">
                                                {account.phone_number || "-"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 편집 모드에서만 보이는 필드들 */}
                                {isEditing && (
                                    <>
                                        <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                                자동 분석 주기
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={editForm.automatic_analysis_cycle}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, automatic_analysis_cycle: parseInt(e.target.value) })
                                                    }
                                                    placeholder="자동 분석 주기"
                                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                                목표 기간
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={editForm.target_period}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, target_period: parseInt(e.target.value) })
                                                    }
                                                    placeholder="목표 기간"
                                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                                목표 금액
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={editForm.target_amount}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, target_amount: parseInt(e.target.value) })
                                                    }
                                                    placeholder="목표 금액"
                                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                            <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                    상태
                                </div>
                                <div className="flex-1">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            account.active_status
                                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                        }`}
                                    >
                                        {account.active_status ? "활성" : "비활성"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                    역할 ID
                                </div>
                                <div className="flex-1 text-black dark:text-zinc-50">
                                    {account.role_id}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
                                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                    가입일
                                </div>
                                <div className="flex-1 text-black dark:text-zinc-50">
                                    {new Date(account.created_at).toLocaleString("ko-KR")}
                                </div>
                            </div>

                                <div className="flex flex-col sm:flex-row sm:items-center pb-4">
                                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:w-32 mb-1 sm:mb-0">
                                        최종 수정일
                                    </div>
                                    <div className="flex-1 text-black dark:text-zinc-50">
                                        {new Date(account.updated_at).toLocaleString("ko-KR")}
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* 회원 탈퇴 버튼 */}
                        {isLoggedIn && (
                            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                                <button
                                    onClick={handleDepartureClick}
                                    className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    회원 탈퇴
                                </button>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                                    회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 회원 탈퇴 확인 다이얼로그 */}
            <ConfirmDialog
                isOpen={showDepartureDialog}
                title="회원 탈퇴"
                message={`정말로 탈퇴하시겠습니까?\n\n탈퇴 시 모든 데이터가 삭제되며,\n이 작업은 되돌릴 수 없습니다.`}
                confirmText="탈퇴"
                cancelText="취소"
                confirmColor="red"
                onConfirm={handleDepartureConfirm}
                onCancel={handleDepartureCancel}
            />
        </div>
    );
}
