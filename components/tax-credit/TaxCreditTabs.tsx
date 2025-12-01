interface TaxCreditTabsProps {
    activeTab: "detail" | "checklist";
    onTabChange: (tab: "detail" | "checklist") => void;
}

export default function TaxCreditTabs({ activeTab, onTabChange }: TaxCreditTabsProps) {
    return (
        <div className="flex border-b border-zinc-200 dark:border-zinc-700">
            <button
                className={`flex-1 py-3 font-semibold transition-colors ${
                    activeTab === "detail"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-zinc-500 hover:text-zinc-700"
                }`}
                onClick={() => onTabChange("detail")}
            >
                상세 분석
            </button>
            <button
                className={`flex-1 py-3 font-semibold transition-colors ${
                    activeTab === "checklist"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-zinc-500 hover:text-zinc-700"
                }`}
                onClick={() => onTabChange("checklist")}
            >
                체크리스트
            </button>
        </div>
    );
}