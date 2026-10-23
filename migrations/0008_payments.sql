create table if not exists payment_settings (
  id integer primary key,
  card_enabled boolean not null default false,
  invoice_enabled boolean not null default true,
  purchase_order_enabled boolean not null default true,
  stripe_publishable_key text not null default '',
  stripe_secret_key text not null default '',
  invoice_terms text not null default 'Net 30',
  require_po boolean not null default false,
  last_status text not null default 'not_connected',
  last_error text not null default '',
  account_name text not null default ''
);

insert into payment_settings (id, invoice_enabled, purchase_order_enabled, invoice_terms)
values (1, true, true, 'Net 30')
on conflict (id) do nothing;

alter table orders add column if not exists payment_method text not null default '';
