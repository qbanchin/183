-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Trips table
create table if not exists public.trips (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  location    text not null check (location in ('colombia', 'outside')),
  start_date  date not null,
  end_date    date not null,
  note        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  constraint valid_dates check (end_date >= start_date)
);

-- Index for fast per-user queries
create index if not exists trips_user_id_idx on public.trips(user_id);
create index if not exists trips_start_date_idx on public.trips(start_date);

-- Row Level Security: users can only see/modify their own trips
alter table public.trips enable row level security;

create policy "Users can read own trips"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trips"
  on public.trips for update
  using (auth.uid() = user_id);

create policy "Users can delete own trips"
  on public.trips for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_trips_updated
  before update on public.trips
  for each row execute function public.handle_updated_at();
