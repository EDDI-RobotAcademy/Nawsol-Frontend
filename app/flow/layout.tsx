"use client";

import ProgressSteps from "../../components/step/ProgressSteps";

export default function FlowLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0d0d0d] flex justify-center items-start py-16">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-10">

                {/* 상단 단계 네비게이션 */}
                <ProgressSteps />

                {/* 구분선 */}
                <div className="border-b border-gray-200 my-6" />

                {/* 페이지 내용 */}
                <div className="min-h-[380px]">
                    {children}
                </div>
            </div>
        </div>
    );
}
