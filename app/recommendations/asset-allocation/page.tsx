"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Summary {
  total_income: number;
  total_expense: number;
  surplus: number;
  surplus_ratio: number;
  status: string;
}

interface HealthScore {
  overall: number;
  income_to_expense_ratio: number;
  essential_expense_ratio: number;
  savings_ratio: number;
  comment: string;
}

interface AllocationItem {
  amount: number;
  percentage: number;
  reason: string;
}

interface ImprovementSuggestion {
  priority: number;
  category: string;
  action: string;
  expected_saving: number;
}

interface SavingsGoal {
  target: string;
  amount: number;
  months: number;
}

interface Recommendations {
  method: string;
  strategy?: string;
  health_score: HealthScore;
  asset_allocation: Record<string, AllocationItem>;
  improvement_suggestions: ImprovementSuggestion[];
  savings_goals: {
    short_term: SavingsGoal;
    medium_term: SavingsGoal;
    long_term: SavingsGoal;
  };
}

export default function AssetAllocationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/documents-multi-agents/result`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setSummary(data.summary);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIRecommendations = async () => {
    try {
      setAiLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents-multi-agents/analyze-ai-detailed`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch AI recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">자산 분배 추천을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!summary || !recommendations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">데이터가 없습니다</h2>
          <p className="text-gray-600 mb-6">먼저 소득/지출 문서를 업로드해주세요</p>
          <button
            onClick={() => router.push("/upload")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            문서 업로드하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">자산 분배 추천</h1>
          <p className="text-gray-600">
            {recommendations.method === "rule_based" 
              ? "규칙 기반 추천" 
              : "AI 기반 자세한 추천"}
          </p>
        </div>

        {/* 재무 요약 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">재무 요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">총 소득</p>
              <p className="text-2xl font-bold text-blue-600">{summary.total_income.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">총 지출</p>
              <p className="text-2xl font-bold text-red-600">{summary.total_expense.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">잉여금</p>
              <p className={`text-2xl font-bold ${summary.surplus >= 0 ? "text-green-600" : "text-red-600"}`}>
                {summary.surplus.toLocaleString()}원
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">상태</p>
              <p className={`text-2xl font-bold ${summary.status === "흑자" ? "text-green-600" : summary.status === "적자" ? "text-red-600" : "text-gray-600"}`}>
                {summary.status}
              </p>
            </div>
          </div>
        </div>

        {/* 건강 점수 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">재무 건전성 점수</h2>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">전체 점수</span>
              <span className="text-3xl font-bold text-blue-600">{recommendations.health_score.overall}점</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${recommendations.health_score.overall}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{recommendations.health_score.comment}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">소득 대비 지출</p>
              <p className="text-xl font-bold">{recommendations.health_score.income_to_expense_ratio}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">필수 지출 비율</p>
              <p className="text-xl font-bold">{recommendations.health_score.essential_expense_ratio}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">저축 비율</p>
              <p className="text-xl font-bold">{recommendations.health_score.savings_ratio}%</p>
            </div>
          </div>
        </div>

        {/* 자산 분배 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">추천 자산 분배</h2>
          <div className="space-y-4">
            {Object.entries(recommendations.asset_allocation).map(([key, value]) => (
              <div key={key} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{key}</span>
                  <span className="text-lg font-bold text-blue-600">{value.amount.toLocaleString()}원 ({value.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${value.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{value.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 개선 제안 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">개선 제안</h2>
          <div className="space-y-3">
            {recommendations.improvement_suggestions.map((suggestion) => (
              <div key={suggestion.priority} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {suggestion.priority}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{suggestion.category}</p>
                  <p className="text-sm text-gray-600">{suggestion.action}</p>
                  <p className="text-sm text-green-600 mt-1">예상 절감: {suggestion.expected_saving.toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 저축 목표 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">저축 목표</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-semibold text-gray-900">단기 목표 ({recommendations.savings_goals.short_term.months}개월)</p>
              <p className="text-sm text-gray-600">{recommendations.savings_goals.short_term.target}</p>
              <p className="text-lg font-bold text-green-600 mt-1">{recommendations.savings_goals.short_term.amount.toLocaleString()}원</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold text-gray-900">중기 목표 ({recommendations.savings_goals.medium_term.months}개월)</p>
              <p className="text-sm text-gray-600">{recommendations.savings_goals.medium_term.target}</p>
              <p className="text-lg font-bold text-blue-600 mt-1">{recommendations.savings_goals.medium_term.amount.toLocaleString()}원</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="font-semibold text-gray-900">장기 목표 ({recommendations.savings_goals.long_term.months}개월)</p>
              <p className="text-sm text-gray-600">{recommendations.savings_goals.long_term.target}</p>
              <p className="text-lg font-bold text-purple-600 mt-1">{recommendations.savings_goals.long_term.amount.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        {/* AI 분석 버튼 */}
        {recommendations.method === "rule_based" && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">더 자세한 분석이 필요하신가요?</h3>
            <p className="mb-4">AI 에이전트를 통해 개인 맞춤형 자세한 분석과 추천을 받아보세요</p>
            <button
              onClick={fetchAIRecommendations}
              disabled={aiLoading}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? "AI 분석 중..." : "AI 자세한 분석 받기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
