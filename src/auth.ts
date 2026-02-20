import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { D1Adapter } from "@auth/d1-adapter";
import { User as DBUser } from "./lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
    const { env } = await getCloudflareContext();
    if (!env) throw new Error("Cloudflare Environment not found");

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
                if (session.user) {
                    (session.user as unknown as { id: string; role: string }).id = dbUser.id;
                    (session.user as unknown as { id: string; role: string }).role = dbUser.role;
                }
                return session;
            },
        },
    };
});
