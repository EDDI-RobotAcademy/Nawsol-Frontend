"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { isLoggedIn, logout } = useAuth();
    const router = useRouter();
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isMobileAnalysisOpen, setIsMobileAnalysisOpen] = useState(false);
    const [isVisualizeOpen, setIsVisualizeOpen] = useState(false);
    const [isMobileVisualizeOpen, setIsMobileVisualizeOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const handleSessionOut = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account/session_out`,
            {method: "DELETE",
                credentials: "include"
            }).then(r => r);
        router.push("/");
    };

    return (
        <nav className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* 로고 */}
                    <div className="flex-shrink-0">
                        <Link 
                            href="/" 
                            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all duration-200"
                        >
                            MyApp
                        </Link>
                    </div>

                    {/* 네비게이션 링크 */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link
                            href="/flow" 
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-blue-600 hover:shadow-md transition-all duration-200 hover:scale-105"
                        >
                            📤 Upload
                        </Link>

                        {/* 자료 분석 드롭다운 */}
                        <div 
                            className="relative"
                            onMouseEnter={() => setIsAnalysisOpen(true)}
                            onMouseLeave={() => setIsAnalysisOpen(false)}
                        >
                            <button
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-purple-600 hover:shadow-md transition-all duration-200 hover:scale-105 flex items-center gap-1"
                            >
                                📊 자료 분석
                                <span className={`transition-transform duration-200 ${isAnalysisOpen ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>
                            
                            {isAnalysisOpen && (
                                <div className="absolute top-[calc(100%-2px)] left-0 w-56 z-50">
                                    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                                        <div className="pt-1">
                                            <Link
                                                href="/assets_simulation"
                                                className="block px-4 py-3 text-sm hover:bg-purple-600 transition-colors duration-200"
                                            >
                                                💰 미래 자산 예측
                                            </Link>
                                        </div>
                                        <Link
                                            href="/tax_credit"
                                            className="block px-4 py-3 text-sm hover:bg-green-600 transition-colors duration-200 border-t border-gray-700"
                                        >
                                            📋 세액 공제 확인
                                        </Link>
                                        <Link
                                            href="/deduction_expectation"
                                            className="block px-4 py-3 text-sm hover:bg-green-600 transition-colors duration-200 border-t border-gray-700"
                                        >
                                            💸 연말정산 공제 내역 확인
                                        </Link>
                                        <Link
                                            href="/financial_guide"
                                            className="block px-4 py-3 text-sm hover:bg-green-600 transition-colors duration-200 border-t border-gray-700"
                                        >
                                            🤓 목표 금액 재무 가이드
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div 
                            className="relative"
                            onMouseEnter={() => setIsVisualizeOpen(true)}
                            onMouseLeave={() => setIsVisualizeOpen(false)}
                        >
                            <button
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-purple-600 hover:shadow-md transition-all duration-200 hover:scale-105 flex items-center gap-1"
                            >
                                📈 시각화 자료
                                <span className={`transition-transform duration-200 ${isVisualizeOpen ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>
                            
                            {isVisualizeOpen && (
                                <div className="absolute top-[calc(100%-2px)] left-0 w-56 z-50">
                                    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                                        <div className="pt-1">
                                            <Link
                                                href="/piechart"
                                                className="block px-4 py-3 text-sm hover:bg-purple-600 transition-colors duration-200"
                                            >
                                                🥧 파이 차트
                                            </Link>
                                        </div>
                                        <Link
                                            href="/hitmap"
                                            className="block px-4 py-3 text-sm hover:bg-green-600 transition-colors duration-200 border-t border-gray-700"
                                        >
                                            🔥 월별 지출 히트맵
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <Link 
                            href="/myPage" 
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-indigo-600 hover:shadow-md transition-all duration-200 hover:scale-105"
                        >
                            👤 MyPage
                        </Link>
                    </div>

                    {/* 인증 버튼 */}
                    <div className="flex items-center space-x-2">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                🚪 Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                🔐 Login
                            </Link>
                        )}
                        <button
                            onClick={handleSessionOut}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            🚪 세션 삭제
                        </button>
                    </div>
                </div>

                {/* 모바일 메뉴 */}
                <div className="md:hidden pb-4 space-y-2">
                    <Link
                        href="/flow"
                        className="block px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-blue-600 transition-all duration-200"
                    >
                        📤 Upload
                    </Link>

                    {/* 모바일 자료 분석 드롭다운 */}
                    <div>
                        <button
                            onClick={() => setIsMobileAnalysisOpen(!isMobileAnalysisOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-purple-600 transition-all duration-200"
                        >
                            <span>📊 자료 분석</span>
                            <span className={`transition-transform duration-200 ${isMobileAnalysisOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        {isMobileAnalysisOpen && (
                            <div className="mt-2 ml-4 space-y-2">
                                <Link
                                    href="/assets_simulation"
                                    className="block px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-purple-600 transition-all duration-200"
                                    onClick={() => setIsMobileAnalysisOpen(false)}
                                >
                                    💰 미래 자산 예측
                                </Link>
                                <Link
                                    href="/tax_credit"
                                    className="block px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-green-600 transition-all duration-200"
                                    onClick={() => setIsMobileAnalysisOpen(false)}
                                >
                                    📋 세액 공제 확인
                                </Link>
                                <Link
                                    href="/deduction_expectation"
                                    className="block px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-green-600 transition-all duration-200"
                                    onClick={() => setIsMobileAnalysisOpen(false)}
                                >
                                    💸 연말정산 공제 내역 확인
                                </Link>
                                <Link
                                    href="/financial_guide"
                                    className="block px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-green-600 transition-all duration-200"
                                    onClick={() => setIsMobileAnalysisOpen(false)}
                                >
                                    🤓 목표 금액 재무 가이드
                                </Link>
                            </div>
                        )}
                    </div>
                    
                    {/* 모바일 시각화 자료 드롭다운 */}
                    <div>
                        <button
                            onClick={() => setIsMobileVisualizeOpen(!isMobileVisualizeOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-purple-600 transition-all duration-200"
                        >
                            <span>📈 시각화 자료</span>
                            <span className={`transition-transform duration-200 ${isMobileVisualizeOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        {isMobileVisualizeOpen && (
                            <div className="mt-2 ml-4 space-y-2">
                                <Link
                                    href="/piechart"
                                    className="block px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-purple-600 transition-all duration-200"
                                    onClick={() => setIsMobileVisualizeOpen(false)}
                                >
                                    🥧 파이 차트
                                </Link>
                                <Link
                                    href="/hitmap"
                                    className="block px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-green-600 transition-all duration-200"
                                    onClick={() => setIsMobileVisualizeOpen(false)}
                                >
                                    🔥 월별 지출 히트맵
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link 
                        href="/myPage" 
                        className="block px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 hover:bg-indigo-600 transition-all duration-200"
                    >
                        👤 MyPage
                    </Link>
                </div>
            </div>
        </nav>
    );
}
