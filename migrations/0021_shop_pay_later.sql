alter table shop_customers add column if not exists pay_later boolean not null default false;
alter table orders add column if not exists card_brand text not null default '';
alter table orders add column if not exists card_last4 text not null default '';
alter table orders add column if not exists card_exp text not null default '';

update payment_settings set
  alternative_enabled = true,
  alternative_environment = 'sandbox',
  alternative_client_id = 'sbx_mts_8c21e4a7b90d',
  alternative_client_secret = 'sbx_sk_4f7c9a21e6b84d0c91aa37f5e2d81044',
  alternative_status = 'sandbox',
  alternative_error = ''
where id = 1 and alternative_client_id = '';

insert into shop_customers (email, name, password_hash, phone, city, country, pay_later)
select v.email, v.name, 'aefb18ec8da353bcbd23521762de8352:69574a22d5149ef7ead113991cf93097004c9fafc6216a950ede13d1f3d00f2f', v.phone, v.city, 'United States', v.pay_later
from (
  values
    ('elena.voss@northline.example', 'Elena Voss', '555-0101', 'Seattle', true),
    ('priya.shah@harborpine.example', 'Priya Shah', '555-0102', 'Portland', true),
    ('marc.adel@vesper.example', 'Marc Adel', '555-0103', 'Austin', false),
    ('helen.cho@redcedar.example', 'Helen Cho', '555-0104', 'Denver', false)
) as v(email, name, phone, city, pay_later)
where not exists (select 1 from shop_customers s where s.email = v.email);

update shop_customers set pay_later = true where email in ('elena.voss@northline.example', 'priya.shah@harborpine.example');
update shop_customers set pay_later = false where email in ('marc.adel@vesper.example', 'helen.cho@redcedar.example');
