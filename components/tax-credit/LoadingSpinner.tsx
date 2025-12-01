interface LoadingSpinnerProps {
    activeTab: "detail" | "checklist";
}

export default function LoadingSpinner({ activeTab }: LoadingSpinnerProps) {
    const message = activeTab === "detail"
        ? "상세 분석 중..."
        : "체크리스트 생성 중...";

    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400 font-medium">{message}</p>
        </div>
    );
}