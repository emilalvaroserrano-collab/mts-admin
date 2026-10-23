insert into organizations (name, domain, industry, notes, portal_access, ordering_enabled, user_requests_enabled, approval_required)
select 'Web store', 'shop.managetech.example', 'Retail', 'Orders placed from the public online shop.', true, true, false, true
where not exists (select 1 from organizations where domain = 'shop.managetech.example');
