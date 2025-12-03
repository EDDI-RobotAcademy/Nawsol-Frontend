interface EcosTabsProps {
    activeTab: "exchange_rate" | "interest_rate";
    onTabChange: (tab: "exchange_rate" | "interest_rate") => void;
}

export default function EcosTabs({ activeTab, onTabChange }: EcosTabsProps) {
    return (
        <div className="flex border-b border-zinc-200 dark:border-zinc-700">
            <button
                className={`flex-1 py-3 font-semibold transition-colors ${
                    activeTab === "exchange_rate"
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
                onClick={() => onTabChange("exchange_rate")}
            >
                환율 동향 확인
            </button>
            <button
                className={`flex-1 py-3 font-semibold transition-colors ${
                    activeTab === "interest_rate"
                        ? "text-teal-600 border-b-2 border-teal-600"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
                onClick={() => onTabChange("interest_rate")}
            >
                금리 동향 확인
            </button>
        </div>
    );
}

