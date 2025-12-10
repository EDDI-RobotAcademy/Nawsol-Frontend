interface DatePickerProps {
    value: string; // YYYYMMDD 형식
    onChange: (date: string) => void;
    label?: string;
}

export function DatePicker({ value, onChange, label = "조회 날짜" }: DatePickerProps) {
    // YYYYMMDD -> YYYY-MM-DD 변환
    const formatToInputValue = (dateStr: string): string => {
        if (!dateStr || dateStr.length !== 8) return "";
        return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    };

    // YYYY-MM-DD -> YYYYMMDD 변환
    const formatToApiValue = (dateStr: string): string => {
        return dateStr.replace(/-/g, "");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const inputDate = e.target.value; // YYYY-MM-DD
        const apiDate = formatToApiValue(inputDate); // YYYYMMDD
        onChange(apiDate);
    };

    // 오늘 날짜를 YYYY-MM-DD 형식으로
    const getTodayInputFormat = (): string => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="flex items-center gap-2">
            <label
                htmlFor="date-picker"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
                {label}:
            </label>
            <input
                id="date-picker"
                type="date"
                value={formatToInputValue(value)}
                onChange={handleChange}
                max={getTodayInputFormat()} // 오늘 이후 날짜는 선택 불가
                className="px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
        </div>
    );
}