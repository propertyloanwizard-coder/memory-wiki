-- Memory Wiki Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================
-- PROFILES (auto-created on signup)
-- =========================
create table profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    email text,
    created_at timestamp with time zone default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
    insert into profiles (id, email)
    values (new.id, new.email);
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure handle_new_user();

-- =========================
-- LOGS (daily conversation sessions)
-- =========================
create table logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    date date not null,
    title text not null,
    summary text,
    content text,  -- full markdown conversation log
    platform text default 'discord',  -- discord, telegram, etc.
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- =========================
-- TOPICS (subject categories)
-- =========================
create table topics (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    slug text not null,
    description text,
    color text default '#3b82f6',  -- Tailwind-compatible color
    icon text,  -- emoji or lucide icon name
    created_at timestamp with time zone default now()
);

-- Unique slug per user
create unique index idx_topics_user_slug on topics(user_id, slug);

-- =========================
-- LOG_TOPICS (many-to-many relationship)
-- =========================
create table log_topics (
    id uuid default uuid_generate_v4() primary key,
    log_id uuid references logs(id) on delete cascade not null,
    topic_id uuid references topics(id) on delete cascade not null,
    created_at timestamp with time zone default now()
);

create unique index idx_log_topics_unique on log_topics(log_id, topic_id);

-- =========================
-- FILES (tracked files/artifacts from conversations)
-- =========================
create table files (
    id uuid default uuid_generate_v4() primary key,
    log_id uuid references logs(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade not null,
    path text not null,
    description text,
    status text default 'modified',  -- created, modified, deleted
    created_at timestamp with time zone default now()
);

-- =========================
-- DECISIONS (key decisions made in conversations)
-- =========================
create table decisions (
    id uuid default uuid_generate_v4() primary key,
    log_id uuid references logs(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    description text,
    rationale text,
    status text default 'active',  -- active, pending, superseded
    created_at timestamp with time zone default now()
);

-- =========================
-- RLS POLICIES
-- =========================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table logs enable row level security;
alter table topics enable row level security;
alter table log_topics enable row level security;
alter table files enable row level security;
alter table decisions enable row level security;

-- Profiles: users can only see their own
create policy "Users can view own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);

-- Logs: users can only see their own logs
create policy "Users can view own logs"
    on logs for select
    using (auth.uid() = user_id);

create policy "Users can create own logs"
    on logs for insert
    with check (auth.uid() = user_id);

create policy "Users can update own logs"
    on logs for update
    using (auth.uid() = user_id);

create policy "Users can delete own logs"
    on logs for delete
    using (auth.uid() = user_id);

-- Topics: users can only see their own topics
create policy "Users can view own topics"
    on topics for select
    using (auth.uid() = user_id);

create policy "Users can create own topics"
    on topics for insert
    with check (auth.uid() = user_id);

create policy "Users can update own topics"
    on topics for update
    using (auth.uid() = user_id);

create policy "Users can delete own topics"
    on topics for delete
    using (auth.uid() = user_id);

-- Log Topics: users can only see their own relationships
create policy "Users can view own log topics"
    on log_topics for select
    using (
        exists (
            select 1 from logs
            where logs.id = log_topics.log_id
            and logs.user_id = auth.uid()
        )
    );

create policy "Users can create own log topics"
    on log_topics for insert
    with check (
        exists (
            select 1 from logs
            where logs.id = log_topics.log_id
            and logs.user_id = auth.uid()
        )
    );

-- Files: users can only see their own files
create policy "Users can view own files"
    on files for select
    using (auth.uid() = user_id);

create policy "Users can create own files"
    on files for insert
    with check (auth.uid() = user_id);

-- Decisions: users can only see their own decisions
create policy "Users can view own decisions"
    on decisions for select
    using (auth.uid() = user_id);

create policy "Users can create own decisions"
    on decisions for insert
    with check (auth.uid() = user_id);

-- =========================
-- SEED DATA (sample topics)
-- =========================

-- Insert sample topics (user_id will be set after first login)
-- These are common topics we discuss
