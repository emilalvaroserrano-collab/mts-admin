create table if not exists agent_handoffs (
  code text primary key,
  customer_id integer not null,
  email text not null,
  name text not null default '',
  phone text not null default '',
  business text not null default '',
  organization text not null default '',
  role text not null default '',
  expires_at timestamptz not null,
  used_at timestamptz
);
