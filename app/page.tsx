"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
    const { isLoggedIn } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50 to-purple-50 dark:from-black dark:via-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        스마트한 재무 관리,
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            한눈에 파악하세요
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        AI 기반 문서 분석으로 소득과 지출을 자동으로 분석하고,
                        <br />
                        미래 자산 시뮬레이션과 세액 공제까지 한 번에 관리하세요.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {isLoggedIn ? (
                            <>
                                <Link
                                    href="/flow"
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    📤 문서 업로드 시작하기
                                </Link>
                                <Link
                                    href="/assets_simulation"
                                    className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-semibold text-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 hover:scale-105 shadow-md"
                                >
                                    💰 미래 자산 예측 보기
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    🔐 로그인하고 시작하기
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                    주요 기능
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Feature 1 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-700">
                        <div className="text-4xl mb-4">📄</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            문서 자동 분석
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            원천징수영수증, 지출 증빙서류를 PDF로 업로드하면
                            AI가 자동으로 분석합니다.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-700">
                        <div className="text-4xl mb-4">💰</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            미래 자산 시뮬레이션
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            현재 소득을 기반으로 10%, 20% 증가 시나리오에 대한
                            자산 분배 전략을 제공합니다.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-700">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            세액 공제 확인
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            연금저축, ISA 등 다양한 절세 상품을 활용한
                            세액 공제 가능 여부를 확인하세요.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-700">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            재무 컨설팅
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            한국의 비슷한 소득 수준 데이터를 기반으로
                            맞춤형 재무 포트폴리오를 제안합니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-gray-800 rounded-2xl mx-4 mb-16">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                    사용 방법
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            문서 업로드
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            소득 및 지출 관련 PDF 문서를 업로드하세요.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            AI 자동 분석
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            AI가 문서를 분석하여 소득과 지출을 자동으로 추출합니다.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            결과 확인
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            미래 자산 시뮬레이션과 세액 공제 정보를 확인하세요.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        지금 시작하세요
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        무료로 재무 관리를 시작하고, 스마트한 자산 관리를 경험해보세요.
                    </p>
                    {!isLoggedIn && (
                        <Link
                            href="/login"
                            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            무료로 시작하기 →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
