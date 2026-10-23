insert into organizations
  (id, name, domain, industry, phone, address, zendesk_org_id, notes, portal_access, ordering_enabled, user_requests_enabled, approval_required)
values
  (1, 'Northline Logistics', 'northline.example', 'Freight', '(503) 555-0142', '410 NW 14th Ave, Portland, OR', '90011', 'Primary dock and laptop account. Approval required on orders over one unit.', true, true, true, true),
  (2, 'Harbor & Pine Dental', 'harborpine.example', 'Healthcare', '(206) 555-0177', '88 Pine St, Seattle, WA', '90028', 'Clinic front desk and imaging PCs. Portal access active.', true, true, true, false),
  (3, 'Vesper Architecture', 'vesper.example', 'Architecture', '(312) 555-0194', '220 W Illinois, Chicago, IL', '90041', 'Studio rollout in progress. Ordering limited to authorized staff.', true, true, false, true),
  (4, 'Redcedar Credit Union', 'redcedar.example', 'Finance', '(208) 555-0118', '15 Bannock St, Boise, ID', '90052', 'Invoice packet required before hardware leaves the bench.', true, true, true, true),
  (5, 'Fieldnote Studios', 'fieldnote.example', 'Production', '(512) 555-0160', '804 E 6th St, Austin, TX', '90063', 'Conference room rebuild is waiting on the cabling vendor.', true, false, true, true);

select setval('organizations_id_seq', (select max(id) from organizations));

insert into customer_users
  (id, organization_id, name, email, title, permission_level, can_order, can_request_users, can_approve_orders, active, zendesk_user_id)
values
  (1, 1, 'Elena Voss', 'elena.voss@northline.example', 'IT lead', 'authorized', true, true, true, true, '55021'),
  (2, 1, 'Chris Daley', 'chris.daley@northline.example', 'Dispatcher', 'regular', false, false, false, true, '55022'),
  (3, 2, 'Priya Shah', 'priya.shah@harborpine.example', 'Office director', 'authorized', true, true, false, true, '55040'),
  (4, 3, 'Marc Adel', 'marc.adel@vesper.example', 'Studio manager', 'authorized', true, false, false, true, '55061'),
  (5, 4, 'Helen Cho', 'helen.cho@redcedar.example', 'Operations', 'authorized', true, true, true, true, '55080'),
  (6, 5, 'Luis Ortega', 'luis.ortega@fieldnote.example', 'Producer', 'authorized', false, true, false, true, '55091'),
  (7, 5, 'Nina Park', 'nina.park@fieldnote.example', 'Editor', 'regular', false, false, false, true, '55092'),
  (8, 4, 'Owen Briggs', 'owen.briggs@redcedar.example', 'Branch teller', 'regular', false, false, false, false, '55081');

select setval('customer_users_id_seq', (select max(id) from customer_users));

insert into products
  (id, sku, name, category, description, specs, price_cents, available, visibility)
values
  (1, 'MT-L14', 'Studio laptop 14', 'Laptops', 'Light notebook for dispatch, clinic, and studio desks.', '14-inch display, 16 GB memory, 512 GB storage', 128900, true, 'authorized'),
  (2, 'MT-D1', 'USB-C dock', 'Accessories', 'One cable for two displays and a wired network.', 'Dual HDMI, gigabit ethernet, 100 W pass-through', 18900, true, 'all'),
  (3, 'MT-M27', '27-inch desk display', 'Displays', 'A quiet screen for the front desk or a studio bench.', '27-inch IPS, 2560x1440, height-adjust stand', 34900, true, 'all'),
  (4, 'MT-H2', 'Wired headset', 'Accessories', 'Call headset with a noise-limiting mic.', 'USB-A, inline mute, leatherette ear pads', 12900, true, 'all'),
  (5, 'MT-P4', 'Compact desk PC', 'PCs', 'A small desktop for shared floors and teller stations.', 'Desktop, 16 GB memory, 512 GB storage', 89900, true, 'authorized'),
  (6, 'MT-K1', 'Low-profile keyboard', 'Accessories', 'Quiet keyboard for open offices.', 'USB-C, full size, numeric pad', 8900, true, 'all'),
  (7, 'MT-W6', 'Conference camera', 'Accessories', 'A fixed camera for small meeting rooms.', '1080p, privacy shutter, USB-C', 7900, true, 'all'),
  (8, 'MT-N1', 'All-in-one desk PC', 'PCs', 'Screen and computer together for a reception desk.', '24-inch display, 16 GB memory, wireless keyboard', 109900, true, 'authorized');

select setval('products_id_seq', (select max(id) from products));

insert into tickets
  (id, zendesk_id, subject, status, priority, category, organization_id, requester_name, requester_email, assignee, tags, view_label, created_at, updated_at)
values
  (1, '48211', 'Laptop dock drops the network after sleep', 'open', 'high', 'Hardware', 1, 'Elena Voss', 'elena.voss@northline.example', 'Jordan Hale', 'hardware,laptop', '', now() - interval '6 hours', now() - interval '40 minutes'),
  (2, '48230', 'Front desk monitor flicker', 'new', 'normal', 'Hardware', 2, 'Priya Shah', 'priya.shah@harborpine.example', '', 'hardware,monitor', '', now() - interval '2 hours', now() - interval '2 hours'),
  (3, '48102', 'Three laptops for the river studio', 'pending', 'normal', 'Ordering', 3, 'Marc Adel', 'marc.adel@vesper.example', 'Jordan Hale', 'order,pending_order', 'Pending Orders', now() - interval '2 days', now() - interval '5 hours'),
  (4, '47990', 'April hardware refresh invoice', 'pending', 'high', 'Billing', 4, 'Helen Cho', 'helen.cho@redcedar.example', 'Avery Quinn', 'billing,need_invoice', 'Need Invoice', now() - interval '4 days', now() - interval '1 day'),
  (5, '47811', 'Conference room cabling is on hold', 'pending', 'normal', 'Projects', 5, 'Luis Ortega', 'luis.ortega@fieldnote.example', 'Avery Quinn', 'project,pending_project', 'Pending Projects', now() - interval '6 days', now() - interval '8 hours'),
  (6, '48301', 'Mailbox for the new clinic lead', 'open', 'normal', 'Access', 2, 'Priya Shah', 'priya.shah@harborpine.example', 'Jordan Hale', 'access', '', now() - interval '1 day', now() - interval '3 hours'),
  (7, '47620', 'Color printer jam code 42', 'solved', 'low', 'Hardware', 1, 'Elena Voss', 'elena.voss@northline.example', 'Samira Cole', 'hardware,printer', '', now() - interval '12 days', now() - interval '9 days'),
  (8, '47002', 'VPN token replacement', 'closed', 'low', 'Access', 3, 'Marc Adel', 'marc.adel@vesper.example', 'Samira Cole', 'access', '', now() - interval '20 days', now() - interval '18 days'),
  (9, null, 'Headset echo on producer calls', 'new', 'normal', 'Hardware', 5, 'Luis Ortega', 'luis.ortega@fieldnote.example', '', 'hardware,audio', '', now() - interval '50 minutes', now() - interval '50 minutes'),
  (10, '48440', 'Invoice needed before the board packet', 'open', 'urgent', 'Billing', 4, 'Helen Cho', 'helen.cho@redcedar.example', '', 'billing,need_invoice', 'Need Invoice', now() - interval '3 hours', now() - interval '25 minutes');

select setval('tickets_id_seq', (select max(id) from tickets));

insert into ticket_comments (ticket_id, author_name, body, public_note, created_at) values
  (1, 'Elena Voss', 'The dock is MT-D1 on a field laptop. Ethernet dies after the lid closes and only returns if we replug the cable.', true, now() - interval '6 hours'),
  (1, 'Jordan Hale', 'Reproduced on the bench with sleep set to 10 minutes. Trying a firmware build before we swap the dock.', true, now() - interval '40 minutes'),
  (1, 'Jordan Hale', 'Hold the spare dock. Do not ship until the firmware note is in the ticket.', false, now() - interval '35 minutes'),
  (3, 'Marc Adel', 'River studio opens in three weeks. We need three field laptops and docks, billed to the studio job.', true, now() - interval '2 days'),
  (3, 'Jordan Hale', 'Waiting on Elena-style approval from their studio partner before the order moves.', false, now() - interval '5 hours'),
  (4, 'Helen Cho', 'Board packet needs the April hardware invoice attached. Please do not mark the ticket solved until the PDF is on the thread.', true, now() - interval '4 days'),
  (5, 'Luis Ortega', 'Cabling vendor slipped a week. Room is otherwise ready for the webcam and display.', true, now() - interval '6 days'),
  (5, 'Avery Quinn', 'Tagged as a pending project. Reopen the order only after Luis confirms the vendor date.', false, now() - interval '8 hours'),
  (10, 'Helen Cho', 'Same packet as the April refresh. Urgent because the board book closes this afternoon.', true, now() - interval '3 hours');

insert into orders
  (id, organization_id, customer_user_id, status, ticket_id, zendesk_ticket_id, notes, approval_note, processing_note, created_at, updated_at)
values
  (1, 1, 1, 'pending', null, '', 'Replacement dock for the dispatch bench.', '', '', now() - interval '5 hours', now() - interval '5 hours'),
  (2, 2, 3, 'processing', null, '', 'Four front-desk displays. Approval not required for this company.', 'Office director confirmed by phone.', 'Picked and labeled. Waiting on the courier window.', now() - interval '1 day', now() - interval '3 hours'),
  (3, 3, 4, 'fulfilled', 3, '48102', 'River studio laptops.', 'Studio partner approved in ticket 48102.', 'Shipped with the dock kit.', now() - interval '9 days', now() - interval '2 days'),
  (4, 4, 5, 'pending', 4, '47990', 'Color laser for the operations floor. Hold for invoice.', '', '', now() - interval '4 days', now() - interval '1 day'),
  (5, 5, 6, 'approved', null, '', 'Two headsets for the edit bay. Ordering is currently restricted for this company; this record predates the hold.', 'Producer approved.', '', now() - interval '3 days', now() - interval '3 days');

select setval('orders_id_seq', (select max(id) from orders));

insert into order_items (order_id, product_id, product_name, sku, quantity, unit_price_cents) values
  (1, 2, 'USB-C dock', 'MT-D1', 1, 18900),
  (1, 6, 'Low-profile keyboard', 'MT-K1', 1, 8900),
  (2, 3, '27 inch desk monitor', 'MT-M27', 4, 34900),
  (3, 1, 'Field laptop 14', 'MT-L14', 3, 128900),
  (3, 2, 'USB-C dock', 'MT-D1', 3, 18900),
  (4, 5, 'Color laser printer', 'MT-P4', 1, 69900),
  (5, 4, 'Wired headset', 'MT-H2', 2, 12900);

insert into ticket_forms (name, category, subcategory, zendesk_field, required_fields, restricted, active) values
  ('Hardware issue', 'Hardware', 'Device will not start', 'custom_field_issue', 'subject,description,device', false, true),
  ('Access request', 'Access', 'Mailbox', 'custom_field_access', 'subject,user', false, true),
  ('Catalog order', 'Ordering', 'Catalog request', 'custom_field_order', 'subject,items,approver', true, true),
  ('Billing question', 'Billing', 'Invoice', 'custom_field_billing', 'subject,invoice', false, true),
  ('Project request', 'Projects', 'Site work', 'custom_field_project', 'subject,site,window', true, true);

insert into role_policies
  (id, label, description, can_order, can_request_users, can_approve_orders, can_manage_portal, scope)
values
  ('regular', 'Regular customer', 'Can open standard tickets. Cannot order products or request new accounts.', false, false, false, false, 'own company'),
  ('authorized', 'Authorized customer', 'Can order products and ask for new portal users. Approvals stay with a named approver.', true, true, false, false, 'own company'),
  ('agent', 'Support agent', 'Works the queue, companies, catalog, and orders. Cannot change portal credentials or staff roles.', true, true, true, false, 'assigned companies'),
  ('admin', 'Internal admin', 'Full desk, including Zendesk credentials, branding, and staff access.', true, true, true, true, 'all companies');

insert into integration_settings (id, subdomain, email, api_token, last_status, last_error)
values (1, '', '', '', 'not_connected', '');

insert into portal_settings (id, brand_name, support_email, tagline, notify_new_ticket, notify_new_order, customer_catalog_visible)
values (1, 'Manage Tech Service', 'desk@managetech.example', 'Admin for companies, tickets, the catalog, and orders.', true, true, true);

insert into user_requests (organization_id, requested_name, requested_email, requested_by, status, created_at) values
  (5, 'Maya Chen', 'maya.chen@fieldnote.example', 'Luis Ortega', 'pending', now() - interval '9 hours'),
  (1, 'Ruth Ibarra', 'ruth.ibarra@northline.example', 'Elena Voss', 'pending', now() - interval '1 day');

insert into audit_logs (actor_name, action, target, detail, created_at) values
  ('Avery Quinn', 'Updated ticket', '47990', 'Moved April invoice into Need Invoice.', now() - interval '1 day'),
  ('Jordan Hale', 'Replied', '48211', 'Public note on the dock firmware.', now() - interval '40 minutes'),
  ('Samira Cole', 'Fulfilled order', 'MT-1003', 'River studio laptops marked shipped.', now() - interval '2 days');
