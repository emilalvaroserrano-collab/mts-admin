alter table shop_customers add column if not exists business_name text not null default '';
alter table shop_customers add column if not exists organization_id integer references organizations (id) on delete set null;
alter table shop_customers add column if not exists email_verified boolean not null default false;
alter table shop_customers add column if not exists verify_code text not null default '';
alter table shop_customers add column if not exists verify_expires timestamptz;
alter table shop_customers add column if not exists interests text not null default '';
alter table shop_customers add column if not exists grant_shop boolean not null default false;
alter table shop_customers add column if not exists grant_services boolean not null default false;
alter table shop_customers add column if not exists grant_invoice boolean not null default false;

update shop_customers set email_verified = true where email_verified = false and verify_code = '';

update shop_customers set grant_shop = true where role_id in ('buyer', 'authorized');
update shop_customers set grant_services = true, grant_invoice = true where role_id = 'authorized';

create table if not exists service_catalog (
  id serial primary key,
  category text not null,
  name text not null,
  summary text not null default '',
  kind text not null default 'it',
  active boolean not null default true
);

create table if not exists service_requests (
  id serial primary key,
  shop_customer_id integer references shop_customers (id) on delete set null,
  organization_id integer references organizations (id) on delete set null,
  category text not null default '',
  service_name text not null,
  details text not null default '',
  severity text not null default 'normal',
  status text not null default 'requested',
  quote_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into service_catalog (category, name, summary, kind)
select v.category, v.name, v.summary, v.kind
from (
  values
    ('Managed IT Services', 'Help Desk', 'Day-to-day support for staff and devices.', 'it'),
    ('Managed IT Services', 'Server Management', 'Monitoring, patches, and server care.', 'it'),
    ('Managed IT Services', 'Network Support', 'Switches, firewalls, and site connectivity.', 'it'),
    ('Managed IT Services', 'Cybersecurity', 'Threat monitoring and response.', 'it'),
    ('Managed IT Services', 'Backup & Recovery', 'Backups and restore tests.', 'it'),
    ('Managed IT Services', 'Endpoint Security', 'Protection for laptops and desktops.', 'it'),
    ('Cloud Services', 'Cloud Hosting', 'Hosted workloads for the business.', 'cloud'),
    ('Cloud Services', 'Cloud Migration', 'Move servers or mail into the cloud.', 'cloud'),
    ('Cloud Services', 'Desktop as a Service', 'Hosted desktops for staff.', 'cloud'),
    ('Cloud Services', 'Infrastructure as a Service', 'Virtual machines and storage.', 'cloud'),
    ('Cloud Services', 'Virtual Servers', 'Servers without new hardware.', 'cloud'),
    ('Cloud Services', 'VoIP Phone Systems', 'Cloud phone system for the office.', 'phone'),
    ('IT Projects & Consulting', 'Wi-Fi Installation', 'Site survey and wireless install.', 'project'),
    ('IT Projects & Consulting', 'Network Cabling', 'Data cabling for an office.', 'project'),
    ('IT Projects & Consulting', 'IT Consulting', 'A plan before the project starts.', 'project'),
    ('IT Projects & Consulting', 'Office Relocation', 'Move the network to a new site.', 'project'),
    ('IT Projects & Consulting', 'Security Audits', 'Review of access and exposure.', 'project'),
    ('Business Application Support', 'Microsoft 365', 'Tenant, licensing, and apps.', 'apps'),
    ('Business Application Support', 'Outlook', 'Mailbox, Outlook, and mobile mail.', 'apps'),
    ('Business Application Support', 'Teams', 'Meetings, calling, and channels.', 'apps'),
    ('Business Application Support', 'SharePoint', 'Sites, files, and sharing.', 'apps'),
    ('Business Application Support', 'Azure', 'Subscriptions and access.', 'apps'),
    ('Business Application Support', 'Intune', 'Device enrollment and policy.', 'apps'),
    ('Business Application Support', 'Active Directory', 'Users, groups, and sign-in.', 'apps'),
    ('Business Application Support', 'Google Workspace', 'Mail and files on Google.', 'apps'),
    ('Phone & Internet', 'Business Phone', 'Lines, numbers, and handsets.', 'phone'),
    ('Phone & Internet', 'Internet / Fiber', 'Circuit quote for the site.', 'phone')
) as v(category, name, summary, kind)
where not exists (select 1 from service_catalog s where s.name = v.name and s.category = v.category);
