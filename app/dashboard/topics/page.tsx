import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Tag } from "lucide-react";

export default async function TopicsPage() {
  const supabase = createClient();

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Topics</h1>
        <span className="text-sm text-gray-400">{topics?.length || 0} topics</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics?.map((topic) => (
          <Link
            key={topic.id}
            href={`/dashboard/topics/${topic.slug}`}
            className="p-5 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: topic.color }}
              />
              <span className="text-2xl">{topic.icon || "📁"}</span>
              <h3 className="text-lg font-medium group-hover:text-blue-400 transition-colors">
                {topic.name}
              </h3>
            </div>
            {topic.description && (
              <p className="text-sm text-gray-400 line-clamp-2">{topic.description}</p>
            )}
          </Link>
        ))}

        {(!topics || topics.length === 0) && (
          <div className="col-span-full text-center py-16 text-gray-500 bg-gray-800/20 rounded-lg border border-gray-700">
            <Tag className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">No topics yet</h3>
            <p className="text-sm">Topics will be created as you log conversations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
