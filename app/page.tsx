import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Memory Wiki
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Your personal archive of daily conversations, decisions, and work with Hermes AI.
          Every session logged. Every topic indexed. Every decision preserved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
          <a
            href="#features"
            className="px-6 py-3 border border-gray-600 hover:border-gray-400 rounded-lg font-medium transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur p-6 rounded-xl border border-gray-700">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Daily Logs</h3>
            <p className="text-gray-400">
              Every conversation session is archived with date, summary, and full transcript.
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur p-6 rounded-xl border border-gray-700">
            <div className="text-3xl mb-4">🏷️</div>
            <h3 className="text-xl font-bold mb-2">Topic Index</h3>
            <p className="text-gray-400">
              Click any topic — PA Compliance, Betting, AI Tools — to see all related conversations.
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur p-6 rounded-xl border border-gray-700">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Search & Filter</h3>
            <p className="text-gray-400">
              Find anything instantly. Search by topic, date, or keyword across your entire archive.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 text-sm">
        Built with Next.js + Supabase + Hermes AI
      </div>
    </div>
  );
}
