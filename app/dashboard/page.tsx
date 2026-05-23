import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Tag, FileText, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  // Fetch stats
  const { count: logsCount } = await supabase
    .from("logs")
    .select("*", { count: "exact", head: true });

  const { count: topicsCount } = await supabase
    .from("topics")
    .select("*", { count: "exact", head: true });

  // Fetch recent logs
  const { data: recentLogs } = await supabase
    .from("logs")
    .select("id, date, title, summary")
    .order("date", { ascending: false })
    .limit(5);

  // Fetch popular topics
  const { data: popularTopics } = await supabase
    .from("topics")
    .select("id, name, slug, color, icon")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome back, Greg</h1>
        <p className="text-gray-400">Here's what's in your memory archive.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 backdrop-blur p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Logs</p>
              <p className="text-3xl font-bold">{logsCount || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Topics Tracked</p>
              <p className="text-3xl font-bold">{topicsCount || 0}</p>
            </div>
            <Tag className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">This Month</p>
              <p className="text-3xl font-bold">{logsCount || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Logs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Logs</h2>
            <Link href="/dashboard/logs" className="text-sm text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentLogs?.map((log) => (
              <Link
                key={log.id}
                href={`/dashboard/logs/${log.id}`}
                className="block p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{log.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{log.summary}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
            {(!recentLogs || recentLogs.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No logs yet. Start your first conversation!</p>
              </div>
            )}
          </div>
        </div>

        {/* Popular Topics */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Topics</h2>
            <Link href="/dashboard/topics" className="text-sm text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popularTopics?.map((topic) => (
              <Link
                key={topic.id}
                href={`/dashboard/topics/${topic.slug}`}
                className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: topic.color }}
                  />
                  <span className="font-medium">{topic.name}</span>
                </div>
              </Link>
            ))}
            {(!popularTopics || popularTopics.length === 0) && (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No topics yet. They'll appear as you log conversations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
