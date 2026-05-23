"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardHeader({ user }: { user: any }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="bg-gray-800/80 backdrop-blur border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Memory Wiki
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/logs" className="text-gray-400 hover:text-white transition-colors">
              Daily Logs
            </Link>
            <Link href="/dashboard/topics" className="text-gray-400 hover:text-white transition-colors">
              Topics
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 text-sm border border-gray-600 hover:border-gray-400 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
