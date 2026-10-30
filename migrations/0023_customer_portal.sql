alter table role_policies add column if not exists can_ticket boolean not null default true;
alter table role_policies add column if not exists can_shop boolean not null default false;
alter table role_policies add column if not exists can_purchase boolean not null default false;
alter table role_policies add column if not exists can_pay_now boolean not null default false;
alter table role_policies add column if not exists can_order_it boolean not null default false;
alter table role_policies add column if not exists can_order_phone boolean not null default false;
alter table role_policies add column if not exists can_defer boolean not null default false;

alter table shop_customers add column if not exists role_id text not null default 'regular';

update role_policies set
  label = 'User 1 · Support',
  description = 'Signs in, opens IT tickets, and sees only their own ticket status. No shop, purchases, or services.',
  can_order = false,
  can_ticket = true,
  can_shop = false,
  can_purchase = false,
  can_pay_now = false,
  can_order_it = false,
  can_order_phone = false,
  can_defer = false,
  scope = 'own tickets'
where id = 'regular';

insert into role_policies (
  id, label, description, can_order, can_request_users, can_approve_orders, can_manage_portal, scope,
  can_ticket, can_shop, can_purchase, can_pay_now, can_order_it, can_order_phone, can_defer
) values (
  'buyer',
  'User 2 · Shop',
  'Tickets plus the online shop. Must pay before the order is placed. No IT or phone services and no invoice.',
  true, false, false, false, 'own tickets and shop',
  true, true, true, true, false, false, false
) on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  can_order = excluded.can_order,
  can_ticket = excluded.can_ticket,
  can_shop = excluded.can_shop,
  can_purchase = excluded.can_purchase,
  can_pay_now = excluded.can_pay_now,
  can_order_it = excluded.can_order_it,
  can_order_phone = excluded.can_order_phone,
  can_defer = excluded.can_defer;

update role_policies set
  label = 'User 3 · Account',
  description = 'Tickets, shop, IT services, and phone or internet. Can pay now or take an invoice.',
  can_order = true,
  can_ticket = true,
  can_shop = true,
  can_purchase = true,
  can_pay_now = true,
  can_order_it = true,
  can_order_phone = true,
  can_defer = true,
  scope = 'own tickets, shop, and services'
where id = 'authorized';

insert into shop_customers (email, name, password_hash, phone, city, country, pay_later, role_id)
select v.email, v.name, 'aefb18ec8da353bcbd23521762de8352:69574a22d5149ef7ead113991cf93097004c9fafc6216a950ede13d1f3d00f2f', v.phone, 'Tuguegarao', 'Philippines', v.pay_later, v.role_id
from (
  values
    ('support.user@managetech.example', 'Ava Support', '555-2001', false, 'regular'),
    ('shop.user@managetech.example', 'Ben Shop', '555-2002', false, 'buyer'),
    ('account.user@managetech.example', 'Cara Account', '555-2003', true, 'authorized')
) as v(email, name, phone, pay_later, role_id)
where not exists (select 1 from shop_customers s where s.email = v.email);

update shop_customers set role_id = 'regular', pay_later = false where email = 'support.user@managetech.example';
update shop_customers set role_id = 'buyer', pay_later = false where email = 'shop.user@managetech.example';
update shop_customers set role_id = 'authorized', pay_later = true where email = 'account.user@managetech.example';
