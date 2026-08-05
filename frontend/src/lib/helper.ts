import { useEffect, useState } from "react";

export function formatFullDateTime(dateString: string | Date) {
    if (!dateString) return "";
    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return `${formattedDate} • ${formattedTime}`;
};

export const getWordCountDetails = (text?: string) => {
    if (!text || text.trim() === "") {
        return { wordCount: 0, formattedCount: "0" };
    }

    const wordCount = text.trim().split(/\s+/).length;

    return {
        wordCount,
        formattedCount: wordCount.toLocaleString("en-IN")
    };
};

export function isUpdated(item: {
    createdAt: string | Date;
    updatedAt?: string | Date | null;
}): boolean {
    if (!item.updatedAt) return false;

    const created = new Date(item.createdAt).getTime();
    const updated = new Date(item.updatedAt).getTime();

    if (isNaN(created) || isNaN(updated)) return false;

    return updated > created;
};

export function useCurrentTime(intervalMs: number = 1000 * 60 * 60) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now());
        }, intervalMs);

        return () => clearInterval(timer);
    }, [intervalMs]);

    return now;
};

export function getRemainingDays(
    expireAt: string | Date | null | undefined,
    now: number
): number | null {
    if (!expireAt) return 0;

    const diff = new Date(expireAt).getTime() - now;
    if (diff <= 0) return null;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export function getTrashedDate(item: {
    trashedAt?: string | Date | null;
    updatedAt?: string | Date | null;
    createdAt: string | Date;
}): string {
    const date = item.trashedAt ?? item.updatedAt ?? item.createdAt;
    return formatFullDateTime(date);
};

export const isValidEmailStrict = (email: string | undefined | null): boolean => {
    if (!email || typeof email !== 'string') return false;

    const trimmedEmail = email.trim();

    if (trimmedEmail.length > 254) return false;

    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) return false;

    const [localPart, domain] = parts;

    if (localPart.length === 0 || localPart.length > 64) return false;

    if (domain.length === 0 || domain.length > 255) return false;

    if (
        trimmedEmail.includes('..') ||
        localPart.startsWith('.') ||
        localPart.endsWith('.') ||
        domain.startsWith('.') ||
        domain.endsWith('.')
    ) {
        return false;
    }

    const strictEmailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    return strictEmailRegex.test(trimmedEmail);
};

export const FOLDER_COLORS = [
    { id: 'none', bgClass: 'bg-zinc-50 border-2 border-dashed border-zinc-300' },
    { id: 'red', bgClass: 'bg-gradient-to-tr from-rose-500 to-rose-400 shadow-md shadow-rose-500/40' },
    { id: 'orange', bgClass: 'bg-gradient-to-tr from-orange-500 to-orange-400 shadow-md shadow-orange-500/40' },
    { id: 'yellow', bgClass: 'bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-md shadow-amber-500/40' },
    { id: 'green', bgClass: 'bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-md shadow-emerald-500/40' },
    { id: 'teal', bgClass: 'bg-gradient-to-tr from-teal-500 to-teal-400 shadow-md shadow-teal-500/40' },
    { id: 'blue', bgClass: 'bg-gradient-to-tr from-blue-500 to-blue-400 shadow-md shadow-blue-500/40' },
    { id: 'indigo', bgClass: 'bg-gradient-to-tr from-indigo-500 to-indigo-400 shadow-md shadow-indigo-500/40' },
    { id: 'purple', bgClass: 'bg-gradient-to-tr from-violet-500 to-violet-400 shadow-md shadow-violet-500/40' },
    { id: 'pink', bgClass: 'bg-gradient-to-tr from-pink-500 to-pink-400 shadow-md shadow-pink-500/40' },
];

export const getFolderBgClass = (color?: string | null) => {
    const folderColor = color || "none";

    switch (folderColor) {
        case 'red':
            return 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-500 ring-1 ring-inset ring-rose-500/20 group-hover/card:from-rose-100 group-hover/card:to-rose-200 group-hover/card:text-rose-600';
        case 'orange':
            return 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-500 ring-1 ring-inset ring-orange-500/20 group-hover/card:from-orange-100 group-hover/card:to-orange-200 group-hover/card:text-orange-600';
        case 'yellow':
            return 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-500 ring-1 ring-inset ring-amber-500/20 group-hover/card:from-amber-100 group-hover/card:to-amber-200 group-hover/card:text-amber-600';
        case 'green':
            return 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-500 ring-1 ring-inset ring-emerald-500/20 group-hover/card:from-emerald-100 group-hover/card:to-emerald-200 group-hover/card:text-emerald-600';
        case 'teal':
            return 'bg-gradient-to-br from-teal-50 to-teal-100 text-teal-500 ring-1 ring-inset ring-teal-500/20 group-hover/card:from-teal-100 group-hover/card:to-teal-200 group-hover/card:text-teal-600';
        case 'blue':
            return 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-500 ring-1 ring-inset ring-blue-500/20 group-hover/card:from-blue-100 group-hover/card:to-blue-200 group-hover/card:text-blue-600';
        case 'indigo':
            return 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-500 ring-1 ring-inset ring-indigo-500/20 group-hover/card:from-indigo-100 group-hover/card:to-indigo-200 group-hover/card:text-indigo-600';
        case 'purple':
            return 'bg-gradient-to-br from-violet-50 to-violet-100 text-violet-500 ring-1 ring-inset ring-violet-500/20 group-hover/card:from-violet-100 group-hover/card:to-violet-200 group-hover/card:text-violet-600';
        case 'pink':
            return 'bg-gradient-to-br from-pink-50 to-pink-100 text-pink-500 ring-1 ring-inset ring-pink-500/20 group-hover/card:from-pink-100 group-hover/card:to-pink-200 group-hover/card:text-pink-600';
        default:
            return 'bg-zinc-50 text-zinc-400 ring-1 ring-inset ring-zinc-300/50 group-hover/card:bg-zinc-100 group-hover/card:text-zinc-600';
    }
};