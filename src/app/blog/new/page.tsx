import { auth } from "@/auth";
import { isAdmin } from "@/lib/db";
import { redirect } from "next/navigation";
import BlogForm from "@/components/BlogForm";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
    const session = await auth();
    const userRole = (session?.user as { role?: string })?.role;
    
    if (!isAdmin(session?.user?.email) && userRole !== 'Chapter Director') {
        redirect("/blog");
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-2 sm:px-6 space-y-12">
            <header className="border-b-4 border-red-600 pb-6">
                <h1 className="text-5xl md:text-6xl font-black uppercase italic text-zinc-900 dark:text-white font-heading leading-none">
                    Draft <span className="text-red-600">Entry</span>
                </h1>
                <p className="text-zinc-500 font-medium italic mt-2">Share your experiences and updates with the community.</p>
            </header>

            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10">
                <BlogForm />
            </div>
        </div>
    );
}
