create table if not exists score_events (
  id        uuid primary key default gen_random_uuid(),
  match_id  uuid not null references matches(id) on delete cascade,
  player_id uuid not null references profiles(id) on delete cascade,
  action    text not null check (action in ('scored', 'undid')),
  created_at timestamptz not null default now()
);

alter table score_events enable row level security;

create policy "Match participants can view score events"
  on score_events for select
  using (
    exists (
      select 1 from matches m
      where m.id = score_events.match_id
      and auth.uid() in (m.player1_id, m.player2_id)
    )
  );

create policy "Match participants can insert score events"
  on score_events for insert
  with check (
    exists (
      select 1 from matches m
      where m.id = score_events.match_id
      and auth.uid() in (m.player1_id, m.player2_id)
    )
  );

create index if not exists idx_score_events_match_created on score_events (match_id, created_at desc);
