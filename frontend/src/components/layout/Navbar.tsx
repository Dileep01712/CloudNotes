import { Dispatch, SetStateAction, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/context/useAuth";
import UserProfile from "./UserProfile";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarsStaggered, faX } from '@fortawesome/free-solid-svg-icons';

interface NavbarProps {
    mode: "note" | "folder" | "folderView";
    setMode: Dispatch<SetStateAction<"note" | "folder" | "folderView">>;
    showAlert: (
        msg: string,
        type: "success" | "danger" | "warning" | "info"
    ) => void;
}

interface NavLinkItem {
    name: string;
    to: string;
    originalPath: string;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function Navbar({ mode, setMode, showAlert }: NavbarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, signout } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks: NavLinkItem[] = [
        {
            name: "Home",
            to: isAuthenticated ? "/" : "/signin",
            originalPath: "/",
        },
        {
            name: "Trash",
            to: isAuthenticated ? "/trash" : "/signin",
            originalPath: "/trash",
        },
        {
            name: "About",
            to: "/about",
            originalPath: "/about",
        },
    ];

    const handleSignout = async () => {
        try {
            await fetch(`${SERVER_URL}/api/auth/signout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            signout();
            setMode("note");
            navigate('/signin');
        }
    };

    const logoTo = isAuthenticated ? "/" : "/signin";
    const isSignInActive = location.pathname === "/signin" || location.pathname === "/forgot-password";
    const isSignUpActive = location.pathname === "/signup";

    return (
        <div className="sticky top-0 z-50 w-full pt-6 bg-zinc-100">
            <header className="mx-auto max-w-7xl rounded-full border border-white/40 bg-white/50 shadow-lg">
                <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">

                    <Link
                        to={logoTo}
                        onClick={(e) => {
                            if (location.pathname === logoTo) {
                                e.preventDefault();
                            } else {
                                setMode("note");
                            }
                        }}
                        className="text-2xl font-black tracking-tight select-none text-black"
                    >
                        Cloud
                        <span className="text-zinc-400 font-semibold tracking-tight">
                            Notes
                        </span>
                    </Link>

                    <nav className="hidden sm:flex items-center gap-2">
                        {navLinks.map((link) => {
                            const isActive = (() => {
                                if (link.originalPath === "/" && mode === "folderView") {
                                    return true;
                                }
                                return location.pathname === link.originalPath;
                            })();
                            const isCurrentPath = location.pathname === link.to;

                            return (
                                <Link
                                    key={link.originalPath}
                                    to={link.to}
                                    onClick={(e) => {
                                        if (isCurrentPath) {
                                            e.preventDefault();
                                        } else {
                                            setMode("note");
                                        }
                                    }}
                                >
                                    <Button
                                        variant="ghost"
                                        className={`rounded-full px-5 transition-all duration-200 cursor-pointer font-medium 
                                            ${isActive
                                                ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                            }
                                        `}
                                    >
                                        {link.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* UNAUTHENTICATED STATE */}
                    {!isAuthenticated ? (
                        <div className="flex items-center">

                            {/* Unauthenticated Mobile Hamburger */}
                            <Button
                                variant="ghost"
                                className="sm:hidden p-2 text-zinc-700 hover:text-black cursor-pointer"
                                onClick={() => setIsMobileMenuOpen(true)}
                                aria-label="Open menu"
                            >
                                <FontAwesomeIcon icon={faBarsStaggered} size="lg" />
                            </Button>

                            {/* Unauthenticated Mobile Modal */}
                            {isMobileMenuOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:hidden">
                                    <div className="bg-white w-full rounded-2xl p-6 flex flex-col items-center gap-6 relative shadow-xl">

                                        <div className="w-full flex justify-end">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="w-9 h-9 text-zinc-400 hover:text-zinc-800 text-xl font-bold cursor-pointer p-1"
                                            >
                                                <FontAwesomeIcon icon={faX} />
                                            </Button>
                                        </div>

                                        <div className="sm:hidden flex flex-col w-full gap-3">
                                            {navLinks.map((link) => {
                                                const isCurrentPath = location.pathname === link.to;
                                                return (
                                                    <Link
                                                        key={link.originalPath}
                                                        to={link.to}
                                                        className="w-full"
                                                        onClick={(e) => {
                                                            if (isCurrentPath) {
                                                                e.preventDefault();
                                                            } else {
                                                                setMode("note");
                                                            }
                                                            setIsMobileMenuOpen(false);
                                                        }}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="w-full rounded-xl font-medium px-4 py-3 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                                                        >
                                                            {link.name}
                                                        </Button>
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        <hr className="sm:hidden w-full border-t border-zinc-200" />

                                        <div className="flex flex-col w-full gap-4 mt-2">
                                            <Link
                                                to="/signin"
                                                className="w-full"
                                                onClick={(e) => {
                                                    if (isSignInActive) e.preventDefault();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className={`w-full rounded-full cursor-pointer font-medium px-5 py-3 transition-all duration-200 
                                                        ${isSignInActive
                                                            ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                                            : "text-zinc-700 hover:bg-zinc-100 border-zinc-200"
                                                        }
                                                    `}
                                                >
                                                    Sign In
                                                </Button>
                                            </Link>

                                            <Link
                                                to="/signup"
                                                className="w-full"
                                                onClick={(e) => {
                                                    if (isSignUpActive) e.preventDefault();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className={`w-full rounded-full cursor-pointer font-medium px-5 py-3 transition-all duration-200 
                                                        ${isSignUpActive
                                                            ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                                            : "text-zinc-700 hover:bg-zinc-100 border-zinc-200"
                                                        }
                                                    `}
                                                >
                                                    Sign Up
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="hidden sm:flex items-center gap-2">
                                <Link
                                    to="/signin"
                                    onClick={(e) => { if (isSignInActive) e.preventDefault(); }}
                                >
                                    <Button
                                        variant="ghost"
                                        className={`rounded-full cursor-pointer font-medium px-5 transition-all duration-200 
                                            ${isSignInActive
                                                ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                            }
                                        `}
                                    >
                                        Sign In
                                    </Button>
                                </Link>

                                <Link
                                    to="/signup"
                                    onClick={(e) => { if (isSignUpActive) e.preventDefault(); }}
                                >
                                    <Button
                                        variant="ghost"
                                        className={`rounded-full cursor-pointer font-medium px-5 transition-all duration-200 
                                            ${isSignUpActive
                                                ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                            }
                                        `}
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        </div>

                    ) : (
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                className="sm:hidden p-2 text-zinc-700 hover:text-black cursor-pointer"
                                onClick={() => setIsMobileMenuOpen(true)}
                                aria-label="Open menu"
                            >
                                <FontAwesomeIcon icon={faBarsStaggered} size="lg" />
                            </Button>

                            <div className={`fixed inset-0 z-50 items-center justify-center bg-black/60 backdrop-blur-sm sm:hidden p-4 ${isMobileMenuOpen ? 'flex' : 'hidden'}`}>
                                <div className="bg-white w-full rounded-2xl p-6 flex flex-col items-center gap-5 relative shadow-xl">

                                    <div className="w-full flex justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="w-9 h-9 text-zinc-400 hover:text-zinc-800 text-xl font-bold cursor-pointer p-1"
                                        >
                                            <FontAwesomeIcon icon={faX} />
                                        </Button>
                                    </div>

                                    <div className="flex flex-col w-full gap-3">
                                        {navLinks.map((link) => {
                                            const isCurrentPath = location.pathname === link.to;
                                            return (
                                                <Link
                                                    key={link.originalPath}
                                                    to={link.to}
                                                    className="w-full"
                                                    onClick={(e) => {
                                                        if (isCurrentPath) {
                                                            e.preventDefault();
                                                        } else {
                                                            setMode("note");
                                                        }
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        className="w-full rounded-xl font-medium px-4 py-3 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                                                    >
                                                        {link.name}
                                                    </Button>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    <hr className="w-full border-t border-zinc-200" />

                                    {/* 2. Mobile Profile Section */}
                                    <div className="w-full flex flex-col items-center">
                                        <UserProfile
                                            showAlert={showAlert}
                                            isOpen={true}
                                            setIsOpen={() => { }}
                                        />
                                    </div>

                                    <hr className="w-full border-t border-zinc-200" />

                                    {/* 3. Mobile Sign Out Button */}
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            handleSignout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full rounded-full cursor-pointer font-medium px-5 py-3 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            </div>

                            {/* Authenticated Desktop Profile & Sign Out */}
                            <div className="hidden sm:flex items-center gap-4">
                                <UserProfile showAlert={showAlert} isOpen={isOpen} setIsOpen={setIsOpen} />

                                <Button
                                    variant="outline"
                                    onClick={handleSignout}
                                    className="rounded-full cursor-pointer font-medium px-5"
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </header >
        </div >
    );
}