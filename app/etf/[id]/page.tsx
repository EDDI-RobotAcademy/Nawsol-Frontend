"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveEtf } from "@/hooks/useSaveEtf";
import { EtfDisplayItem } from "@/types/etf";
import { formatNumber, formatDate, getChangeColorClass } from "@/utils/etfUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EtfDetailPage() {
    const router = useRouter();
    const params = useParams();
    const etfIdParam = params.id as string;
    const etfId = etfIdParam;

    const { user, isLoggedIn, login } = useAuth();
    const [etfData, setEtfData] = useState<EtfDisplayItem | null>(null);

    const { save, loading: isSaving, error: saveError, success: isSaved } = useSaveEtf();

    useEffect(() => {
        // localStorage에서 데이터 가져오기
        const cachedData = localStorage.getItem(`etf_${etfId}`);

        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                setEtfData(parsed);
            } catch (error) {
                alert('ETF 데이터를 불러올 수 없습니다. 목록으로 돌아갑니다.');
                router.push('/etf');
            }
        } else {
            alert('ETF 데이터를 찾을 수 없습니다. 목록으로 돌아갑니다.');
            router.push('/etf');
        }
    }, [etfId, router]);

    const generateChartData = () => {
        if (!etfData) return [];
        const basePrice = etfData.clpr;
        const dates = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            const randomChange = (Math.random() - 0.5) * 200;
            const price = basePrice + randomChange;

            dates.push({
                date: dateStr,
                price: Math.round(price),
            });
        }
        return dates;
    };

    const handleSaveEtf = async () => {
        if (!etfData) return;

        if (!isLoggedIn) {
            if (confirm("로그인이 필요합니다. 로그인 하시겠습니까?")) {
                login();
            }
            return;
        }

        await save(etfData.id);
    };

    if (!etfData) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400 mx-auto mb-4"></div>
                    <p className="text-zinc-600 dark:text-zinc-400">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    const chartData = generateChartData();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* 뒤로가기 & 사용자 정보 */}
                <div className="mb-4 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/etf')}
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
                            {etfData.bssIdxIdxNm}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-green-100">
                            <div>
                                <span className="text-sm opacity-80">현재가</span>
                                <p className="text-xl font-bold text-white">
                                    {formatNumber(etfData.clpr)}원
                                </p>
                            </div>
                            <div>
                                <span className="text-sm opacity-80">등락률</span>
                                <p className={`text-xl font-bold ${getChangeColorClass(etfData.fltRt)}`}>
                                    {formatNumber(etfData.fltRt) + "%"}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm opacity-80">거래량</span>
                                <p className="text-xl font-bold text-white">
                                    {formatNumber(etfData.trqu)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 차트 영역 */}
                    <div className="px-6 py-8 border-b border-zinc-200 dark:border-zinc-700">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                            📈 최근 7일 등락 그래프
                        </h2>
                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                                * 더미 데이터입니다. 실제 히스토리 API 연동 필요
                            </p>
                        </div>
                    </div>

                    {/* 상세 정보 */}
                    <div className="px-6 py-8 border-b border-zinc-200 dark:border-zinc-700">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                            상세 정보
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem label="기준일자" value={formatDate(etfData.basDt)} />
                            <InfoItem label="종가" value={`${formatNumber(etfData.clpr)}원`} />
                            <InfoItem label="대비" value={formatNumber(etfData.vs)} />
                            <InfoItem label="시가" value={`${formatNumber(etfData.mkp)}원`} />
                            <InfoItem label="고가" value={`${formatNumber(etfData.hipr)}원`} />
                            <InfoItem label="저가" value={`${formatNumber(etfData.lopr)}원`} />
                            <InfoItem label="거래대금" value={`${formatNumber(etfData.trPrc)}원`} />
                            <InfoItem label="NAV" value={formatNumber(etfData.nav)} />
                            <InfoItem label="시가총액" value={`${formatNumber(etfData.mrktTotAmt)}원`} />
                            <InfoItem label="순자산총액" value={`${formatNumber(etfData.nPptTotAmt)}원`} />
                            <InfoItem label="상장주식수" value={formatNumber(etfData.stLstgCnt)} />
                            <InfoItem label="기초지수종가" value={formatNumber(etfData.bssIdxClpr)} />
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
                                    onClick={handleSaveEtf}
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