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
        icon: "text-emerald-500",
        iconBg: "bg-emerald-50",
        progress: "bg-emerald-500",
    },
    danger: {
        icon: "text-red-500",
        iconBg: "bg-red-50",
        progress: "bg-red-500",
    },
    warning: {
        icon: "text-amber-500",
        iconBg: "bg-amber-50",
        progress: "bg-amber-500",
    },
    info: {
        icon: "text-blue-500",
        iconBg: "bg-blue-50",
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
    autoHideDuration = 50000,
    onClose,
}: AlertProps) {
    const [isLeaving, setIsLeaving] = useState<boolean>(false);

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
        <div
            className={`fixed top-6 md:right-6 z-50 flex min-w-81 max-w-100 items-start gap-4 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-4 shadow-xl transition-all duration-300 select-none
            ${isLeaving
                    ? "translate-x-12 opacity-0"
                    : "translate-x-0 opacity-100"
                }
            `}
        >
            <div className={`flex h-8 w-8 my-auto shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}>
                <FontAwesomeIcon
                    icon={alertIcons[alert.type]}
                    className={`text-sm ${styles.icon}`}
                />
            </div>

            <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold capitalize text-zinc-900 tracking-tight">
                    {alert.type === "danger" ? "Error" : alert.type}
                </p>
                <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                    {alert.msg}
                </p>
            </div>

            <Button
                variant="outline"
                onClick={handleClose}
                className="flex w-9 h-9 my-auto shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            >
                <FontAwesomeIcon icon={faX} />
            </Button>

            <div
                className={`absolute bottom-0 left-0 h-0.75 animate-progress opacity-80 ${styles.progress}`}
                style={{
                    animationDuration: `${autoHideDuration}ms`,
                }}
            />
        </div>
    );
}