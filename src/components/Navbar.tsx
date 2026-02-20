import Link from 'next/link';
import { auth, signIn, signOut } from "@/auth";
import { isAdmin } from "@/lib/db";

export default async function Navbar() {
  const session = await auth();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'Chapters', path: '/chapters' },
    { name: 'Directors', path: '/chapterdirectors' },
    { name: 'Artists', path: '/artists' },
    { name: 'Musicians', path: '/musicians' },
    { name: 'Donate', path: '/donate' },
    { name: 'Be Involved', path: '/be-involved' },
    { name: 'Media', path: '/media' },
  ];

  if (session) {
    navItems.push({ name: 'Account', path: '/account' });
    if (isAdmin(session.user?.email)) {
      navItems.push({ name: 'Admin', path: '/admin' });
    }
  }

  return (
    <nav className="flex flex-col lg:flex-row justify-between items-center p-6 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 gap-4 transition-colors">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tighter uppercase italic text-zinc-900 dark:text-white shrink-0 hover:opacity-80 transition-opacity"
        >
          Classical <span className="text-red-600">Revolution</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className="text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition-colors">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/account" className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-red-600 transition-colors">
                {session.user?.name}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="text-[10px] md:text-xs font-bold uppercase tracking-widest bg-zinc-900 text-white dark:bg-white dark:text-black py-2 px-4 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <button
                type="submit"
                className="text-[10px] md:text-xs font-bold uppercase tracking-widest bg-red-600 text-white py-2 px-4 hover:bg-red-700 transition-colors"
              >
                Login
              </button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}