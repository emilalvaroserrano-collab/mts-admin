alter table ticket_comments add column if not exists zendesk_comment_id text;

create unique index if not exists ticket_comments_zd_idx
  on ticket_comments (zendesk_comment_id)
  where zendesk_comment_id is not null;
