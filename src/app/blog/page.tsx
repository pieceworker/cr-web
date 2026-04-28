import { env } from "cloudflare:workers";
import { BlogPost, User, isAdmin } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import ReactMarkdown from 'react-markdown';

export const dynamic = "force-dynamic";

async function getBlogData() {
    
    const db = env.DB;
    
    // Fetch posts and authors
    const postsRes = await db.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC").all();
    const posts = postsRes.results as unknown as BlogPost[];
    
    const usersRes = await db.prepare("SELECT id, name, image FROM users WHERE id IN (SELECT author_id FROM blog_posts)").all();
    const users = usersRes.results as unknown as User[];

    return { posts, users };
}

export default async function BlogPage() {
    const session = await auth();
    const { posts, users } = await getBlogData();
    const userRole = (session?.user as { role?: string })?.role;
    const canCreatePost = isAdmin(session?.user?.email) || userRole === 'Chapter Director';

    return (
        <div className="max-w-4xl mx-auto py-12 px-2 sm:px-6 space-y-12">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-4 border-black dark:border-white pb-6">
                <div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic text-zinc-900 dark:text-white font-heading leading-none">
                        The <span className="text-red-600">Revolution</span><br/>Diaries
                    </h1>
                    <p className="text-zinc-500 font-medium italic mt-2">Tales, essays, and updates from the frontline.</p>
                </div>
                {canCreatePost && (
                    <Link href="/blog/new" className="bg-red-600 text-white font-bold uppercase py-3 px-6 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all text-sm tracking-widest active:scale-[0.98]">
                        Draft New Post
                    </Link>
                )}
            </header>

            <div className="grid gap-16">
                {posts.map(post => {
                    const author = users.find(u => u.id === post.author_id);
                    
                    return (
                        <article key={post.id} className="group relative border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col md:flex-row shadow-sm hover:border-red-600 transition-all duration-300">
                            {post.image && (
                                <div className="w-full md:w-1/3 aspect-video md:aspect-auto relative grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
                                    <Image src={post.image} alt={post.title} fill className="object-cover" unoptimized />
                                </div>
                            )}
                            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full border border-red-200 relative overflow-hidden">
                                            {author?.image && <Image src={author.image} alt={author.name || 'Author'} fill unoptimized />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">{author?.name}</p>
                                            <p className="text-[10px] uppercase font-bold text-zinc-400">{new Date(post.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    
                                    <Link href={`/blog/${post.id}`} className="group-hover:text-red-600 transition-colors">
                                        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">{post.title}</h2>
                                    </Link>
                                    
                                    <div className="prose prose-zinc dark:prose-invert prose-sm line-clamp-3 italic mb-6 prose-headings:text-base prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:italic prose-headings:font-heading prose-a:hidden prose-img:hidden">
                                        <ReactMarkdown>{post.body}</ReactMarkdown>
                                    </div>
                                </div>
                                
                                <Link 
                                    href={`/blog/${post.id}`} 
                                    className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white border-b-2 border-transparent hover:border-red-600 mt-auto transition-all w-fit"
                                >
                                    Read Full Entry ↗
                                </Link>
                            </div>
                        </article>
                    );
                })}

                {posts.length === 0 && (
                    <div className="text-center py-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <p className="text-zinc-500 italic uppercase tracking-widest text-sm">The diaries are currently entirely empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
