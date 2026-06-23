"use client";

import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();

  const initials = session?.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {session && (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">{session.user.name}</p>
              <span className={`text-xs font-medium
                ${session.user.role === "admin" ? "text-purple-600" : "text-gray-400"}`}>
                {session.user.role}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
