update ticket_forms set name = 'Catalog order' where name = 'Equipment order';

update role_policies
set description = 'Can open standard tickets. Cannot order products or request new accounts.'
where id = 'regular';

update role_policies
set description = 'Can order products and ask for new portal users. Approvals stay with a named approver.'
where id = 'authorized';
