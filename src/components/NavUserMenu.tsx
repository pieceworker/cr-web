'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface NavItem {
    name: string;
    path: string;
}

interface NavUserMenuProps {
    session: { user?: { name?: string | null; email?: string | null; image?: string | null; id?: string } } | null;
    navItems: NavItem[];
    signOutAction: () => Promise<void>;
    signInAction: () => Promise<void>;
}

export default function NavUserMenu({ session, navItems, signOutAction, signInAction }: NavUserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative flex items-center gap-2" ref={menuRef}>
            {!session && (
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Not Logged In
                </span>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors py-2 px-4 ${session
                    ? "text-zinc-900 dark:text-white hover:text-red-600 border border-zinc-200 dark:border-zinc-800"
                    : "bg-red-600 text-white hover:bg-red-700"
                    }`}
            >
                {session ? (
                    <>
                        <span>{session.user?.name || 'User'}</span>
                        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </>
                ) : (
                    "Login"
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xl z-[60] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Navigation Items - Only visible on mobile in the layout, but let's decide how to filter */}
                    <div className="lg:hidden border-b border-zinc-100 dark:border-zinc-900 pb-2 mb-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-red-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {session ? (
                        <>
                            <Link
                                href="/account"
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            >
                                Settings
                            </Link>
                            <button
                                onClick={async () => {
                                    setIsOpen(false);
                                    await signOutAction();
                                }}
                                className="block w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={async () => {
                                setIsOpen(false);
                                await signInAction();
                            }}
                            className="block w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            Sign in with Google
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
