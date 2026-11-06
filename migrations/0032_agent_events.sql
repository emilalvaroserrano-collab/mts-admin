create table if not exists agent_action_events (
  id text primary key,
  action_id text not null,
  from_status text not null default '',
  to_status text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists agent_action_events_action on agent_action_events (action_id, created_at);

create table if not exists agent_context (
  customer_id integer primary key,
  slots_json text not null default '{}',
  updated_at timestamptz not null default now()
);
