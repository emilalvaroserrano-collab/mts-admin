-- Additive CSR data. Customer-owned context is separate from staff-owned policy.
create table if not exists csr_profiles (
  customer_id integer primary key references shop_customers(id) on delete cascade,
  preferred_name text not null default '', title text not null default '', department text not null default '',
  alternate_phone text not null default '', timezone text not null default 'America/Los_Angeles', language text not null default 'en',
  billing_contact_name text not null default '', billing_contact_email text not null default '',
  it_contact_name text not null default '', it_contact_email text not null default '',
  notifications_push boolean not null default false, quiet_start integer not null default 22, quiet_end integer not null default 7,
  updated_at timestamptz not null default now()
);
create table if not exists csr_sites (
  id text primary key, customer_id integer not null references shop_customers(id) on delete cascade,
  name text not null, address text not null, city text not null default '', region text not null default '',
  postal text not null default '', country text not null default 'United States',
  contact_name text not null default '', contact_phone text not null default '', access_hours text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists csr_sites_customer on csr_sites(customer_id);
create table if not exists csr_assets (
  id text primary key, customer_id integer not null references shop_customers(id) on delete cascade,
  site_id text references csr_sites(id) on delete set null, name text not null, category text not null default '',
  model text not null default '', serial text not null default '', managed boolean not null default false,
  notes text not null default '', updated_at timestamptz not null default now()
);
create table if not exists csr_account_policies (
  customer_id integer primary key references shop_customers(id) on delete cascade,
  spending_limit_cents integer check (spending_limit_cents >= 0), approval_threshold_cents integer check (approval_threshold_cents >= 0),
  po_required boolean not null default false, payment_terms text not null default '',
  approver_name text not null default '', approver_email text not null default '', support_hours text not null default '',
  sla text not null default '', escalation_contact text not null default '', updated_at timestamptz not null default now()
);
create table if not exists csr_sessions (
  token_hash text primary key, customer_id integer not null references shop_customers(id) on delete cascade,
  auth_session_id text not null references "session"(id) on delete cascade,
  portal_token_hash text not null, expires_at timestamptz not null default (now() + interval '8 hours'),
  created_at timestamptz not null default now()
);
create table if not exists csr_conversations (
  id text primary key, customer_id integer not null references shop_customers(id) on delete cascade,
  title text not null default 'Conversation with Sarah', status text not null default 'open', summary text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists csr_conversations_customer on csr_conversations(customer_id, updated_at);
create table if not exists csr_messages (
  id bigserial primary key, conversation_id text not null references csr_conversations(id) on delete cascade,
  external_id text not null, role text not null check(role in ('user','assistant')), body text not null,
  created_at timestamptz not null default now(), unique(conversation_id, external_id)
);
create table if not exists csr_actions (
  id text primary key, customer_id integer not null references shop_customers(id) on delete cascade,
  method text not null, path text not null, body_json text not null, fingerprint text not null,
  title text not null, status text not null default 'pending', result_json text, response_status integer,
  review_note text not null default '',
  accepted_at timestamptz, expires_at timestamptz not null default (now() + interval '10 minutes'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists csr_actions_customer on csr_actions(customer_id, created_at);
create unique index if not exists csr_actions_inflight on csr_actions(customer_id,fingerprint)
  where status in ('pending','approved','executing','manual_review');
create table if not exists csr_push_subscriptions (
  endpoint text primary key, customer_id integer not null references shop_customers(id) on delete cascade,
  subscription_json text not null, created_at timestamptz not null default now()
);
create table if not exists csr_push_outbox (
  notice_id integer primary key references customer_notices(id) on delete cascade,
  customer_id integer not null references shop_customers(id) on delete cascade,
  attempts integer not null default 0, status text not null default 'pending',
  next_attempt_at timestamptz not null default now(), last_error text not null default ''
);
create table if not exists csr_knowledge (
  id text primary key, organization_id integer references organizations(id) on delete cascade,
  title text not null, body text not null, source_url text not null default '',
  approved boolean not null default false, updated_at timestamptz not null default now()
);
create table if not exists csr_billing_documents (
  id text primary key, customer_id integer not null references shop_customers(id) on delete cascade,
  source text not null, external_id text not null, number text not null, currency text not null default 'USD',
  total_cents integer not null check(total_cents >= 0), outstanding_cents integer not null check(outstanding_cents >= 0),
  due_date date, status text not null, source_updated_at timestamptz not null, unique(source, external_id)
);
create table if not exists csr_external_events (
  id text primary key, received_at timestamptz not null default now()
);
alter table agent_handoffs add column if not exists portal_token_hash text not null default '';
alter table agent_handoffs add column if not exists auth_session_id text not null default '';
alter table service_requests add column if not exists quantity integer not null default 1;
alter table service_requests add column if not exists site_id text references csr_sites(id) on delete set null;
alter table service_requests add column if not exists provider_reference text not null default '';
alter table service_requests add column if not exists assigned_users text not null default '';
alter table service_requests add column if not exists recipients_json text not null default '[]';
alter table service_requests add column if not exists handset_sku text not null default '';
alter table service_requests add column if not exists consent_json text not null default '{}';
alter table service_requests add column if not exists monthly_cents integer not null default 0;

insert into csr_knowledge(id,title,body,approved) values
  ('mts-service-activation','Service requests and activation','A service request is a request for the MTS team to review. It becomes active only after the provider confirmation is recorded. A requested phone handset is a separate equipment purchase. Never describe a submitted request as an activated service.',true),
  ('mts-payment-status','Payments and invoice status','Payment links open a secure payment provider. Never collect card numbers in chat or voice. An order placed on invoice is not a paid invoice. Use actual payment or accounting-source status and its update timestamp.',true)
on conflict(id) do nothing;

-- Notifications are committed with the status change, even with no browser open.
create or replace function csr_status_notice() returns trigger language plpgsql as $$
begin
  if TG_TABLE_NAME = 'tickets' then
   if new.status is distinct from old.status then
    insert into customer_notices(shop_customer_id, title, body, href)
      select id, 'Ticket updated', new.subject || ': ' || new.status, '/portal/tickets/' || new.id
      from shop_customers where lower(email) = lower(new.requester_email);
   end if;
  elsif TG_TABLE_NAME = 'orders' then
   if new.shipment_status is distinct from old.shipment_status or new.status is distinct from old.status then
    insert into customer_notices(shop_customer_id, title, body, href)
      select id, 'Order updated', 'MT-' || (1000 + new.id) || ': ' || coalesce(nullif(new.shipment_status,''),new.status), '/portal/orders/' || new.id
      from shop_customers where id = new.shop_customer_id;
   end if;
  elsif TG_TABLE_NAME = 'service_requests' then
   if new.status is distinct from old.status then
    insert into customer_notices(shop_customer_id, title, body, href)
      select id, 'Service updated', new.service_name || ': ' || new.status, '/portal/my-services'
      from shop_customers where id = new.shop_customer_id;
   end if;
  end if;
  return new;
end $$;
drop trigger if exists csr_ticket_notice on tickets;
create trigger csr_ticket_notice after update on tickets for each row execute function csr_status_notice();
drop trigger if exists csr_order_notice on orders;
create trigger csr_order_notice after update on orders for each row execute function csr_status_notice();
drop trigger if exists csr_service_notice on service_requests;
create trigger csr_service_notice after update on service_requests for each row execute function csr_status_notice();
create or replace function csr_queue_push() returns trigger language plpgsql as $$
begin
  insert into csr_push_outbox(notice_id, customer_id) values(new.id, new.shop_customer_id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists csr_push_notice on customer_notices;
create trigger csr_push_notice after insert on customer_notices for each row execute function csr_queue_push();
