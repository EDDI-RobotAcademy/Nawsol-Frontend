import React from "react";
import { BondDisplayItem } from "@/types/bond";
import { formatNumber, formatDate } from "@/utils/etfUtils";

interface BondTableProps {
    data: BondDisplayItem[];
    onRowClick?: (item: BondDisplayItem) => void;
}

export function BondTable({ data, onRowClick }: BondTableProps) {
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
                        채권발행자명
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        ISIN코드명
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        코드명
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        채권발행일
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        채권만기일
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        발행통화
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        발행금액
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        표면이자율
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        이자율변동구분
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        채권이자유형
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
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                            {item.bondIsurNm || "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {item.isinCdNm || "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {item.scrsItmsKcdNm || "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {formatDateString(item.bondIssuDt)}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {formatDateString(item.bondExprDt)}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {item.bondIssuCurCdNm || item.bondIssuCurCd || "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                            {item.bondIssuAmt ? formatNumber(item.bondIssuAmt) : "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                            {item.bondSrfcInrt !== null ? `${formatNumber(item.bondSrfcInrt)}%` : "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {item.irtChngDcdNm || "-"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            {item.bondIntTcdNm || "-"}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

