alter table invitations
  add column if not exists sender_initial_score integer not null default 0 check (sender_initial_score >= 0 and sender_initial_score <= 999),
  add column if not exists opponent_initial_score integer not null default 0 check (opponent_initial_score >= 0 and opponent_initial_score <= 999);
