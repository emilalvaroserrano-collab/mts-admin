create table if not exists pending_action_confirmations (
  id text primary key,
  customer_id integer not null,
  action_id text not null,
  tool_name text not null,
  service text not null default '',
  quantity integer not null default 1,
  amount_cents integer not null default 0,
  currency text not null default 'USD',
  cadence text not null default '',
  terms text not null default '',
  status text not null default 'open',
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists pending_confirm_action on pending_action_confirmations (action_id, status);
