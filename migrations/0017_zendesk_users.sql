alter table portal_staff add column if not exists zendesk_user_id text not null default '';
alter table shop_customers add column if not exists zendesk_user_id text not null default '';
alter table integration_settings add column if not exists oauth_client_id text not null default '';
alter table integration_settings add column if not exists oauth_client_secret text not null default '';
alter table integration_settings add column if not exists oauth_scopes text not null default 'read write';
