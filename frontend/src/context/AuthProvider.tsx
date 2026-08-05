import { useState, ReactNode } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({
    children
}: {
    children: ReactNode
}) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const signin = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const signout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, signin, signout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}