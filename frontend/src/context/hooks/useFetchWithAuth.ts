import { useCallback } from "react";

interface FetchOptions extends RequestInit {
    _retry?: boolean;
}

let isRefreshing = false;
let refreshSubscribersRef: ((token: string) => void)[] = [];

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const useFetchWithAuth = () => {

    const isTokenExpiredError = useCallback((error: unknown): boolean => {
        const msg = error instanceof Error ? error.message : String(error);
        return msg.includes('expired') || msg.includes('Session');
    }, []);

    const fetchWithAuth = useCallback(
        async (url: string, options: FetchOptions = {}): Promise<Response> => {

            const makeRequest = (tkn: string) => fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": tkn,
                    ...options.headers,
                },
            });

            const currentToken = localStorage.getItem("token") || "";
            const response = await makeRequest(currentToken);

            if (response.status !== 401 || options._retry) {
                return response;
            }

            options._retry = true;

            if (isRefreshing) {
                const newToken = await new Promise<string>((resolve) => {
                    refreshSubscribersRef.push(resolve);
                });
                return makeRequest(newToken);
            }

            isRefreshing = true;

            try {
                const refreshRes = await fetch(`${SERVER_URL}/api/auth/refresh-token`, {
                    method: 'POST',
                    credentials: 'include',
                });

                if (!refreshRes.ok) throw new Error('Refresh request rejected by server');

                const data = await refreshRes.json();
                const accessToken = data.accessToken;

                localStorage.setItem("token", accessToken);

                if (data.refreshToken) {
                    localStorage.setItem("refreshToken", data.refreshToken);
                }

                refreshSubscribersRef.forEach(cb => cb(accessToken));
                refreshSubscribersRef = [];
                isRefreshing = false;

                return makeRequest(accessToken);

            } catch (error) {
                console.error("Silent refresh failed:", error);

                isRefreshing = false;
                refreshSubscribersRef = [];
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");

                const event = new CustomEvent("auth:signout", {
                    detail: { message: "Session expired. Please log in again." }
                });

                window.dispatchEvent(event);

                const err = new Error("Session expired");
                Object.assign(err, { cause: error });
                throw err;
            }
        },
        []
    );

    return { fetchWithAuth, isTokenExpiredError };
};