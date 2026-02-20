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
        <div className="relative flex items-center gap-4" ref={menuRef}>
            {/* Status Indicator */}
            {!session && (
                <span className="hidden sm:inline text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Not Logged In
                </span>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all py-2.5 px-5 rounded-sm ${session
                        ? "text-zinc-900 dark:text-white bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-red-600 dark:hover:border-red-600 hover:text-red-600"
                        : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-300"
                    }`}
            >
                {session ? (
                    <>
                        <span>{session.user?.name || 'User'}</span>
                        <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </>
                ) : (
                    <>
                        <span>Menu</span>
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl z-[60] py-3 animate-in fade-in slide-in-from-top-2 duration-200 scale-95 origin-top-right">
                    {/* Navigation Items - Unified for everyone */}
                    <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-3">
                        <p className="px-5 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Navigation</p>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsOpen(false)}
                                className="block px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-red-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Account actions */}
                    <div>
                        <p className="px-5 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{session ? 'Account' : 'Login'}</p>
                        {session ? (
                            <>
                                <Link
                                    href="/account"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    My Profile & Settings
                                </Link>
                                <button
                                    onClick={async () => {
                                        setIsOpen(false);
                                        await signOutAction();
                                    }}
                                    className="block w-full text-left px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={async () => {
                                    setIsOpen(false);
                                    await signInAction();
                                }}
                                className="block w-full text-left px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
