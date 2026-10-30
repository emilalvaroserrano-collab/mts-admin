insert into service_catalog (category, name, summary, kind)
select v.category, v.name, v.summary, v.kind
from (
  values
    ('Managed IT Services', 'Server and Network Solutions', 'Servers, switches, and the office network.', 'it'),
    ('Managed IT Services', 'PC and Mac Support', 'Day-to-day help for computers and users.', 'it'),
    ('Managed IT Services', 'Vendor Management', 'We deal with the other vendors for you.', 'it'),
    ('Managed IT Services', 'VoIP Communications', 'Business phone system and handsets.', 'phone'),
    ('Managed IT Services', 'Virtual CIO Services', 'Planning and priorities for the business.', 'it'),
    ('Managed IT Services', 'Managed Security Services', 'Monitoring, patches, and response.', 'it'),
    ('Managed IT Services', '24-Hour Support', 'Help desk that stays open overnight.', 'it'),
    ('Cloud Services', 'Scale from anywhere', 'Hosted apps and desktops for the team.', 'cloud'),
    ('IT Projects & Consulting', 'Project delivery', 'Plan and install a site, move, or upgrade.', 'project')
) as v(category, name, summary, kind)
where not exists (select 1 from service_catalog s where s.name = v.name);
