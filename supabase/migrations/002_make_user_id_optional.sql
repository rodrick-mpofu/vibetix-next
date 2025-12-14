-- Migration: Make user_id optional until authentication is implemented
-- This allows the app to continue working while we gradually migrate to user-based auth

-- Make user_id nullable (temporarily, until auth is implemented)
alter table public.events alter column user_id drop not null;

-- Add comment explaining this is temporary
comment on column public.events.user_id is
  'FK to users table. Currently nullable for backward compatibility. ' ||
  'Will be made required once authentication is implemented.';
