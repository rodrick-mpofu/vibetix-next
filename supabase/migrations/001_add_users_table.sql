-- Migration: Add Users table and Flowglad integration
-- This migration adds a proper users table to replace the host_email field
-- and integrates with Flowglad for billing management

-- Create users table
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- User details
  email text unique not null,
  name text,

  -- Flowglad integration
  -- Optional: Store Flowglad customer ID for faster lookups
  -- Note: Flowglad is the source of truth for billing
  flowglad_customer_id text,

  -- Metadata
  metadata jsonb default '{}'::jsonb
);

-- Add user_id column to events table
alter table public.events add column user_id uuid references public.users(id) on delete cascade;

-- Migrate existing host_email data to users
-- This will create user records from existing host emails in events
insert into public.users (email)
select distinct host_email
from public.events
where host_email is not null
on conflict (email) do nothing;

-- Update events to reference users
update public.events
set user_id = users.id
from public.users
where events.host_email = users.email;

-- Make user_id required now that data is migrated
alter table public.events alter column user_id set not null;

-- Keep host_email for backwards compatibility but make it nullable
-- You can remove this column later after updating all code
alter table public.events alter column host_email drop not null;

-- Create indexes
create index users_email_idx on public.users(email);
create index users_flowglad_customer_id_idx on public.users(flowglad_customer_id);
create index events_user_id_idx on public.events(user_id);

-- Enable RLS on users table
alter table public.users enable row level security;

-- Users: Users can read their own profile
create policy "Users can view their own profile"
  on public.users for select
  using (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users: Users can update their own profile
create policy "Users can update their own profile"
  on public.users for update
  using (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Events: Users can view their own events (draft or published)
create policy "Users can view their own events"
  on public.events for select
  using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Trigger for users updated_at
create trigger handle_users_updated_at
  before update on public.users
  for each row
  execute procedure public.handle_updated_at();

-- Add comment explaining Flowglad integration
comment on column public.users.flowglad_customer_id is
  'Optional Flowglad customer ID. Flowglad is the source of truth for billing. ' ||
  'This field is for caching/faster lookups only. Use user.id as customerId when calling Flowglad API.';
