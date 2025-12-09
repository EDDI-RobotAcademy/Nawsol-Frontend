"use client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const handleGoogleLogin = () => {
        //window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_GOOGLE_LOGIN_PATH}`;
         router.push("/terms");
    };

    const handleKakaoLogin = () => {
        window.location.href =
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_KAKAO_LOGIN_PATH}`;
    };

    return (
        <div className="flex justify-center items-center h-screen gap-6">
            <button
                onClick={handleGoogleLogin}
                className="bg-red-600 text-white px-4 py-2 rounded"
            >
                Google Login
            </button>

            <button
                onClick={handleKakaoLogin}
                className="bg-yellow-300 text-black px-4 py-2 rounded font-bold w-64 hover:opacity-90 transition"
            >
                Kakao Login
            </button>
        </div>

    );
}
