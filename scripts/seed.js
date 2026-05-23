const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Check if tables exist by querying one
async function seed() {
  console.log('Connecting to Supabase...');
  
  // Create a temp user if needed, or use service role to bypass RLS
  // Since we're using service_role, we can insert directly. 
  // However, we need a user_id. Let's create a dummy user or check if one exists.
  
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) console.error('User list error:', userError);
  
  let userId;
  if (users.users.length > 0) {
    userId = users.users[0].id;
    console.log(`Using existing user: ${users.users[0].email}`);
  } else {
    console.log('No users found. Please create a user in Supabase Auth first.');
    console.log('Go to: Authentication -> Users -> Add User');
    process.exit(1);
  }

  // Seed Topics
  const topics = [
    { name: "PA Business Compliance", slug: "pa-business-compliance", description: "PA annual report filing service, Act 122 rules", color: "#3b82f6", icon: "🏛️" },
    { name: "Key My Ride", slug: "key-my-ride", description: "Automotive locksmith business", color: "#f59e0b", icon: "🔑" },
    { name: "Sports Betting", slug: "sports-betting", description: "NBA/NHL betting analysis, sharp betting workflow", color: "#10b981", icon: "🏀" },
    { name: "AI Tools & Agents", slug: "ai-tools-agents", description: "AI browser agents, automation tools", color: "#8b5cf6", icon: "🤖" },
    { name: "Hermes Agent", slug: "hermes-agent", description: "Hermes AI configuration, skills, cron jobs", color: "#ef4444", icon: "⚡" },
    { name: "SaaS Development", slug: "saas-development", description: "Building SaaS products, Next.js, Supabase", color: "#06b6d4", icon: "💻" },
  ];

  console.log('Seeding topics...');
  const topicRecords = [];
  for (const t of topics) {
    // Check if exists
    const { data: existing } = await supabase.from('topics').select('id').eq('user_id', userId).eq('slug', t.slug).single();
    if (!existing) {
      const { data, error } = await supabase.from('topics').insert({ ...t, user_id: userId }).select().single();
      if (error) console.error('Topic error:', error);
      else topicRecords.push(data);
    } else {
      topicRecords.push(existing);
    }
  }
  console.log(`Seeded ${topicRecords.length} topics.`);

  // Seed Logs
  const logs = [
    {
      date: "2026-05-23",
      title: "Memory Wiki — Building Conversation Archive",
      summary: "User wants a personal wiki site to archive all daily conversations with Hermes. Started building with Next.js 14 + Supabase + Vercel.",
      content: "## Session Summary\nBuilt the entire Memory Wiki app structure...",
      topics: ["SaaS Development", "Hermes Agent"],
      platform: "discord",
    },
    {
      date: "2026-05-23",
      title: "Sports Betting — Cavs vs Knicks G3",
      summary: "Cross-referenced Perplexity slate analysis. CLE 1H -2.5 fired.",
      content: "## Session Summary\nUser locked in CLE 1H -2.5 at -110 for 1u.",
      topics: ["Sports Betting"],
      platform: "discord",
    },
    {
      date: "2026-05-22",
      title: "PA Compliance — Email Notification Setup",
      summary: "Worked on Resend integration. Kimi WebBridge install discussion.",
      content: "## Session Summary\nResend email setup for PA Compliance SaaS.",
      topics: ["PA Business Compliance", "AI Tools & Agents"],
      platform: "discord",
    }
  ];

  console.log('Seeding logs...');
  for (const log of logs) {
    const { data: newLog, error: logError } = await supabase.from('logs').insert({
      user_id: userId,
      date: log.date,
      title: log.title,
      summary: log.summary,
      content: log.content,
      platform: log.platform
    }).select().single();

    if (logError) {
      console.error('Log error:', logError);
      continue;
    }

    // Link topics
    const topicNames = log.topics || [];
    for (const tName of topicNames) {
      const topic = topicRecords.find(t => t.name === tName);
      if (topic) {
        await supabase.from('log_topics').insert({ log_id: newLog.id, topic_id: topic.id });
      }
    }
  }
  console.log('Seeding complete!');
}

seed();
