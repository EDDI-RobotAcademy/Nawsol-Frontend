"use client";

interface MonthNavigatorProps {
    currentMonth: string; // YYYYMM 형식
    onMonthChange: (month: string) => void;
}

export default function MonthNavigator({ currentMonth, onMonthChange }: MonthNavigatorProps) {
    // YYYYMM 형식의 문자열을 파싱
    const parseMonth = (monthStr: string) => {
        const year = parseInt(monthStr.substring(0, 4));
        const month = parseInt(monthStr.substring(4, 6));
        return { year, month };
    };

    // 이전 월 계산
    const getPreviousMonth = (monthStr: string): string => {
        const { year, month } = parseMonth(monthStr);
        let prevYear = year;
        let prevMonth = month - 1;
        
        if (prevMonth < 1) {
            prevMonth = 12;
            prevYear -= 1;
        }
        
        return `${prevYear}${String(prevMonth).padStart(2, "0")}`;
    };

    // 다음 월 계산
    const getNextMonth = (monthStr: string): string => {
        const { year, month } = parseMonth(monthStr);
        let nextYear = year;
        let nextMonth = month + 1;
        
        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear += 1;
        }
        
        return `${nextYear}${String(nextMonth).padStart(2, "0")}`;
    };

    const prevMonth = getPreviousMonth(currentMonth);
    const nextMonth = getNextMonth(currentMonth);

    const handlePrev = () => {
        onMonthChange(prevMonth);
    };

    const handleNext = () => {
        onMonthChange(nextMonth);
    };

    return (
        <div className="flex items-center justify-center gap-4 py-4">
            <button
                onClick={handlePrev}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                aria-label="이전 월"
            >
                <svg
                    className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>
            
            <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400 px-2" onClick={handlePrev}>
                    {prevMonth}
                </span>
                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    {currentMonth}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400 px-2" onClick={handleNext}>
                    {nextMonth}
                </span>
            </div>

            <button
                onClick={handleNext}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                aria-label="다음 월"
            >
                <svg
                    className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </div>
    );
}

