import { useState, useEffect, useRef, FormEvent, Dispatch, SetStateAction } from 'react';
import { Button } from '../ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendar,
    faCalendarPlus,
    faPen,
    faCheck,
    faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { useFetchWithAuth } from '@/context/hooks/useFetchWithAuth';
import { formatFullDateTime, isValidEmailStrict } from '@/lib/helper';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt?: string;
}

interface UserProfileProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

export default function UserProfile({ showAlert, isOpen, setIsOpen }: UserProfileProps) {
    const { fetchWithAuth } = useFetchWithAuth();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (window.innerWidth < 768) return;

            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsEditing(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsOpen]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetchWithAuth(`${SERVER_URL}/api/auth/get-user`, {
                    method: 'POST',
                    credentials: 'include',
                });

                const data = await res.json();

                if (data.success) {
                    setUser(data.user);

                    setFormData({
                        name: data.user.name || "",
                        email: data.user.email || "",
                    });
                }
            } catch (err) {
                // showAlert("", "danger");
                console.error("Failed to fetch user:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [fetchWithAuth]);

    const getInitials = (name: string) => {
        if (!name) return "U"
            ;
        const parts = name.trim().split(/\s+/);

        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }

        return parts[0][0].toUpperCase();
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();

        if (!isValidEmailStrict(formData.email)) {
            showAlert("Please enter a valid email address.", "danger");
            return false;
        }

        const trimmedName = formData.name.trim();
        const trimmedEmail = formData.email.trim();

        if (!trimmedName) {
            showAlert("Name is mandatory", "danger");
            return;
        }
        if (!trimmedEmail) {
            showAlert("Email is mandatory", "danger");
            return;
        }

        if (user && trimmedName === user.name && trimmedEmail === user.email) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);

        try {
            const res = await fetchWithAuth(`${SERVER_URL}/api/auth/update-user`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: trimmedName,
                    email: trimmedEmail
                }),
            });

            const data = await res.json();

            if (data.success) {
                setUser(data.user);
                setIsEditing(false);
                showAlert("Profile updated successfully", "success");
            } else {
                const errorMessage = data.errors && data.errors.length > 0
                    ? data.errors[0].message
                    : data.message || data.error || "Failed to update profile";

                showAlert(errorMessage, "danger");
            }
        } catch (error) {
            console.log(error);
            showAlert("Network error occurred. Please check your connection.", "warning");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 border border-zinc-300"></div>
        );
    }

    if (!user) return null;

    const nameParts = user.name.split(" ");
    const displayFirstName = nameParts[0];
    const displayLastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const joinedStr = formatFullDateTime(user.createdAt);
    const updatedStr = user.updatedAt ? formatFullDateTime(user.updatedAt) : null;
    const showUpdated = updatedStr && updatedStr !== joinedStr;

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="hidden sm:flex items-center justify-center h-9 w-9 rounded-full border border-zinc-200 bg-white text-zinc-900 font-bold hover:bg-zinc-50 shadow-sm transition-all focus:ring-2 focus:ring-zinc-200 p-0 select-none cursor-pointer"
            >
                {getInitials(user.name)}
            </Button>

            {isOpen && (
                <div className="w-full sm:absolute sm:right-0 sm:mt-3.5 sm:w-85 rounded-2xl sm:border border-zinc-200 bg-white sm:p-5 sm:shadow-xl sm:z-50 sm:animate-in sm:fade-in sm:zoom-in-95 sm:duration-200">

                    {!isEditing ? (
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3.5 rounded-xl bg-zinc-50/80 p-3 border border-zinc-100 mb-2">
                                <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-lg font-bold text-zinc-800 shadow-sm select-none">
                                    {getInitials(user.name)}
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <h3 className="text-sm font-bold text-zinc-900 leading-tight truncate tracking-tight">
                                        {displayFirstName} {displayLastName}
                                    </h3>
                                    <p className="text-xs font-medium text-zinc-500 truncate mt-0.5">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-y border-zinc-100 py-3 my-2 select-none">
                                <div className="flex flex-col gap-1 w-1/2 pr-2">
                                    <span className="text-xxs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faCalendar} /> Joined
                                    </span>
                                    <time className="text-tiny font-bold text-zinc-700 leading-tight">
                                        {joinedStr}
                                    </time>
                                </div>

                                {showUpdated && (
                                    <>
                                        <div className="w-px h-8 bg-zinc-200 shrink-0" />
                                        <div className="flex flex-col gap-1 items-end w-1/2 pl-2 text-right">
                                            <span className="text-xxs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faCalendarPlus} /> Updated
                                            </span>
                                            <time className="text-tiny font-bold text-zinc-700 leading-tight">
                                                {updatedStr}
                                            </time>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                className="w-full gap-2 text-zinc-700 hover:text-zinc-900 font-semibold rounded-full cursor-pointer"
                                onClick={() => setIsEditing(true)}
                            >
                                <FontAwesomeIcon icon={faPen} className="text-xs" />
                                Edit Profile
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-zinc-900 tracking-tight select-none">
                                    Edit Information
                                </h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="name" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 placeholder:text-zinc-300 placeholder:select-none font-medium text-zinc-800"
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
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 placeholder:text-zinc-300 placeholder:select-none font-medium text-zinc-800"
                                        autoComplete='username'
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-2 pt-2 border-t border-zinc-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1 rounded-full text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                                    onClick={() => { setIsEditing(false); }}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 gap-2 cursor-pointer"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faCheck} className="text-sm" />
                                            Save
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}