-- VibeTix Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Events table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Event details
  name text not null,
  type text not null,
  description text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  location text,
  capacity integer not null default 0,

  -- AI-generated UI configuration
  ui_config jsonb not null default '{}'::jsonb,

  -- Pricing strategy
  pricing_strategy text,

  -- Status
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'completed')),

  -- Host info (in a real app, this would be a foreign key to users table)
  host_email text not null
);

-- Ticket tiers table
create table public.ticket_tiers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  event_id uuid references public.events(id) on delete cascade not null,

  -- Tier details
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  quantity integer not null check (quantity >= 0),
  sold integer not null default 0 check (sold >= 0 and sold <= quantity),

  -- Features/benefits as JSON array
  features jsonb not null default '[]'::jsonb,

  -- Display properties
  color text,
  sort_order integer not null default 0
);

-- Orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  event_id uuid references public.events(id) on delete cascade not null,

  -- Customer info
  customer_email text not null,
  customer_name text not null,

  -- Stripe details
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,

  -- Order details
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  currency text not null default 'usd',

  -- Status
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded'))
);

-- Tickets table
create table public.tickets (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  order_id uuid references public.orders(id) on delete cascade not null,
  tier_id uuid references public.ticket_tiers(id) on delete restrict not null,
  event_id uuid references public.events(id) on delete cascade not null,

  -- Ticket details
  ticket_number text unique not null,
  qr_code text, -- Base64 encoded QR code

  -- Status
  checked_in boolean default false,
  checked_in_at timestamp with time zone
);

-- Create indexes for better query performance
create index events_status_idx on public.events(status);
create index events_start_date_idx on public.events(start_date);
create index events_host_email_idx on public.events(host_email);

create index ticket_tiers_event_id_idx on public.ticket_tiers(event_id);

create index orders_event_id_idx on public.orders(event_id);
create index orders_customer_email_idx on public.orders(customer_email);
create index orders_status_idx on public.orders(status);
create index orders_stripe_checkout_session_id_idx on public.orders(stripe_checkout_session_id);

create index tickets_order_id_idx on public.tickets(order_id);
create index tickets_event_id_idx on public.tickets(event_id);
create index tickets_ticket_number_idx on public.tickets(ticket_number);

-- Enable Row Level Security (RLS)
alter table public.events enable row level security;
alter table public.ticket_tiers enable row level security;
alter table public.orders enable row level security;
alter table public.tickets enable row level security;

-- Create policies (allow read for published events, restrict writes)
-- For MVP, we'll allow reads on published events and service role for writes

-- Events: Anyone can read published events
create policy "Published events are viewable by everyone"
  on public.events for select
  using (status = 'published');

-- Ticket tiers: Anyone can read tiers for published events
create policy "Ticket tiers for published events are viewable by everyone"
  on public.ticket_tiers for select
  using (
    exists (
      select 1 from public.events
      where events.id = ticket_tiers.event_id
      and events.status = 'published'
    )
  );

-- Orders: Customers can read their own orders
create policy "Customers can view their own orders"
  on public.orders for select
  using (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Tickets: Customers can read their own tickets
create policy "Customers can view their own tickets"
  on public.tickets for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = tickets.order_id
      and orders.customer_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_events_updated_at
  before update on public.events
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_orders_updated_at
  before update on public.orders
  for each row
  execute procedure public.handle_updated_at();
