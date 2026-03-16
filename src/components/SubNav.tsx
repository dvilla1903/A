'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
}

interface SubNavProps {
  items: NavItem[];
}

export default function SubNav({ items }: SubNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 mb-8 border-b border-[#1a1a1a] pb-3">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${active
                ? 'bg-[#22c55e]/10 text-[#22c55e]'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]'
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
