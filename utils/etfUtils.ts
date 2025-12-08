// 숫자 포맷팅
export const formatNumber = (value: string | number): string => {
    if (!value || value === "-") return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);
    return num.toLocaleString("ko-KR");
};

// 날짜 포맷팅 (YYYYMMDD -> YYYY.MM.DD)
export const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
};

// 등락률에 따른 색상 클래스 반환
export const getChangeColorClass = (value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "text-zinc-700 dark:text-zinc-300";
    if (num > 0) return "text-red-600 dark:text-red-400";
    if (num < 0) return "text-blue-600 dark:text-blue-400";
    return "text-zinc-700 dark:text-zinc-300";
};

// 퍼센트 표시 포맷팅
export const formatPercent = (value: string | number): string => {
    if (!value || value === "-") return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);
    return `${num.toFixed(2)}%`;
};

// ISO 날짜를 한국 시간으로 포맷팅
export const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

// ETF 데이터 필터링 유틸리티
export const filterEtfByName = (items: any[], searchTerm: string) => {
    if (!searchTerm.trim()) return items;
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter((item) =>
        item.bssIdxIdxNm?.toLowerCase().includes(lowerSearch)
    );
};

// ETF 데이터 정렬 유틸리티
export type SortField = "basDt" | "clpr" | "fltRt" | "trqu" | "trPrc";
export type SortOrder = "asc" | "desc";

export const sortEtfData = (
    items: any[],
    field: SortField,
    order: SortOrder = "desc"
) => {
    return [...items].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        // 숫자형 필드 처리
        if (["clpr", "fltRt", "trqu", "trPrc"].includes(field)) {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        }

        if (order === "asc") {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });
};