import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { D1Adapter } from "@auth/d1-adapter";
import { User as DBUser } from "./lib/db";
import { env } from "cloudflare:workers";

const SF_CHAPTER_ID = "b3ce5de5-6c3b-4c10-8a8b-4750e5ea5f95";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
    return {
        adapter: D1Adapter(env.DB),
        providers: [
            Google({
                clientId: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                allowDangerousEmailAccountLinking: true,
            }),
        ],
        secret: env.AUTH_SECRET,
        trustHost: true,
        callbacks: {
            async session({ session, user }) {
                const dbUser = user as unknown as DBUser;
                const db = env.DB;

                if (dbUser?.id) {
                    const existing = await db.prepare("SELECT chapters, bio, location FROM users WHERE id = ?").bind(dbUser.id).first() as { chapters: string | null; bio: string | null; location: string | null } | null;
                    const needsInit = existing && (!existing.chapters || !existing.bio || !existing.location);
                    if (needsInit) {
                        const currentChaptersStr = existing?.chapters || null;
                        let userChapters = null;
                        try { userChapters = currentChaptersStr ? JSON.parse(currentChaptersStr) : []; } catch { userChapters = []; }
                        const hasChapters = Array.isArray(userChapters) && userChapters.length > 0;
                        const finalChapters = hasChapters ? currentChaptersStr : JSON.stringify([SF_CHAPTER_ID]);
                        await db.prepare("UPDATE users SET chapters = ?, bio = ?, location = ? WHERE id = ?").bind(
                            finalChapters,
                            existing?.bio || "",
                            existing?.location || null,
                            dbUser.id
                        ).run();
                    } else if (!existing) {
                        await db.prepare("INSERT INTO users (id, name, email, role, image, location, bio, chapters) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(
                            dbUser.id,
                            dbUser.name || session.user?.name || null,
                            dbUser.email || session.user?.email || null,
                            "Audience",
                            dbUser.image || session.user?.image || null,
                            null,
                            "",
                            JSON.stringify([SF_CHAPTER_ID])
                        ).run();
                    }
                }

                if (session.user) {
                    (session.user as unknown as { id: string; role: string }).id = dbUser.id;
                    (session.user as unknown as { id: string; role: string }).role = dbUser.role;
                }
                return session;
            },
        },
    };
});
