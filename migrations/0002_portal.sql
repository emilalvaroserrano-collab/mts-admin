create table if not exists portal_staff (
  user_id text primary key,
  name text not null,
  email text not null default '',
  role text not null default 'agent',
  organization_id integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists organizations (
  id serial primary key,
  name text not null,
  domain text not null default '',
  industry text not null default '',
  phone text not null default '',
  address text not null default '',
  zendesk_org_id text not null default '',
  notes text not null default '',
  portal_access boolean not null default true,
  ordering_enabled boolean not null default true,
  user_requests_enabled boolean not null default true,
  approval_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists customer_users (
  id serial primary key,
  organization_id integer references organizations (id) on delete set null,
  name text not null,
  email text not null,
  title text not null default '',
  permission_level text not null default 'regular',
  can_order boolean not null default false,
  can_request_users boolean not null default false,
  can_approve_orders boolean not null default false,
  active boolean not null default true,
  zendesk_user_id text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists products (
  id serial primary key,
  sku text not null,
  name text not null,
  category text not null default '',
  description text not null default '',
  specs text not null default '',
  price_cents integer not null default 0,
  image_url text not null default '',
  available boolean not null default true,
  visibility text not null default 'all',
  created_at timestamptz not null default now()
);

create table if not exists tickets (
  id serial primary key,
  zendesk_id text unique,
  subject text not null,
  status text not null default 'new',
  priority text not null default 'normal',
  category text not null default '',
  organization_id integer references organizations (id) on delete set null,
  requester_name text not null default '',
  requester_email text not null default '',
  assignee text not null default '',
  tags text not null default '',
  view_label text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ticket_comments (
  id serial primary key,
  ticket_id integer not null references tickets (id) on delete cascade,
  author_name text not null,
  body text not null,
  public_note boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id serial primary key,
  organization_id integer not null references organizations (id),
  customer_user_id integer references customer_users (id) on delete set null,
  status text not null default 'pending',
  ticket_id integer references tickets (id) on delete set null,
  zendesk_ticket_id text not null default '',
  notes text not null default '',
  approval_note text not null default '',
  processing_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id serial primary key,
  order_id integer not null references orders (id) on delete cascade,
  product_id integer references products (id) on delete set null,
  product_name text not null,
  sku text not null default '',
  quantity integer not null,
  unit_price_cents integer not null
);

create table if not exists ticket_forms (
  id serial primary key,
  name text not null,
  category text not null default '',
  subcategory text not null default '',
  zendesk_field text not null default '',
  required_fields text not null default '',
  restricted boolean not null default false,
  active boolean not null default true
);

create table if not exists role_policies (
  id text primary key,
  label text not null,
  description text not null default '',
  can_order boolean not null default false,
  can_request_users boolean not null default false,
  can_approve_orders boolean not null default false,
  can_manage_portal boolean not null default false,
  scope text not null default 'own'
);

create table if not exists integration_settings (
  id integer primary key,
  subdomain text not null default '',
  email text not null default '',
  api_token text not null default '',
  last_sync_at timestamptz,
  last_status text not null default '',
  last_error text not null default ''
);

create table if not exists portal_settings (
  id integer primary key,
  brand_name text not null default 'Manage Tech Service',
  support_email text not null default '',
  tagline text not null default '',
  notify_new_ticket boolean not null default true,
  notify_new_order boolean not null default true,
  customer_catalog_visible boolean not null default true
);

create table if not exists user_requests (
  id serial primary key,
  organization_id integer references organizations (id) on delete set null,
  requested_name text not null,
  requested_email text not null,
  requested_by text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id serial primary key,
  actor_user_id text,
  actor_name text not null default '',
  action text not null,
  target text not null default '',
  detail text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists tickets_org_idx on tickets (organization_id);
create index if not exists tickets_status_idx on tickets (status);
create index if not exists customer_users_org_idx on customer_users (organization_id);
create index if not exists orders_org_idx on orders (organization_id);
create index if not exists audit_created_idx on audit_logs (created_at desc);
