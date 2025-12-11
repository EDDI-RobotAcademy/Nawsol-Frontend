"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveBond } from "@/hooks/useSaveBond";
import { BondDisplayItem } from "@/types/bond";
import { formatNumber, formatDate } from "@/utils/etfUtils";

export default function BondDetailPage() {
    const router = useRouter();
    const params = useParams();
    const bondIdParam = params.id as string;
    const bondId = bondIdParam;

    const { user, isLoggedIn, login } = useAuth();
    const [bondData, setBondData] = useState<BondDisplayItem | null>(null);

    const { save, loading: isSaving, error: saveError, success: isSaved } = useSaveBond();

    useEffect(() => {
        // localStorage에서 데이터 가져오기
        const cachedData = localStorage.getItem(`bond_${bondId}`);

        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                setBondData(parsed);
            } catch (error) {
                alert('채권 데이터를 불러올 수 없습니다. 목록으로 돌아갑니다.');
                router.push('/bond');
            }
        } else {
            alert('채권 데이터를 찾을 수 없습니다. 목록으로 돌아갑니다.');
            router.push('/bond');
        }
    }, [bondId, router]);

    // ISO 날짜를 YYYYMMDD 형식으로 변환
    const formatDateString = (dateStr: string | null): string => {
        if (!dateStr) return "-";
        try {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return formatDate(`${year}${month}${day}`);
        } catch {
            return dateStr;
        }
    };

    const handleSaveBond = async () => {
        if (!bondData) return;

        if (!isLoggedIn) {
            if (confirm("로그인이 필요합니다. 로그인 하시겠습니까?")) {
                login();
            }
            return;
        }

        await save(bondData.id);
    };

    if (!bondData) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400 mx-auto mb-4"></div>
                    <p className="text-zinc-600 dark:text-zinc-400">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* 뒤로가기 & 사용자 정보 */}
                <div className="mb-4 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/bond')}
                        className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        목록으로
                    </button>

                    {isLoggedIn && user && (
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            {user.profile_image && (
                                <img
                                    src={user.profile_image}
                                    alt={user.name}
                                    className="w-6 h-6 rounded-full"
                                />
                            )}
                            <span>{user.nickname || user.name}</span>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-6">
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {bondData.isinCdNm || bondData.bondIsurNm || "채권 정보"}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-green-100">
                            <div>
                                <span className="text-sm opacity-80">표면이자율</span>
                                <p className="text-xl font-bold text-white">
                                    {bondData.bondSrfcInrt !== null ? `${formatNumber(bondData.bondSrfcInrt)}%` : "-"}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm opacity-80">발행금액</span>
                                <p className="text-xl font-bold text-white">
                                    {bondData.bondIssuAmt ? formatNumber(bondData.bondIssuAmt) : "-"}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm opacity-80">발행통화</span>
                                <p className="text-xl font-bold text-white">
                                    {bondData.bondIssuCurCdNm || bondData.bondIssuCurCd || "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 상세 정보 */}
                    <div className="px-6 py-8 border-b border-zinc-200 dark:border-zinc-700">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                            상세 정보
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem label="기준일자" value={formatDateString(bondData.basDt)} />
                            <InfoItem label="채권발행자명" value={bondData.bondIsurNm || "-"} />
                            <InfoItem label="ISIN코드" value={bondData.isinCd || "-"} />
                            <InfoItem label="ISIN코드명" value={bondData.isinCdNm || "-"} />
                            <InfoItem label="유가증권종목코드" value={bondData.scrsItmsKcd || "-"} />
                            <InfoItem label="유가증권종목코드명" value={bondData.scrsItmsKcdNm || "-"} />
                            <InfoItem label="채권발행일" value={formatDateString(bondData.bondIssuDt)} />
                            <InfoItem label="채권만기일" value={formatDateString(bondData.bondExprDt)} />
                            <InfoItem label="채권발행형태명" value={bondData.bondIssuFrmtNm || "-"} />
                            <InfoItem label="발행통화코드" value={bondData.bondIssuCurCd || "-"} />
                            <InfoItem label="발행통화명" value={bondData.bondIssuCurCdNm || "-"} />
                            <InfoItem label="발행금액" value={bondData.bondIssuAmt ? formatNumber(bondData.bondIssuAmt) : "-"} />
                            <InfoItem label="채권상환금액" value={bondData.bondPymtAmt ? formatNumber(bondData.bondPymtAmt) : "-"} />
                            <InfoItem label="표면이자율" value={bondData.bondSrfcInrt !== null ? `${formatNumber(bondData.bondSrfcInrt)}%` : "-"} />
                            <InfoItem label="이자율변동구분코드" value={bondData.irtChngDcd || "-"} />
                            <InfoItem label="이자율변동구분명" value={bondData.irtChngDcdNm || "-"} />
                            <InfoItem label="채권이자유형코드" value={bondData.bondIntTcd || "-"} />
                            <InfoItem label="채권이자유형명" value={bondData.bondIntTcdNm || "-"} />
                            <InfoItem label="법인등록번호" value={bondData.crno || "-"} />
                        </div>
                    </div>

                    {/* 관심 상품 등록 버튼 */}
                    <div className="px-6 py-6 bg-zinc-50 dark:bg-zinc-800">
                        {!isLoggedIn ? (
                            <div className="text-center">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                                    관심 상품 등록은 로그인이 필요합니다
                                </p>
                                <button
                                    onClick={login}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                                >
                                    🔐 Google 로그인
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleSaveBond}
                                    disabled={isSaving || isSaved}
                                    className={`
                                        w-full py-3 px-6 rounded-lg font-semibold transition-colors
                                        ${isSaved
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-default"
                                        : "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
                                    }
                                    `}
                                >
                                    {isSaving ? (
                                        "저장 중..."
                                    ) : isSaved ? (
                                        "✅ 등록 완료"
                                    ) : (
                                        "⭐ 관심 상품으로 등록하기"
                                    )}
                                </button>

                                {saveError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                                        {saveError}
                                    </p>
                                )}

                                {isSaved && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                                        ✨ 관심 상품으로 등록되었습니다!
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-700">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{value}</span>
        </div>
    );
}

