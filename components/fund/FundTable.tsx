import React from "react";
import { FundDisplayItem } from "@/types/fund";
import { formatDate } from "@/utils/etfUtils";

interface FundTableProps {
    data: FundDisplayItem[];
    onRowClick?: (item: FundDisplayItem) => void;
}

export function FundTable({ data, onRowClick }: FundTableProps) {
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

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead className="bg-zinc-100 dark:bg-zinc-800 sticky top-0">
                <tr>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        기준일자
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        코드
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        펀드명
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100 min-w-[120px]">
                        구분
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        설정일
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        펀드유형
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        상품분류코드
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        협회표준코드
                    </th>
                </tr>
                </thead>
                <tbody>
                {data.map((item, index) => (
                    <tr
                        key={item.id}
                        onClick={() => onRowClick?.(item)}
                        className={`
                                ${index % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800"}
                                ${onRowClick ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" : ""}
                            `}
                    >
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {formatDateString(item.basDt)}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {item.srtnCd || "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                            {item.fndNm || "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 min-w-[120px] whitespace-nowrap">
                            {item.ctg || "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {formatDateString(item.setpDt)}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {item.fndTp || "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                            {item.prdClsfCd || "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                            {item.asoStdCd || "-"}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

