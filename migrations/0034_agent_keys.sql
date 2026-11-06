create table if not exists agent_api_keys (
  id text primary key,
  name text not null,
  prefix text not null,
  key_hash text not null unique,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
