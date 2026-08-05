import { useCallback, useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";
import { useAuth } from '@/context/useAuth';
import { isValidEmailStrict } from '@/lib/helper';

interface SignInProps {
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function SignIn({ showAlert }: SignInProps) {
    const navigate = useNavigate();
    const { signin, isAuthenticated } = useAuth();

    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValidEmailStrict(credentials.email)) {
            showAlert("Please enter a valid email address.", "danger");
            return false;
        }

        setLoading(true);

        try {
            const response = await fetch(`${SERVER_URL}/api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include',
            });

            const json = await response.json();
            if (json.success && json.accessToken) {
                signin(json.accessToken);
                showAlert("Logged in successfully!", "success");
            } else {
                showAlert(json.message || "Invalid credentials", "danger");
            }

        } catch (error) {
            showAlert((error as Error).message, "danger");
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    return (
        <div className="flex items-center justify-center mx-auto max-w-7xl py-16">
            <div className="w-full max-w-126 rounded-[2rem] border border-zinc-100 bg-white p-4 sm:p-6 md:p-8 shadow-2xl shadow-zinc-200/30">

                <div className="mb-8 text-center select-none">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                        Welcome Back ッ
                    </h1>
                    <p className="mt-2 text-sm font-medium text-zinc-500">
                        Sign in to continue to CloudNotes
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="you@example.com"
                            value={credentials.email}
                            onChange={handleChange}
                            className="h-9 sm:h-10 md:h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 outline-none transition-all placeholder:text-zinc-300 placeholder:select-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100"
                            autoComplete='username'
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                                className="h-9 sm:h-10 md:h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-sm font-medium text-zinc-800 outline-none transition-all placeholder:text-zinc-300 placeholder:select-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100"
                                autoComplete='current-password'
                                required
                            />

                            <Button
                                variant="ghost"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700 cursor-pointer"
                                onClick={togglePasswordVisibility}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-xs" />
                            </Button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-9 sm:h-10 md:h-11 w-full cursor-pointer rounded-xl bg-zinc-950 font-medium text-white transition-all shadow-sm hover:bg-zinc-800 disabled:opacity-50"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </Button>

                    </div>

                    <div className="flex items-center justify-center">
                        <Link
                            to="/forgot-password"
                            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors underline-offset-4 hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </form>

                <div className="mt-8 border-t border-zinc-50 pt-6 text-center text-sm font-medium text-zinc-500">
                    Don’t have an account?{" "}
                    <Link
                        to="/signup"
                        className="font-semibold text-zinc-900 underline-offset-2 hover:text-zinc-800 hover:underline ml-0.5"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}