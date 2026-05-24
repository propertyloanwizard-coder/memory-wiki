-- Memory Wiki: Attachments + Storage Migration
-- Run this ENTIRE file in Supabase Dashboard > SQL Editor

-- =========================
-- 1. ATTACHMENTS TABLE
-- =========================
create table if not exists attachments (
    id uuid default uuid_generate_v4() primary key,
    log_id uuid references logs(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade not null,
    file_name text not null,
    file_type text default 'image',
    file_url text not null,
    thumbnail_url text,
    description text,
    file_size bigint,
    created_at timestamp with time zone default now()
);

alter table attachments enable row level security;

create policy "Users can view own attachments"
    on attachments for select using (auth.uid() = user_id);

create policy "Users can create own attachments"
    on attachments for insert
    with check (auth.uid() = user_id);

create policy "Users can delete own attachments"
    on attachments for delete
    using (auth.uid() = user_id);

create index if not exists idx_attachments_search
    on attachments using gin(to_tsvector('english', coalesce(description, '') || ' ' || coalesce(file_name, '')));

-- =========================
-- 2. STORAGE BUCKET POLICIES
-- The 'artifacts' bucket should already exist (created via API).
-- These policies control access to stored files.
-- =========================

-- Allow authenticated users to upload
create policy "Authenticated users can upload to artifacts"
    on storage.objects for insert
    with check (
        bucket_id = 'artifacts'
        and auth.role() = 'authenticated'
    );

-- Allow authenticated users to delete their own uploads
create policy "Users can delete own uploads"
    on storage.objects for delete
    using (
        bucket_id = 'artifacts'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public read access (bucket is public)
create policy "Public can view artifacts"
    on storage.objects for select
    using (bucket_id = 'artifacts');

-- =========================
-- 3. VERIFY
-- =========================
select 'attachments table created' as status;
