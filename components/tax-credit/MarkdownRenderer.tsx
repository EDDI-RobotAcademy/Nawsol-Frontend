import React from "react";

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    // content가 없으면 빈 div 반환
    if (!content) {
        return <div className="text-zinc-500 dark:text-zinc-400">데이터가 없습니다.</div>;
    }

    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];

    // 볼드 텍스트 처리 헬퍼 함수
    const processBold = (text: string): string => {
        return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    };

    const flushList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1 ml-4">
                    {currentList.map((item, idx) => (
                        <li
                            key={idx}
                            className="text-zinc-700 dark:text-zinc-300"
                            dangerouslySetInnerHTML={{ __html: processBold(item.trim()) }}
                        />
                    ))}
                </ul>
            );
            currentList = [];
        }
    };

    const flushTable = () => {
        if (tableRows.length > 0 && tableHeaders.length > 0) {
            elements.push(
                <div key={`table-${elements.length}`} className="overflow-x-auto mb-6">
                    <table className="min-w-full border-collapse border border-zinc-300 dark:border-zinc-700">
                        <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-800">
                            {tableHeaders.map((header, idx) => (
                                <th
                                    key={idx}
                                    className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-left font-semibold text-zinc-900 dark:text-zinc-100"
                                    dangerouslySetInnerHTML={{ __html: processBold(header.trim()) }}
                                />
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {tableRows.map((row, rowIdx) => (
                            <tr
                                key={rowIdx}
                                className={rowIdx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800"}
                            >
                                {row.map((cell, cellIdx) => (
                                    <td
                                        key={cellIdx}
                                        className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300"
                                        dangerouslySetInnerHTML={{ __html: processBold(cell.trim()) }}
                                    />
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
            tableHeaders = [];
            inTable = false;
        }
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // 테이블 처리
        if (trimmed.includes("|") && trimmed.split("|").length > 2) {
            flushList();
            const cells = trimmed
                .split("|")
                .map((cell) => cell.trim())
                .filter((cell) => cell.length > 0);

            if (cells.length > 0) {
                if (!inTable) {
                    // 헤더
                    tableHeaders = cells;
                    inTable = true;
                } else if (trimmed.includes("---")) {
                    // 구분선 무시
                } else {
                    // 데이터 행
                    tableRows.push(cells);
                }
            }
            return;
        } else if (inTable) {
            flushTable();
        }

        // 헤더 처리
        if (trimmed.startsWith("###")) {
            flushList();
            const text = trimmed.substring(3).trim();
            elements.push(
                <h3
                    key={`h3-${index}`}
                    className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-3"
                    dangerouslySetInnerHTML={{ __html: processBold(text) }}
                />
            );
            return;
        }

        if (trimmed.startsWith("####")) {
            flushList();
            const text = trimmed.substring(4).trim();
            elements.push(
                <h4
                    key={`h4-${index}`}
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-4 mb-2"
                    dangerouslySetInnerHTML={{ __html: processBold(text) }}
                />
            );
            return;
        }

        if (trimmed.startsWith("##")) {
            flushList();
            const text = trimmed.substring(2).trim();
            elements.push(
                <h2
                    key={`h2-${index}`}
                    className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4"
                    dangerouslySetInnerHTML={{ __html: processBold(text) }}
                />
            );
            return;
        }

        if (trimmed.startsWith("#")) {
            flushList();
            const text = trimmed.substring(1).trim();
            elements.push(
                <h1
                    key={`h1-${index}`}
                    className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4"
                    dangerouslySetInnerHTML={{ __html: processBold(text) }}
                />
            );
            return;
        }

        // 리스트 처리
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            const text = trimmed.substring(1).trim();
            if (text.length > 0) currentList.push(text);
            return;
        }

        // 구분선 처리
        if (trimmed === "---" || trimmed.startsWith("---")) {
            flushList();
            elements.push(<hr key={`hr-${index}`} className="my-6 border-zinc-300 dark:border-zinc-700" />);
            return;
        }

        // 일반 텍스트
        if (trimmed.length > 0) {
            flushList();
            elements.push(
                <p
                    key={`p-${index}`}
                    className="text-zinc-700 dark:text-zinc-300 mb-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: processBold(trimmed) }}
                />
            );
        } else {
            // 빈 줄
            flushList();
        }
    });

    flushList();
    flushTable();

    return <div className="markdown-content">{elements}</div>;
}