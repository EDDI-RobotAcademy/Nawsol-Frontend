"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface FinancialSummary {
  total_income: number;
  total_expense: number;
  surplus: number;
  surplus_ratio: number;
}

interface RecommendationResponse {
  success: boolean;
  data_source?: string;
  financial_summary?: FinancialSummary;
  investment_profile?: {
    risk_tolerance: string;
    investment_period: string;
  };
  recommendation?: string;
  available_etf_count?: number;
  message?: string;
}

export default function ETFRecommendationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [riskTolerance, setRiskTolerance] = useState("medium");
  const [investmentPeriod, setInvestmentPeriod] = useState("mid_term");

  // 재무 요약 정보 조회
  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  const fetchFinancialSummary = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/etf-recommendation/financial-summary`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        setFinancialData({
          total_income: data.data.total_income,
          total_expense: data.data.total_expense,
          surplus: data.data.surplus,
          surplus_ratio: data.data.surplus_ratio,
        });
      }
    } catch (error) {
      console.error("Failed to fetch financial summary:", error);
    }
  };

  const getRecommendation = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/etf-recommendation/recommend?risk_tolerance=${riskTolerance}&investment_period=${investmentPeriod}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      setRecommendation(data);

      if (!data.success) {
        alert(data.message || "ETF 추천을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to get recommendation:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 AI ETF 추천
          </h1>
          <p className="text-gray-600 text-lg">
            나만의 맞춤형 ETF 투자 전략을 AI가 제안합니다
          </p>
        </motion.div>

        {/* 재무 요약 카드 */}
        {financialData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              💰 나의 재무 현황
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">월 소득</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(financialData.total_income)}원
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">월 지출</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(financialData.total_expense)}원
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">여유자금</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(financialData.surplus)}원
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">저축률</p>
                <p className="text-2xl font-bold text-purple-600">
                  {financialData.surplus_ratio.toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 투자 성향 선택 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            🎨 투자 성향 설정
          </h2>

          <div className="space-y-6">
            {/* 위험 감수도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                위험 감수 성향
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "low", label: "안정형", emoji: "🛡️", desc: "원금 보존 중시" },
                  { value: "medium", label: "중립형", emoji: "⚖️", desc: "균형 추구" },
                  { value: "high", label: "공격형", emoji: "🚀", desc: "고수익 추구" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRiskTolerance(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      riskTolerance === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{option.emoji}</div>
                    <div className="font-semibold text-gray-800">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 투자 기간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                투자 기간
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "short_term", label: "단기", emoji: "⚡", desc: "1년 이내" },
                  { value: "mid_term", label: "중기", emoji: "📈", desc: "1~3년" },
                  { value: "long_term", label: "장기", emoji: "🌳", desc: "3년 이상" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setInvestmentPeriod(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      investmentPeriod === option.value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{option.emoji}</div>
                    <div className="font-semibold text-gray-800">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 추천 받기 버튼 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={getRecommendation}
            disabled={loading || !financialData}
            className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>AI가 분석 중입니다...</span>
              </div>
            ) : (
              "🤖 맞춤 ETF 추천 받기"
            )}
          </motion.button>

          {!financialData && (
            <p className="text-center text-sm text-red-500 mt-4">
              ⚠️ 재무 데이터를 먼저 입력해주세요.{" "}
              <button
                onClick={() => router.push("/flow")}
                className="underline font-semibold"
              >
                데이터 입력하기
              </button>
            </p>
          )}
        </motion.div>

        {/* 추천 결과 */}
        {recommendation && recommendation.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                📊 AI 추천 결과
              </h2>
              <span className="text-sm text-gray-500">
                데이터 소스: {recommendation.data_source}
              </span>
            </div>

            {/* 추천 내용 */}
            <div className="prose max-w-none">
              <div
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: recommendation.recommendation
                    ?.replace(/\n/g, "<br />")
                    .replace(/###/g, "<h3 class='text-xl font-bold mt-6 mb-3'>")
                    .replace(/##/g, "<h2 class='text-2xl font-bold mt-8 mb-4'>")
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") || "",
                }}
              />
            </div>

            {/* 참고 정보 */}
            {recommendation.available_etf_count && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  💡 {recommendation.available_etf_count}개의 ETF 상품을 분석하여 추천해드렸습니다.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
