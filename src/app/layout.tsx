import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer'; // New import
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Classical Revolution | Chamber Music for the People',
	description: 'Bringing classical music to neighborhood hangouts since 2006.',
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${inter.className} antialiased bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-screen flex flex-col transition-colors`}>
				<Navbar />
				<main className="w-full flex-grow">
					{children}
				</main>
				<Footer /> {/* Global Footer added here */}
			</body>
		</html>
	);
}