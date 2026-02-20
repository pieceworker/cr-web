import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer'; // New import
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Classical Revolution | Chamber Music for the People',
	description: 'Bringing classical music to neighborhood hangouts since 2006.',
	icons: {
		icon: [
			{ url: '/favicon.ico' },
			{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
		],
		apple: [
			{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
		],
	},
};

import { auth } from "@/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { User, Chapter } from "@/lib/db";
import UserSetup from '@/components/UserSetup';

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	let user: User | null = null;
	let chapters: Chapter[] = [];

	if (session?.user?.email) {
		const { env } = await getCloudflareContext();
		const db = env.DB;
		user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(session.user.id).first() as User | null;
		const chaptersResult = await db.prepare("SELECT * FROM chapters").all();
		chapters = chaptersResult.results as unknown as Chapter[];
	}

	return (
		<html lang="en">
			<body className={`${inter.className} antialiased bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-screen flex flex-col transition-colors`}>
				<Navbar />
				<main className="w-full flex-grow grid grid-cols-1 grid-rows-1">
					<div className="col-start-1 row-start-1 z-0">
						{children}
					</div>
					<div className="col-start-1 row-start-1 z-40 pointer-events-none">
						<UserSetup user={user} chapters={chapters} />
					</div>
				</main>
				<Footer /> {/* Global Footer added here */}
			</body>
		</html>
	);
}