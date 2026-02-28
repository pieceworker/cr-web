"use client";

interface UserSetupProps {
    user: User | null;
    chapters: Chapter[];
}

import { usePathname } from "next/navigation";
import { User, Chapter } from "@/lib/db";
import ProfileForm from "./ProfileForm";

export default function UserSetup({ user, chapters }: UserSetupProps) {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) return null;
    if (!user) return null;

    // Logic: If critical fields are missing, show the modal.
    const hasLocation = !!user.location;
    const hasBio = !!user.bio;
    let hasChapters = false;
    try {
        const userChapters = user.chapters ? JSON.parse(user.chapters) : [];
        hasChapters = Array.isArray(userChapters) && userChapters.length > 0;
    } catch {
        hasChapters = false;
    }

    if (hasLocation && hasBio && hasChapters) {
        return null;
    }

    return (
        <div className="relative min-h-full">
            {/* Full-height backdrop */}
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] h-full pointer-events-auto" />

            {/* Sticky viewport-centered modal */}
            <div className="sticky top-0 h-[100dvh] flex items-center justify-center px-2 py-4 sm:p-4 pointer-events-none">
                <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg px-2 py-8 sm:p-8 border-4 border-red-600 shadow-2xl overflow-y-auto max-h-[90vh] pointer-events-auto">
                    <h2 className="text-3xl font-black uppercase italic text-red-600 mb-6 font-heading tracking-tighter">
                        Complete Your Profile
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-8 italic font-medium">
                        Welcome to the collective. To fully participate, please tell us where you are based and which chapter(s) you follow.
                    </p>

                    <ProfileForm user={user} chapters={chapters} isModal={true} />
                </div>
            </div>
        </div>
    );
}
