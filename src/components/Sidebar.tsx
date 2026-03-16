'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Building2,
  Settings,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/personal', label: 'Personal', icon: User },
  { href: '/business', label: 'Business', icon: Building2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[72px] bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col items-center py-6 z-50">
      <div className="mb-10 flex flex-col items-center gap-1">
        <div className="w-9 h-9 rounded-lg bg-[#22c55e] flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
        <span className="text-[9px] text-zinc-500 font-medium tracking-wider uppercase mt-1">
          Finanz
        </span>
      </div>

      <nav className="flex flex-col items-center gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200
                ${active
                  ? 'bg-[#22c55e]/10 text-[#22c55e]'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]'
                }
              `}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/settings"
        className={`
          flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200
          ${pathname === '/settings'
            ? 'bg-[#22c55e]/10 text-[#22c55e]'
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]'
          }
        `}
      >
        <Settings className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Settings</span>
      </Link>
    </aside>
  );
}
