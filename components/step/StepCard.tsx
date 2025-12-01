"use client";

export default function StepCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full max-w-3xl mx-auto my-8 px-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                {children}
            </div>
        </div>
    );
}