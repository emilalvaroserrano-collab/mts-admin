alter table agent_api_keys add column if not exists scope text not null default 'super_admin';
update agent_api_keys set scope = 'super_admin' where scope is distinct from 'super_admin';
