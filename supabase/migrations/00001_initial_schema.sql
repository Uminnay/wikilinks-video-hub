-- Schema definition for Wikilinks Video Hub

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- VIDEOS TABLE
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  youtube_video_id text,
  url text not null,
  title text not null,
  channel_name text,
  channel_id text,
  thumbnail_url text,
  duration_seconds integer,
  published_at timestamp with time zone,
  saved_at timestamp with time zone default now(),
  category text default 'Sin clasificar',
  status text default 'pending', -- pending | seen | discarded | notion_candidate
  priority text, -- high | medium | low
  content_type text,
  caducity_type text,
  personal_notes text,
  notion_status text default 'none', -- none | candidate | prepared | exported
  notion_page_url text,
  notion_title text,
  notion_channel text,
  notion_category text,
  notion_personal_note text,
  notion_related_project text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ACTIONS TABLE
create table public.actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  video_id uuid references public.videos(id) on delete set null,
  title text not null,
  description text,
  status text default 'pending', -- pending | in_progress | completed
  due_date date,
  related_project text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS POLICIES

-- Enable RLS
alter table public.videos enable row level security;
alter table public.actions enable row level security;

-- Policies for videos
create policy "Users can view their own videos."
  on public.videos for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own videos."
  on public.videos for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own videos."
  on public.videos for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own videos."
  on public.videos for delete
  using ( auth.uid() = user_id );

-- Policies for actions
create policy "Users can view their own actions."
  on public.actions for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own actions."
  on public.actions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own actions."
  on public.actions for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own actions."
  on public.actions for delete
  using ( auth.uid() = user_id );

-- Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_videos_updated_at
  before update on public.videos
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_actions_updated_at
  before update on public.actions
  for each row
  execute procedure public.handle_updated_at();
