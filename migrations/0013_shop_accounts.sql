create table if not exists shop_customers (
  id serial primary key,
  email text not null unique,
  name text not null default '',
  password_hash text not null,
  phone text not null default '',
  address text not null default '',
  city text not null default '',
  region text not null default '',
  postal text not null default '',
  country text not null default 'United States',
  session_token text not null default '',
  created_at timestamptz not null default now()
);

alter table orders add column if not exists shop_customer_id integer references shop_customers (id) on delete set null;
alter table orders add column if not exists ship_name text not null default '';
alter table orders add column if not exists ship_email text not null default '';
alter table orders add column if not exists ship_phone text not null default '';
alter table orders add column if not exists ship_address text not null default '';
alter table orders add column if not exists ship_city text not null default '';
alter table orders add column if not exists ship_region text not null default '';
alter table orders add column if not exists ship_postal text not null default '';
alter table orders add column if not exists ship_country text not null default '';
alter table orders add column if not exists shipping_method text not null default '';
alter table orders add column if not exists shipping_cents integer not null default 0;
alter table orders add column if not exists shipment_status text not null default 'unfulfilled';
alter table orders add column if not exists tracking_number text not null default '';
alter table orders add column if not exists tracking_carrier text not null default '';
