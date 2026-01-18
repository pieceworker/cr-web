import Link from 'next/link';

export default async function Navbar() {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Concerts', path: '/concerts' },
    { name: 'Donate', path: '/donate' },
    { name: 'Be Involved', path: '/be-involved' },
    { name: 'Media', path: '/media' },
  ];

  return (
    <nav className="flex flex-col lg:flex-row justify-between items-center p-6 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 gap-4 transition-colors">
      <Link
        href="/"
        className="text-xl font-bold tracking-tighter uppercase italic text-zinc-900 dark:text-white shrink-0 hover:opacity-80 transition-opacity"
      >
        Classical <span className="text-red-600">Revolution</span>
      </Link>

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
      </div>
    </nav>
  );
}