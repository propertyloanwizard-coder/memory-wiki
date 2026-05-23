"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Tag, Home, Plus } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/logs", label: "Daily Logs", icon: Calendar },
  { href: "/dashboard/topics", label: "Topics", icon: Tag },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800/50 border-r border-gray-700 min-h-[calc(100vh-73px)] p-4">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-500 mb-3 px-3">Quick Actions</h4>
        <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors w-full">
          <Plus className="w-5 h-5" />
          Add New Log
        </button>
      </div>
    </aside>
  );
}
