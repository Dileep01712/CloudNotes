import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Button } from '../ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { isValidEmailStrict } from '@/lib/helper';

interface ForgotPasswordProps {
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function ForgotPassword({ showAlert }: ForgotPasswordProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [sending, setSending] = useState<boolean>(false);
    const [resetting, setResetting] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(0);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (step === 2 && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, countdown]);

    const sendResetCode = async (): Promise<boolean> => {
        if (!isValidEmailStrict(email)) {
            showAlert("Please enter a valid email address.", "danger");
            return false;
        }

        setSending(true);

        try {
            const response = await fetch(`${SERVER_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const json = await response.json();
            if (json.success) {
                showAlert("Recovery code sent successfully!", "success");
                setCountdown(60);
                return true;
            } else {
                showAlert(json.message || "Failed to send code.", "danger");
                return false;
            }

        } catch (error) {
            console.error("Forgot request error:", error);
            showAlert("Connection error. Try again.", "danger");
            return false;

        } finally {
            setSending(false);
        }
    };

    const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("handleRequestOtp");
        const success = await sendResetCode();
        if (success) setStep(2);
    };

    const handleResendOtp = async () => {
        if (countdown > 0 || sending) return;
        setOtp("");
        await sendResetCode();
    };

    const handleConfirmReset = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValidEmailStrict(email)) {
            showAlert("Please enter a valid email address.", "danger");
            return false;
        }

        if (otp.length < 6) {
            showAlert("Please enter the full 6-digit code.", "warning");
            return;
        }

        setResetting(true);

        try {
            const response = await fetch(`${SERVER_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otp, password: newPassword }),
            });

            const json = await response.json();
            if (json.success) {
                showAlert("Your password has been successfully reset!", "success");
                navigate('/signin');
            } else {
                let errorMsg = "Reset failed.";
                if (json.errors && json.errors.length > 0) {
                    errorMsg = json.errors[0].message;
                } else if (json.message) {
                    errorMsg = json.message;
                }
                showAlert(errorMsg, "danger");

                if (json.message && json.message.includes("attempts")) {
                    if (json.message.includes("new code")) {
                        setStep(1);
                        setOtp("");
                    }
                }
            }

        } catch (error) {
            console.error("Reset confirm error:", error);
            showAlert("Something went wrong.", "danger");

        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="flex min-h-[85vh] items-center justify-center">
            <div className="w-full max-w-125 rounded-[2rem] border border-zinc-100 bg-white p-4 sm:p-6 md:p-8 shadow-2xl shadow-zinc-200/30">
                {step !== 3 && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            if (step === 2) { setStep(1); setOtp(""); }
                            else { navigate('/signin'); }
                        }}
                        className="group mb-6 flex items-center gap-2 px-0 text-xs font-medium text-zinc-400 hover:bg-transparent hover:text-zinc-900 transition cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xxs transition group-hover:-translate-x-0.5" />
                        {step === 2 ? "Back to email" : "Back to Sign In"}
                    </Button>
                )}

                {step === 1 && (
                    <>
                        <div className="mb-8 text-center select-none">
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                                Forgot Password
                            </h2>
                            <p className="mt-2 text-sm text-zinc-500 font-medium">
                                Enter your account email to receive a recovery code.
                            </p>
                        </div>

                        <form className="space-y-10" onSubmit={handleRequestOtp}>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    className="h-9 sm:h-10 md:h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 placeholder:text-zinc-300 font-medium text-zinc-800 placeholder:select-none"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={sending}
                                className="h-9 sm:h-10 md:h-11 w-full cursor-pointer bg-zinc-950 text-white font-medium rounded-xl transition-all hover:bg-zinc-800 disabled:opacity-50"
                            >
                                {sending ? "Sending Code..." : "Continue"}
                            </Button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="mb-8 text-center select-none">
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                                Reset Password
                            </h2>
                            <p className="mt-2 text-sm text-zinc-500 font-medium leading-relaxed">
                                Enter the 6-digit verification security code sent to
                                <br />
                                <span className="text-zinc-900 font-semibold">{email}</span>
                            </p>
                            <p className="mt-1 text-sm text-zinc-500 font-medium">
                                This code expires in <span className="text-zinc-900 font-semibold">5 minutes</span>.
                            </p>
                        </div>

                        <form className="flex flex-col items-center w-full" onSubmit={handleConfirmReset}>
                            <div className="flex justify-center">
                                <InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
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

                            <div className="flex flex-col gap-1.5 w-full text-left my-10">
                                <label htmlFor="newPassword" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    Choose New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="newPassword"
                                        placeholder="Min. 8 characters"
                                        minLength={8}
                                        value={newPassword}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                        className="h-9 sm:h-10 md:h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 placeholder:text-zinc-300 font-medium text-zinc-800"
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

                            <div className="text-sm font-medium text-zinc-500 text-center select-none h-5 my-5">
                                {countdown > 0 ? (
                                    <p>Resend code in{" "}
                                        <span className="text-zinc-900 font-bold tabular-nums">
                                            {countdown}s
                                        </span>
                                    </p>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        onClick={handleResendOtp}
                                        disabled={sending || resetting}
                                        className="h-fit text-black font-semibold hover:underline underline-offset-4 cursor-pointer disabled:opacity-40 transition-opacity hover:bg-transparent"
                                    >
                                        {sending ? "Sending..." : "Resend Code"}
                                    </Button>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={resetting || sending || otp.length < 6 || newPassword.length < 8}
                                className="h-9 sm:h-10 md:h-11 w-full cursor-pointer bg-zinc-950 text-white font-medium rounded-xl transition-all hover:bg-zinc-800 disabled:opacity-50"
                            >
                                {resetting ? "Updating Password..." : "Reset Password"}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}