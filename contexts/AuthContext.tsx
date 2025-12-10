"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiFetch } from "@/utils/api";
import {useRouter} from "next/navigation";

interface User {
    session_id: string;
    oauth_id: string;
    oauth_type: string;
    nickname: string;
    name: string;
    profile_image: string | null;
    email: string;
    phone_number: string | null;
    active_status: boolean;
    role_id: number;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    loading: boolean;
    refresh: () => void;
    login: () => void;
    logout: () => void;
    depart: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    loading: true,
    refresh: () => {},
    login: () => {},
    logout: () => {},
    depart: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refresh = () => {
        console.log("[Auth] Checking login status...");
        setLoading(true);

        // 1. 기존 방식: /authentication/status
        apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/authentication/status`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("[Auth] Status API response:", data);
                setIsLoggedIn(data.logged_in);

                // 2. 로그인되어 있으면 사용자 정보 가져오기
                if (data.logged_in) {
                    return apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account/me`, {
                        credentials: "include",
                    });
                }
                return null;
            })
            .then((res) => {
                if (res) {
                    return res.json();
                }
                return null;
            })
            .then((userData) => {
                if (userData) {
                    console.log("[Auth] User data:", userData);
                    setUser(userData);
                } else {
                    setUser(null);
                }
            })
            .catch((err) => {
                console.error("[Auth] Status check failed:", err);
                setIsLoggedIn(false);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const login = () => {
        router.push("/terms");
    };

    const logout = () => {
        console.log("[Auth] Logging out...");

        const csrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrf_token="))
            ?.split("=")[1];
        console.log("[Auth] csrfToken is:", csrfToken);

        apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/authentication/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CSRF-Token": csrfToken || "",
            },
        }).finally(() => {
            setIsLoggedIn(false);
            setUser(null);
            router.push("/login");
        });
    };

    const depart = () => {
        console.log("[Auth] Departing (회원탈퇴)...");
        apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account/departure`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("[Auth] Departure response:", data);
                if (data.success) {
                    console.log("[Auth] Account deleted successfully");
                    setIsLoggedIn(false);
                    setUser(null);
                    router.push("/login");
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
        <AuthContext.Provider value={{
            isLoggedIn,
            user,
            loading,
            refresh,
            login,
            logout,
            depart
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);