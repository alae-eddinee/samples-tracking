"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, ShieldCheck } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const items = navItems.filter((i) => !i.adminOnly || session?.user.role === "admin");

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-gray-900 z-40 flex flex-col transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="text-white font-bold text-lg tracking-tight">SampleTrack</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {session && (
          <div className="px-5 py-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium
              ${session.user.role === "admin" ? "bg-purple-900 text-purple-300" : "bg-gray-800 text-gray-400"}`}>
              {session.user.role}
            </span>
          </div>
        )}
      </aside>
    </>
  );
}
