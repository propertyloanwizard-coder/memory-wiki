import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

export default async function LogDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: log } = await supabase
    .from("logs")
    .select("*, topics:log_topics(topic:topics(id, name, slug, color, icon))")
    .eq("id", params.id)
    .single();

  if (!log) {
    notFound();
  }

  const topics = log.topics?.map((lt: any) => lt.topic) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard/logs"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Logs
      </Link>

      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-400">
            {new Date(log.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-3">{log.title}</h1>

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {topics.map((topic: any) => (
              <Link
                key={topic.id}
                href={`/dashboard/topics/${topic.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: `${topic.color}20`,
                  color: topic.color,
                  border: `1px solid ${topic.color}40`,
                }}
              >
                <Tag className="w-3 h-3" />
                {topic.name}
              </Link>
            ))}
          </div>
        )}

        {log.summary && (
          <p className="text-gray-300 mb-6 p-4 bg-gray-800/50 rounded-lg border-l-4 border-blue-500">
            {log.summary}
          </p>
        )}

        {log.content && (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {log.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
