import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MediaItem } from "@/lib/db";
import MediaGallery from "@/components/MediaGallery";

export const dynamic = "force-dynamic";

async function getMediaItems() {
    const { env } = await getCloudflareContext();
    const db = env.DB;
    const res = await db.prepare("SELECT * FROM media_items ORDER BY created_at DESC").all();
    return res.results as unknown as MediaItem[];
}

export default async function MediaPage() {
    const items = await getMediaItems();

    return (
        <div className="flex flex-col gap-10 py-12 px-2 sm:px-6 max-w-6xl mx-auto transition-colors">
            <header className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black uppercase italic text-zinc-900 dark:text-white font-heading leading-none">
                    Media<br /><span className="text-red-600">Gallery</span>
                </h1>
                <p className="text-zinc-500 font-medium italic">Music in motion. Captured moments of the revolution.</p>
            </header>

            <MediaGallery items={items} />

            {/* Press Section */}
            <div className="mt-10 px-6 py-10 sm:p-10 bg-zinc-50 dark:bg-zinc-950 border-l-4 border-red-600 shadow-sm">
                <h3 className="text-xl font-bold uppercase italic mb-2 text-zinc-900 dark:text-white">
                    Featured Press
                </h3>
                <p className="text-zinc-600 dark:text-zinc-500 italic">
                    &ldquo;Classical Revolution is bringing chamber music back to its roots...&rdquo;
                    <span className="block mt-2 font-bold text-zinc-900 dark:text-zinc-400">&mdash; The New York Times</span>
                </p>
            </div>
        </div>
    );
}