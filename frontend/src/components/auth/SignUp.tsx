import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '@/context/useAuth';
import { Button } from '../ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot, } from "../ui/input-otp";
import { isValidEmailStrict } from '@/lib/helper';

interface SignUpProps {
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function SignUp({ showAlert }: SignUpProps) {
    const navigate = useNavigate();
    const { signin, isAuthenticated } = useAuth();

    const [step, setStep] = useState<1 | 2>(1);
    const [otp, setOtp] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [sending, setSending] = useState<boolean>(false);
    const [verifying, setVerifying] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(0);

    const [credentials, setCredentials] = useState({
        name: "",
        email: "",
        password: ""
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;

        if (step === 2 && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, countdown]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    const sendOtpCode = async (): Promise<boolean> => {
        if (!isValidEmailStrict(credentials.email)) {
            showAlert("Please enter a valid email address.", "danger");
            return false;
        }

        setSending(true);

        try {
            const response = await fetch(`${SERVER_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include',
            });

            const json = await response.json();
            if (json.success) {
                showAlert("Verification code sent to your email!", "success");
                setCountdown(60);
                return true;
            } else {
                let errorMsg = "Failed to send code.";
                if (json.errors && json.errors.length > 0) {
                    errorMsg = json.errors[0].message;
                } else if (json.message) {
                    errorMsg = json.message;
                }

                showAlert(errorMsg, "danger");
                return false;
            }

        } catch (error) {
            console.error("OTP send error: ", error);
            showAlert("Connection error. Try again.", "danger");
            return false;

        } finally {
            setSending(false);
        }
    };

    const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const success = await sendOtpCode();
        if (success) setStep(2);
    };

    const handleResendOtp = async () => {
        if (countdown > 0 || sending || verifying) return;
        setOtp("");
        await sendOtpCode();
    };

    const handleVerifyAndSignup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValidEmailStrict(credentials.email)) {
            showAlert("Please enter a valid email address.", "danger");
            return false;
        }

        if (otp.length < 6) {
            showAlert("Please enter the full 6-digit code.", "warning");
            return;
        }

        setVerifying(true);

        try {
            const response = await fetch(`${SERVER_URL}/api/auth/create-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...credentials, otp }),
            });

            const json = await response.json();
            if (json.success && json.accessToken) {
                signin(json.accessToken);
                showAlert("Account verified and created!", "success");
            } else {
                const errorMsg = json.errors?.[0]?.message || json.message || "Invalid verification code.";
                showAlert(errorMsg, "danger");
            }

        } catch (error) {
            console.error("Verification error:", error);
            showAlert("Something went wrong.", "danger");

        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="flex items-center justify-center mx-auto max-w-7xl py-16">
            <div className="w-full max-w-126 rounded-[2rem] border border-zinc-100 bg-white p-4 sm:p-6 md:p-8 shadow-2xl shadow-zinc-200/30">

                {step === 1 && (
                    <>
                        <div className="mb-8 text-center select-none">
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                                Create an Account
                            </h2>
                            <p className="mt-2 text-sm text-zinc-500 font-medium">
                                Organize your notes beautifully with CloudNotes.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleRequestOtp}>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="name" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Your full name"
                                    value={credentials.name}
                                    onChange={handleChange}
                                    className="h-9 sm:h-10 md:h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 placeholder:text-zinc-300 placeholder:select-none font-medium text-zinc-800"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    className="h-9 sm:h-10 md:h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 placeholder:text-zinc-300 placeholder:select-none font-medium text-zinc-800"
                                    autoComplete='username'
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
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
                                        className="h-9 sm:h-10 md:h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 placeholder:text-zinc-300 placeholder:select-none font-medium text-zinc-800"
                                        autoComplete='current-password'
                                        required
                                    />
                                    <Button
                                        variant="ghost"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-xs" />
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={sending}
                                    className="h-9 sm:h-10 md:h-11 w-full cursor-pointer bg-zinc-950 text-white font-medium rounded-xl transition-all hover:bg-zinc-800 shadow-sm disabled:opacity-50"
                                >
                                    {sending ? "Sending Code..." : "Continue"}
                                </Button>
                            </div>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => { setStep(1); setOtp("") }}
                            className="group mb-6 flex items-center gap-2 px-0 text-xs font-medium text-zinc-400 hover:bg-transparent hover:text-zinc-900 transition cursor-pointer"
                        >
                            <FontAwesomeIcon
                                icon={faArrowLeft}
                                className="text-xxs transition group-hover:-translate-x-0.5"
                            />
                            Back to details
                        </Button>

                        <div className="mb-8 text-center select-none">
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                                Verify Email
                            </h2>
                            <p className="mt-2 text-sm text-zinc-500 font-medium leading-relaxed">
                                We sent a 6-digit verification code to
                                <br />
                                <span className="text-zinc-900 font-semibold">
                                    {credentials.email}
                                </span>
                            </p>
                            <p className="mt-1 text-sm text-zinc-500 font-medium">
                                This code expires in <span className="text-zinc-900 font-semibold">5 minutes</span>.
                            </p>
                        </div>

                        <form className="space-y-6 flex flex-col items-center" onSubmit={handleVerifyAndSignup}>
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={(val) => setOtp(val)}
                                >
                                    <InputOTPGroup className="gap-2">
                                        <InputOTPSlot index={0} className="sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-md border border-zinc-200 text-base font-semibold focus:ring-4 focus:ring-zinc-100" />
                                        <InputOTPSlot index={1} className="sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-md border border-zinc-200 text-base font-semibold focus:ring-4 focus:ring-zinc-100" />
                                        <InputOTPSlot index={2} className="sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-md border border-zinc-200 text-base font-semibold focus:ring-4 focus:ring-zinc-100" />
                                        <InputOTPSlot index={3} className="sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-md border border-zinc-200 text-base font-semibold focus:ring-4 focus:ring-zinc-100" />
                                        <InputOTPSlot index={4} className="sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-md border border-zinc-200 text-base font-semibold focus:ring-4 focus:ring-zinc-100" />
                                        <InputOTPSlot index={5} className="sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-md border border-zinc-200 text-base font-semibold focus:ring-4 focus:ring-zinc-100" />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <div className="text-sm font-medium text-zinc-500 text-center select-none h-5">
                                {countdown > 0 ? (
                                    <p>
                                        Resend code in{" "}
                                        <span className="text-zinc-900 font-bold tabular-nums">
                                            {countdown}s
                                        </span>
                                    </p>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        onClick={handleResendOtp}
                                        disabled={sending || verifying}
                                        className="h-fit text-black font-semibold hover:underline underline-offset-4 cursor-pointer disabled:opacity-40 transition-opacity hover:bg-transparent"
                                    >
                                        {sending ? "Sending..." : "Resend Code"}
                                    </Button>
                                )}
                            </div>

                            <Button
                                type="button"
                                disabled={verifying || sending || otp.length < 6}
                                className="h-9 sm:h-10 md:h-11 w-full cursor-pointer bg-zinc-950 text-white font-medium rounded-xl transition-all hover:bg-zinc-800 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {verifying ? "Verifying..." : "Verify & Create Account"}
                            </Button>
                        </form>
                    </>
                )}

                <div className="mt-8 space-y-4 text-center border-t border-zinc-50 pt-6">
                    <p className="text-tiny leading-relaxed text-zinc-400 font-medium">
                        By creating an account, you agree to CloudNotes’{" "}
                        <Link
                            to="/privacy-policy"
                            className="font-semibold text-zinc-600 hover:text-zinc-900 underline underline-offset-2"
                        >
                            Privacy Policy
                        </Link>
                        {" "}and{" "}
                        <Link
                            to="/terms-of-use"
                            className="font-semibold text-zinc-600 hover:text-zinc-900 underline underline-offset-2"
                        >
                            Terms of Use
                        </Link>.
                    </p>

                    <p className="text-sm text-zinc-500 font-medium">
                        Already have an account?{" "}
                        <Link
                            to="/signin"
                            className="font-semibold text-zinc-900 hover:text-zinc-800 hover:underline underline-offset-2 ml-1"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}