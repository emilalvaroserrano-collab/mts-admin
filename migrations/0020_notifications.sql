create table if not exists notifications (
  id serial primary key,
  kind text not null default 'desk',
  title text not null,
  body text not null default '',
  href text not null default '',
  audience text not null default 'staff',
  actor_name text not null default '',
  organization_id integer,
  dedupe_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists notifications_dedupe_idx on notifications (dedupe_key) where dedupe_key is not null;
create index if not exists notifications_created_idx on notifications (created_at desc);

create table if not exists notification_reads (
  notification_id integer not null references notifications (id) on delete cascade,
  user_id text not null,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

insert into notifications (kind, title, body, href, audience, actor_name, created_at)
select
  case
    when action ilike '%order%' then 'order'
    when action ilike '%ticket%' or action ilike '%repl%' then 'ticket'
    else 'desk'
  end,
  action || ' · ' || target,
  detail,
  case
    when action ilike '%order%' then '/orders'
    when action ilike '%ticket%' or action ilike '%repl%' then '/tickets'
    else '/'
  end,
  case
    when action ilike '%delet%' then 'owner'
    when action ilike '%order%' then 'agent'
    when action ilike '%ticket%' or action ilike '%repl%' then 'staff'
    else 'admin'
  end,
  actor_name,
  created_at
from audit_logs
where not exists (select 1 from notifications);

update notifications n
set href = '/orders/' || o.id::text
from orders o
where n.kind = 'order'
  and n.href = '/orders'
  and n.title like '%' || ('MT-' || (1000 + o.id)::text) || '%';

update notifications n
set href = '/tickets/' || t.id::text,
    organization_id = t.organization_id
from tickets t
where n.kind = 'ticket'
  and n.href = '/tickets'
  and t.zendesk_id <> ''
  and n.title like '%' || t.zendesk_id || '%';

insert into notifications (kind, title, body, href, audience, actor_name, organization_id, dedupe_key, created_at)
select
  'ticket',
  'New ticket · ' || subject,
  coalesce(requester_name, 'A customer') || ' opened a ticket that still needs a first reply.',
  '/tickets/' || id::text,
  'staff',
  coalesce(requester_name, ''),
  organization_id,
  'live:ticket:' || id::text,
  updated_at
from tickets
where status = 'new'
on conflict (dedupe_key) where dedupe_key is not null do nothing;

insert into notifications (kind, title, body, href, audience, actor_name, organization_id, dedupe_key, created_at)
select
  'order',
  'Order waiting · MT-' || (1000 + id)::text,
  'Payment is still open on this order.',
  '/orders/' || id::text,
  'agent',
  '',
  organization_id,
  'live:order:' || id::text,
  updated_at
from orders
where status <> 'cancelled' and coalesce(payment_status, '') in ('', 'unpaid', 'pending')
on conflict (dedupe_key) where dedupe_key is not null do nothing;

insert into notifications (kind, title, body, href, audience, actor_name, organization_id, dedupe_key, created_at)
select
  'person',
  'Account request · ' || requested_name,
  requested_email || ' was asked for by ' || coalesce(nullif(requested_by, ''), 'the desk') || '.',
  '/users',
  'admin',
  coalesce(requested_by, ''),
  organization_id,
  'live:request:' || id::text,
  created_at
from user_requests
where status = 'pending'
on conflict (dedupe_key) where dedupe_key is not null do nothing;
