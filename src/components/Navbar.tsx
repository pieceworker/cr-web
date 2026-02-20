import Link from 'next/link';
import { auth, signIn, signOut } from "@/auth";
import { isAdmin } from "@/lib/db";
import NavUserMenu from './NavUserMenu';

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

  const handleSignIn = async () => {
    "use server";
    await signIn("google");
  };

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <nav className="flex flex-row justify-between items-center px-4 md:px-6 py-4 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors h-16 md:h-20">
      <div className="flex items-center gap-4 shrink-0">
        <Link
          href="/"
          className="text-lg md:text-xl font-bold tracking-tighter uppercase italic text-zinc-900 dark:text-white hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          Classical <span className="text-red-600">Revolution</span>
        </Link>
      </div>

      <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
        {/* Desktop Links - hidden on small screens */}
        <ul className="hidden lg:flex items-center gap-6 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <li key={item.path} className="shrink-0">
              <Link href={item.path} className="text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition-colors">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* User Status / Dropdown Trigger */}
        <div className="shrink-0 ml-auto">
          <NavUserMenu
            session={session}
            navItems={navItems}
            signInAction={handleSignIn}
            signOutAction={handleSignOut}
          />
        </div>
      </div>
    </nav>
  );
}