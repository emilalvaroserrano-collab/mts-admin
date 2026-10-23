alter table payment_settings add column if not exists alternative_enabled boolean not null default true;
alter table payment_settings add column if not exists alternative_client_id text not null default '';
alter table payment_settings add column if not exists alternative_client_secret text not null default '';
alter table payment_settings add column if not exists alternative_status text not null default 'portal';
alter table payment_settings add column if not exists alternative_error text not null default '';

alter table orders add column if not exists payment_url text not null default '';

update payment_settings set alternative_enabled = true where id = 1 and alternative_enabled = false and alternative_client_id = '';
