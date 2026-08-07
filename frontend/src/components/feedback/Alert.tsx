import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTriangleExclamation, faInfo, faX } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";

interface AlertProps {
    alert: AlertType | null;
    autoHideDuration?: number;
    onClose?: () => void;
}

interface AlertType {
    msg: string;
    type: "success" | "danger" | "warning" | "info";
}

const alertStyles = {
    success: {
        icon: "text-emerald-600",
        iconBg: "bg-emerald-100",
        progress: "bg-emerald-500",
    },
    danger: {
        icon: "text-red-600",
        iconBg: "bg-red-100",
        progress: "bg-red-500",
    },
    warning: {
        icon: "text-amber-600",
        iconBg: "bg-amber-100",
        progress: "bg-amber-500",
    },
    info: {
        icon: "text-blue-600",
        iconBg: "bg-blue-100",
        progress: "bg-blue-500",
    },
};

const alertIcons = {
    success: faCheck,
    danger: faTriangleExclamation,
    warning: faTriangleExclamation,
    info: faInfo,
};

export default function Alert({
    alert,
    onClose,
    autoHideDuration = 5000,
}: AlertProps) {
    const [isLeaving, setIsLeaving] = useState<boolean>(false);
    const [prevAlert, setPrevAlert] = useState<AlertType | null>(null);
    const [animationKey, setAnimationKey] = useState<number>(0);

    if (alert !== prevAlert) {
        setPrevAlert(alert);
        setAnimationKey((prev) => prev + 1);
    }

    const handleClose = useCallback(() => {
        setIsLeaving(true);

        setTimeout(() => {
            onClose?.();
            setIsLeaving(false);
        }, 300);
    }, [onClose]);

    useEffect(() => {
        if (!alert) return;

        const timer = setTimeout(() => {
            handleClose();
        }, autoHideDuration);

        return () => clearTimeout(timer);
    }, [alert, autoHideDuration, handleClose]);

    if (!alert) return null;

    const styles = alertStyles[alert.type];

    return (
        <div className={`fixed top-6 z-50 flex min-w-82 max-w-100 items-start gap-4 overflow-hidden rounded-[2rem] bg-white p-3.75 shadow-xl transition-all duration-300 select-none inset-x-4 mx-auto sm:inset-x-auto sm:mx-0 sm:right-5 md:right-6 lg:right-8
            ${isLeaving
                ? "translate-x-12 opacity-0"
                : "translate-x-0 opacity-100"
            }
        `}>
            <div className={`flex h-9 w-9 my-auto shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}>
                <FontAwesomeIcon icon={alertIcons[alert.type]} className={`text-sm ${styles.icon}`} />
            </div>

            <div className="flex-1 my-auto">
                <p className="text-sm font-medium text-zinc-900 tracking-tight leading-relaxed">
                    {alert.msg}
                </p>
            </div>

            <Button
                variant="outline"
                onClick={handleClose}
                className="flex w-9 h-9 my-auto shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            >
                <FontAwesomeIcon icon={faX} />
            </Button>

            <div key={`${alert.msg}-${animationKey}`}
                className={`absolute bottom-0 left-0 w-full h-1 animate-progress opacity-100 rounded-md ${styles.progress}`}
                style={{ animationDuration: `${autoHideDuration}ms`, }}
            />
        </div>
    );
}