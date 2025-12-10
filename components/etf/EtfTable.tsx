import React from "react";
import { EtfDisplayItem } from "@/types/etf";
import { formatNumber, formatDate, getChangeColorClass } from "@/utils/etfUtils";

interface EtfTableProps {
    data: EtfDisplayItem[];
    onRowClick?: (item: EtfDisplayItem) => void;
}

export function EtfTable({ data, onRowClick }: EtfTableProps) {

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead className="bg-zinc-100 dark:bg-zinc-800 sticky top-0">
                <tr>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        기준일자
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        기초지수명
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        종가
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        대비
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        등락률(%)
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        시가
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        고가
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        저가
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        거래량
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        거래대금
                    </th>
                    <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        NAV
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
                            {formatDate(item.basDt)}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                            {item.bssIdxIdxNm}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                            {formatNumber(item.clpr)}
                        </td>
                        <td className={`border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right font-medium ${getChangeColorClass(item.vs)}`}>
                            {formatNumber(item.vs)}
                        </td>
                        <td className={`border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right font-medium ${getChangeColorClass(item.fltRt)}`}>
                            {formatNumber(item.fltRt) + "%"}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                            {formatNumber(item.mkp)}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                            {formatNumber(item.hipr)}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                            {formatNumber(item.lopr)}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                            {formatNumber(item.trqu)}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                            {formatNumber(item.trPrc)}
                        </td>
                        <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                            {formatNumber(item.nav)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}