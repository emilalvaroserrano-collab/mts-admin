create table if not exists agent_actions (
  id text primary key,
  customer_id integer not null,
  tool_name text not null,
  status text not null,
  idempotency_key text not null,
  parameters_json text not null default '{}',
  result_json text not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists agent_actions_customer_key on agent_actions (customer_id, idempotency_key);
