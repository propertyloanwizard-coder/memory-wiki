"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DashboardHeader({ user }: { user: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    setSearchQuery(searchParams?.get("search") || "");
  }, [searchParams?.get("search")]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/logs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/dashboard/logs");
    }
  }

  return (
    <header className="bg-gray-800/80 backdrop-blur border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
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
            <Link href="/dashboard/artifacts" className="text-gray-400 hover:text-white transition-colors">
              Artifacts
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-64 px-4 py-1.5 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
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
