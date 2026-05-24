import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, Calendar } from "lucide-react";

export default async function TopicDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!topic) {
    notFound();
  }

  const { data: logs } = await supabase
    .from("logs")
    .select("id, date, title, summary, log_topics!inner(topic_id)")
    .eq("log_topics.topic_id", topic.id)
    .order("date", { ascending: false });

  const conversations = logs || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard/topics"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Topics
      </Link>

      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: topic.color }}
          />
          <span className="text-3xl">{topic.icon || "📁"}</span>
          <h1 className="text-2xl font-bold">{topic.name}</h1>
        </div>

        {topic.description && (
          <p className="text-gray-300 mb-6">{topic.description}</p>
        )}

        <div className="text-sm text-gray-400">
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""} on this topic
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Related Conversations</h2>
        <div className="space-y-3">
          {conversations.map((log: any) => (
            <Link
              key={log.id}
              href={`/dashboard/logs/${log.id}`}
              className="block p-5 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium group-hover:text-blue-400 transition-colors">
                    {log.title}
                  </h3>
                  {log.summary && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{log.summary}</p>
                  )}
                </div>
                <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  →
                </span>
              </div>
            </Link>
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-800/20 rounded-lg border border-gray-700">
              <p>No conversations logged for this topic yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
