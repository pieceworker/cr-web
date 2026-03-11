import { getCloudflareContext } from "@opennextjs/cloudflare";
import { BlogPost, User, isAdmin } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import { auth } from "@/auth";
import { deleteBlogPost } from "@/lib/actions";
import BlogForm from "@/components/BlogForm";

export const dynamic = "force-dynamic";

async function getPostData(id: string) {
    const { env } = await getCloudflareContext();
    const db = env.DB;
    
    const postRes = await db.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(id).first();
    const post = postRes as unknown as BlogPost | null;
    
    if (!post) return { post: null, author: null };

    const authorRes = await db.prepare("SELECT id, name, image FROM users WHERE id = ?").bind(post.author_id).first();
    const author = authorRes as unknown as User | null;

    return { post, author };
}

export default async function BlogPostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { post, author } = await getPostData(params.id);
    const session = await auth();

    if (!post) notFound();

    const isAuthor = session?.user?.id === post.author_id;
    const isGlobalAdmin = isAdmin(session?.user?.email);
    const canEdit = isAuthor || isGlobalAdmin;

    return (
        <article className="max-w-4xl mx-auto py-12 px-2 sm:px-6 space-y-12">
            <header className="space-y-6 text-center border-b-4 border-black dark:border-white pb-12">
                <div className="flex justify-center items-center gap-3">
                    <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1">
                        {new Date(post.created_at).toLocaleDateString()}
                    </div>
                </div>
                
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter leading-none text-zinc-900 dark:text-white font-heading">
                    {post.title}
                </h1>
                
                <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="w-10 h-10 rounded-full border-2 border-red-600 relative overflow-hidden grayscale-[0.5]">
                        {author?.image && <Image src={author.image} alt={author.name || 'Author'} fill className="object-cover" unoptimized />}
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Written By</p>
                        <p className="text-sm font-bold text-red-600 uppercase tracking-tighter">{author?.name}</p>
                    </div>
                </div>
            </header>

            {post.image && (
                <div className="w-full aspect-video md:aspect-[21/9] relative border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-zinc-100 dark:bg-zinc-900 grayscale-[0.2] hover:grayscale-0 transition-all duration-700">
                    <Image src={post.image} alt={post.title} fill className="object-cover" unoptimized priority />
                </div>
            )}

            <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:italic prose-headings:font-heading prose-a:text-red-600 hover:prose-a:text-black dark:hover:prose-a:text-white prose-a:transition-colors prose-img:border prose-img:border-zinc-200 dark:prose-img:border-zinc-800 prose-img:grayscale-[0.2] hover:prose-img:grayscale-0 prose-img:transition-all prose-img:duration-700">
                <ReactMarkdown>{post.body}</ReactMarkdown>
            </div>

            {canEdit && (
                <div className="mt-24 border-t-4 border-red-600 pt-12">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 font-heading text-red-600">Author Area</h3>
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 mb-8">
                        <BlogForm post={post} />
                    </div>
                    
                    <form action={deleteBlogPost.bind(null, post.id)} className="flex justify-end">
                        <button className="text-xs font-black uppercase tracking-widest text-red-600 hover:underline">
                            Delete Entry
                        </button>
                    </form>
                </div>
            )}
        </article>
    );
}
