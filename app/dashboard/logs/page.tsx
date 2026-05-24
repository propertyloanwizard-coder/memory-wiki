import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Search } from "lucide-react";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const supabase = createClient();
  const searchQuery = searchParams.search || "";

  // Build query
  let query = supabase
    .from("logs")
    .select("id, date, title, summary, platform, content")
    .order("date", { ascending: false });

  // Apply search filter if present
  if (searchQuery) {
    const { data: logs, error } = await supabase
      .from("logs")
      .select("id, date, title, summary, platform, content")
      .or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      .order("date", { ascending: false });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Search Results</h1>
            <p className="text-sm text-gray-400 mt-1">
              {logs?.length || 0} results for &quot;{searchQuery}&quot;
            </p>
          </div>
          <Link href="/dashboard/logs" className="text-sm text-blue-400 hover:text-blue-300">
            Clear search →
          </Link>
        </div>

        <div className="space-y-3">
          {logs?.map((log) => (
            <Link
              key={log.id}
              href={`/dashboard/logs/${log.id}`}
              className="block p-5 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
                      {log.platform}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium group-hover:text-blue-400 transition-colors">
                    {log.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{log.summary}</p>
                </div>
                <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  →
                </span>
              </div>
            </Link>
          ))}

          {(!logs || logs.length === 0) && (
            <div className="text-center py-16 text-gray-500 bg-gray-800/20 rounded-lg border border-gray-700">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-sm">Try different keywords or check your spelling.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No search query — show all logs
  const { data: logs } = await query;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daily Logs</h1>
        <span className="text-sm text-gray-400">{logs?.length || 0} total logs</span>
      </div>

      <div className="space-y-3">
        {logs?.map((log) => (
          <Link
            key={log.id}
            href={`/dashboard/logs/${log.id}`}
            className="block p-5 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">
                    {new Date(log.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
                    {log.platform}
                  </span>
                </div>
                <h3 className="text-lg font-medium group-hover:text-blue-400 transition-colors">
                  {log.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{log.summary}</p>
              </div>
              <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                →
              </span>
            </div>
          </Link>
        ))}

        {(!logs || logs.length === 0) && (
          <div className="text-center py-16 text-gray-500 bg-gray-800/20 rounded-lg border border-gray-700">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">No logs yet</h3>
            <p className="text-sm">Your daily conversations will appear here as you log them.</p>
          </div>
        )}
      </div>
    </div>
  );
}
