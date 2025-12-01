"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    refresh: () => void;
    logout: () => void;
    depart: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    refresh: () => {},
    logout: () => {},
    depart: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const refresh = () => {
        console.log("[Auth] Checking login status...");
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/authentication/status`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("[Auth] Status API response:", data);
                setIsLoggedIn(data.logged_in);
            })
            .catch((err) => {
                console.error("[Auth] Status check failed:", err);
                setIsLoggedIn(false);
            });
    };

    const logout = () => {
        console.log("[Auth] Logging out...");

        // 쿠키에서 CSRF 토큰 읽기
        const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="))
        ?.split("=")[1];
        console.log("[Auth] csrfToken is : ",csrfToken);


        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/authentication/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
            "X-CSRF-Token": csrfToken || "",  // 헤더에 CSRF 토큰 추가
            },
        }).finally(() => {
            setIsLoggedIn(false);
        });
    };

    const depart = () => {
        console.log("[Auth] Departing (회원탈퇴)...");
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account/departure`, {
            method: "POST",
            credentials: "include", // 쿠키 포함 (session_id 전송)
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("[Auth] Departure response:", data);
                if (data.success) {
                    console.log("[Auth] Account deleted successfully");
                    setIsLoggedIn(false); // 로그인 상태 false로 변경
                } else {
                    console.error("[Auth] Departure failed:", data.message);
                    alert(`회원탈퇴 실패: ${data.message}`);
                }
            })
            .catch((err) => {
                console.error("[Auth] Departure request failed:", err);
                alert("회원탈퇴 중 오류가 발생했습니다.");
            });
    };

    // 처음 로딩될 때 1번만 실행
    useEffect(() => {
        refresh();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, refresh, logout, depart }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
