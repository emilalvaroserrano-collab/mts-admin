alter table products add column if not exists stock integer not null default 12;
alter table products add column if not exists reserved integer not null default 0;

alter table orders add column if not exists inventory_state text not null default 'none';

create table if not exists order_events (
  id serial primary key,
  order_id integer not null references orders (id) on delete cascade,
  kind text not null,
  from_value text not null default '',
  to_value text not null default '',
  actor_name text not null default '',
  detail text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists outbound_emails (
  id serial primary key,
  order_id integer references orders (id) on delete set null,
  to_email text not null,
  template text not null,
  subject text not null,
  body text not null,
  status text not null default 'queued',
  error text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists portal_jobs (
  id serial primary key,
  kind text not null,
  dedupe_key text not null default '',
  payload text not null default '{}',
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  run_at timestamptz not null default now(),
  last_error text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_jobs_due on portal_jobs (status, run_at);
