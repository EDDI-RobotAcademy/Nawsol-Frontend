import LoadingSpinner from "@/components/LoadingSpinner";
import MarkdownRenderer from "./MarkdownRenderer";

interface TaxCreditContentProps {
    loading: boolean;
    error: string | null;
    result: string | null;
    activeTab: "detail" | "checklist";
}

export default function TaxCreditContent({ loading, error, result, activeTab }: TaxCreditContentProps) {
    return (
        <div className="px-6 py-8 min-h-[300px]">
            {loading && (
                <LoadingSpinner
                    messages={
                        activeTab === "detail"
                            ? [
                                  "재무 데이터를 불러오는 중...",
                                  "세액 공제 항목을 분석하고 있습니다...",
                                  "공제 가능 금액을 계산하고 있습니다...",
                                  "최적 절세 전략을 수립하고 있습니다...",
                                  "거의 완료되었습니다!",
                              ]
                            : [
                                  "체크리스트를 생성하고 있습니다...",
                                  "필수 서류를 확인하고 있습니다...",
                                  "주의 사항을 정리하고 있습니다...",
                                  "거의 완료되었습니다!",
                              ]
                    }
                    interval={1800}
                />
            )}

            {!loading && error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <svg
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
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

            {!loading && !error && result && typeof result === 'string' && (
                <MarkdownRenderer content={result} />
            )}

            {!loading && !error && !result && (
                <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
                    분석 결과가 없습니다.
                </div>
            )}
        </div>
    );
}