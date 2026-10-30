alter table shop_customers add column if not exists verify_attempts integer not null default 0;
alter table shop_customers add column if not exists session_expires timestamptz;
update shop_customers
set session_expires = now() + interval '12 hours'
where session_token <> '' and session_expires is null;

create table if not exists customer_notices (
  id serial primary key,
  shop_customer_id integer,
  title text not null,
  body text not null default '',
  href text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
