alter table service_catalog add column if not exists benefits text not null default '';
alter table service_catalog add column if not exists scope text not null default '';

create table if not exists campaigns (
  id serial primary key,
  title text not null,
  body text not null default '',
  audience text not null default 'all',
  cta_label text not null default '',
  cta_href text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists complaints (
  id serial primary key,
  shop_customer_id integer,
  organization_id integer,
  kind text not null,
  subject text not null,
  body text not null default '',
  status text not null default 'open',
  ticket_id integer,
  created_at timestamptz not null default now()
);

insert into service_catalog (category, name, summary, kind, benefits, scope)
select v.category, v.name, v.summary, v.kind, v.benefits, v.scope
from (
  values
    ('Managed IT Services', 'Help Desk and Technical Support', 'A desk for day-to-day IT problems.', 'it', 'One place to report issues.', 'Remote help for users and devices.'),
    ('Managed IT Services', 'Cybersecurity and Compliance', 'Monitoring, patches, and a written response plan.', 'it', 'Issues are caught earlier.', 'Endpoints, email, and a monthly review.'),
    ('Managed IT Services', 'Endpoint Security', 'Protection on the computers people actually use.', 'it', 'Lost machines can be locked.', 'Laptops, desktops, and mobile devices you name.'),
    ('Managed IT Services', 'Business Continuity', 'A plan for keeping work going after an outage.', 'it', 'People know who calls whom.', 'Priorities, backups, and a recovery test.'),
    ('Cloud Services', 'Cloud Hosting', 'Servers and apps hosted for the business.', 'cloud', 'No hardware in the closet.', 'Sized to the users you have today.'),
    ('Cloud Services', 'Cloud Migration and Management', 'Move a workload, then keep it running.', 'cloud', 'The move is planned before cutover.', 'One application or a whole office.'),
    ('Cloud Services', 'Desktop as a Service (DaaS)', 'A cloud desktop for each person.', 'cloud', 'The same desktop at the office or at home.', 'Users, apps, and sign-in.'),
    ('Cloud Services', 'Infrastructure as a Service (IaaS)', 'Virtual machines you can grow.', 'cloud', 'Capacity follows the work.', 'Compute, storage, and the network around them.'),
    ('Cloud Services', 'Colocation', 'Your hardware in a managed facility.', 'cloud', 'Power and cooling are not your closet.', 'Racks, access, and remote hands.'),
    ('Cloud Services', 'Virtual Server Hosting', 'A virtual server for a line-of-business app.', 'cloud', 'Backups are part of the service.', 'One server, its users, and its hours.'),
    ('Cloud Services', 'Virtualization Support', 'Help for the hosts you already run.', 'cloud', 'The host is patched on a schedule.', 'Existing virtual machines and storage.'),
    ('Business Phone and Internet', 'Business Phone Services', 'Lines, numbers, and the call flow.', 'phone', 'The main number keeps working.', 'Sites, users, and the current provider.'),
    ('Business Phone and Internet', 'Phone Extensions and Handsets', 'A phone for each person who needs one.', 'phone', 'Extensions match the directory.', 'How many people and which site.'),
    ('Business Phone and Internet', 'Internet / Fiber Service Requests', 'A circuit request for an office.', 'phone', 'The address is checked before anyone orders.', 'Service address, speed, and install window.'),
    ('Business Phone and Internet', 'Communications Setup', 'Phones and internet brought up together.', 'phone', 'One cutover instead of two.', 'What is already installed.'),
    ('Business Phone and Internet', 'Phone System Migration', 'Move off the old system without losing numbers.', 'phone', 'Numbers are ported on a date you pick.', 'Extensions, auto-attendant, and the old provider.'),
    ('IT Projects & Consulting', 'Network Installation', 'Switches, firewalls, and the closet.', 'project', 'The network is documented when it is done.', 'Sites and what is being replaced.'),
    ('IT Projects & Consulting', 'Wi-Fi Infrastructure', 'Wireless that covers the floor.', 'project', 'Dead spots are surveyed first.', 'Floors, users, and guest access.'),
    ('IT Projects & Consulting', 'Structured Cabling', 'Cable pulled and labeled.', 'project', 'Each drop has a name.', 'Rooms and the closet they home to.'),
    ('IT Projects & Consulting', 'Office Relocation', 'IT moved with the office.', 'project', 'Monday morning still has a network.', 'Old site, new site, and the move date.'),
    ('IT Projects & Consulting', 'Migration and Deployment', 'Mail, files, or PCs moved on a plan.', 'project', 'Users are told what changes.', 'What is moving and who is affected.'),
    ('IT Projects & Consulting', 'Security Audits', 'A look at access, patches, and exposure.', 'project', 'You get a written list, not a scare.', 'The systems in scope.'),
    ('IT Projects & Consulting', 'IT Health Checks', 'A short review of backups, servers, and risk.', 'project', 'The next quarter has a priority list.', 'One site or the whole company.'),
    ('IT Projects & Consulting', 'Staff Augmentation', 'An engineer on your work for a period.', 'project', 'The person joins your hours.', 'Skills and how long.'),
    ('Business Application Support', 'Microsoft Outlook', 'Mail, calendars, and shared boxes.', 'it', 'Mail keeps flowing while it is fixed.', 'The mailbox and the device.'),
    ('Business Application Support', 'Microsoft Teams', 'Meetings, chat, and calling.', 'it', 'Meetings are not the outage.', 'Users and what is failing.'),
    ('Business Application Support', 'Microsoft SharePoint', 'Sites, libraries, and sharing.', 'it', 'Permissions are tightened, not guessed.', 'The site and who should see it.'),
    ('Business Application Support', 'Microsoft Azure', 'Subscriptions, identity, and resources.', 'it', 'Changes are named before they run.', 'The subscription in scope.'),
    ('Business Application Support', 'Microsoft Intune', 'Device enrollment and app policy.', 'it', 'A new laptop can be handed out set up.', 'Who is enrolling.'),
    ('Business Application Support', 'Microsoft Active Directory', 'Users, groups, and sign-in.', 'it', 'Access matches the job.', 'The domain and the change.'),
    ('Business Application Support', 'Google Workspace', 'Gmail, Drive, and Meet.', 'it', 'Sharing is reviewed with you.', 'The domain.'),
    ('Business Application Support', 'Windows Management', 'Updates and images for Windows PCs.', 'it', 'Patching has a window.', 'How many PCs.')
) as v(category, name, summary, kind, benefits, scope)
where not exists (select 1 from service_catalog s where s.name = v.name);

insert into campaigns (title, body, audience, cta_label, cta_href)
select 'Managed IT for the office you have', 'Help desk, backups, and a named engineer. Ask for a quote before anything is billed.', 'all', 'See managed IT', '/portal/services'
where not exists (select 1 from campaigns where title = 'Managed IT for the office you have');

insert into campaigns (title, body, audience, cta_label, cta_href)
select 'Equipment for approved accounts', 'Laptops and accessories are in the shop. Pay now, or request an invoice if your account is approved.', 'shop', 'Open the shop', '/portal/shop'
where not exists (select 1 from campaigns where title = 'Equipment for approved accounts');
