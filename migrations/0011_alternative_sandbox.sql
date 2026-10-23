alter table payment_settings add column if not exists alternative_environment text not null default 'sandbox';
alter table organizations add column if not exists alternative_customer_id text not null default '';
alter table orders add column if not exists alternative_invoice_id text not null default '';
alter table orders add column if not exists alternative_request_id text not null default '';
alter table orders add column if not exists payment_status text not null default '';
