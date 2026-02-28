"use client";

import Image from "next/image";
import Link from "next/link";
import { User, UnifiedRequest, Chapter } from "@/lib/db";
import { deleteUser, updateUser } from "@/lib/actions";
import ProfileForm from "@/components/ProfileForm";

const BUTTON_DANGER = "text-zinc-400 hover:text-red-600 font-bold uppercase text-[10px] tracking-widest transition-colors";
const SUMMARY = "cursor-pointer font-bold uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors list-none flex items-center gap-2";

interface UserCardProps {
    u: User;
    requests: UnifiedRequest[];
    chapters: Chapter[];
    isAdmin?: boolean;
}

export default function UserCard({ u, requests, chapters, isAdmin = false }: UserCardProps) {
    const pendingUserEdit = requests.find(r => r.type === 'USER_EDIT' && r.target_id === u.id);
    const pendingRoleRequest = requests.find(r => r.type === 'ROLE_CHANGE' && r.user_id === u.id);

    const mergedUser = { ...u };
    if (pendingUserEdit) {
        try {
            const data = JSON.parse(pendingUserEdit.data || '{}');
            Object.assign(mergedUser, data);
            if (Array.isArray(data.chapters)) mergedUser.chapters = JSON.stringify(data.chapters);
            if (Array.isArray(data.director_chapters)) mergedUser.director_chapters = JSON.stringify(data.director_chapters);
        } catch { }
    }
    if (pendingRoleRequest) {
        try {
            const data = JSON.parse(pendingRoleRequest.data || '{}');
            Object.assign(mergedUser, data);
            if (Array.isArray(data.chapters)) mergedUser.chapters = JSON.stringify(data.chapters);
            if (Array.isArray(data.director_chapters)) mergedUser.director_chapters = JSON.stringify(data.director_chapters);
        } catch { }
    }

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all group">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-red-600/20 overflow-hidden relative shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500">
                        {u.image && <Image src={u.image} alt={u.name || 'User'} fill className="object-cover" unoptimized />}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <Link href={`/profile/${u.id}`} className="hover:underline decoration-red-600 decoration-2 transition-all">
                                <p className="text-lg font-bold leading-tight break-words">{u.name}</p>
                            </Link>
                            {pendingUserEdit && <span className="bg-red-100 dark:bg-red-900/30 text-red-600 text-[8px] font-bold uppercase px-1.5 py-0.5 tracking-tighter">Edit Pending</span>}
                            {pendingRoleRequest && <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 text-[8px] font-bold uppercase px-1.5 py-0.5 tracking-tighter">Role Pending</span>}
                        </div>
                        <p className="text-xs text-zinc-500 font-medium italic break-all">{u.email}</p>
                        <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mt-0.5">{u.role}</p>
                    </div>
                </div>
                {isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {(!pendingUserEdit && !pendingRoleRequest) && (
                            <form action={deleteUser.bind(null, u.id)} className="flex-1">
                                <button className={`${BUTTON_DANGER} w-full h-full text-left sm:text-right px-0`}>Remove User</button>
                            </form>
                        )}
                    </div>
                )}
            </div>

            {pendingUserEdit && (
                <div className="mb-6 p-6 border-2 border-red-600 bg-red-50 dark:bg-red-900/10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-4 italic">Pending Profile Edit Request</h4>
                    <ProfileForm
                        user={mergedUser}
                        chapters={chapters}
                        action={updateUser}
                        isAdmin={isAdmin}
                        reviewRequestId={pendingUserEdit.id}
                    />
                </div>
            )}

            {pendingRoleRequest && !pendingUserEdit && (
                <div className="mb-6 p-6 border-2 border-red-600 bg-red-50 dark:bg-red-900/10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-4 italic">Pending Role Change Request</h4>
                    <ProfileForm
                        user={mergedUser}
                        chapters={chapters}
                        action={updateUser}
                        isAdmin={isAdmin}
                        reviewRequestId={pendingRoleRequest.id}
                    />
                </div>
            )}

            {!pendingUserEdit && !pendingRoleRequest && (
                <details className="group">
                    <summary className={SUMMARY}>
                        Edit User
                        <span className="group-open:rotate-180 transition-transform text-lg">▾</span>
                    </summary>
                    <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                        <ProfileForm
                            user={mergedUser}
                            chapters={chapters}
                            action={updateUser}
                            isAdmin={isAdmin}
                        />
                    </div>
                </details>
            )}
        </div>
    );
}
