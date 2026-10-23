create table if not exists shop_presence (
  session_key text primary key,
  path text not null default '',
  activity text not null default '',
  city text not null default '',
  region text not null default '',
  country text not null default '',
  latitude double precision,
  longitude double precision,
  last_seen timestamptz not null default now()
);
