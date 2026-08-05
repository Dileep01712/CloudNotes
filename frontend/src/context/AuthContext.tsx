import { createContext } from 'react';

interface AuthContextType {
    token: string | null;
    signin: (token: string) => void;
    signout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);