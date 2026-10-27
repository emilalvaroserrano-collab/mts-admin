alter table portal_settings add column if not exists resend_api_key text not null default '';
alter table portal_settings add column if not exists email_from text not null default 'Manage Tech Service <noreply@managetechservice.com>';
alter table portal_settings add column if not exists resend_status text not null default '';
alter table portal_settings add column if not exists resend_error text not null default '';
