-- Profiles: extends auth.users with display data
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Matches: 1v1 competition between two players
create table if not exists matches (
  id        uuid primary key default gen_random_uuid(),
  player1_id uuid not null references profiles(id) on delete cascade,
  player2_id uuid not null references profiles(id) on delete cascade,
  status    text not null default 'active' check (status in ('pending', 'active', 'completed')),
  created_at timestamptz not null default now(),
  constraint matches_different_players check (player1_id != player2_id)
);

alter table matches enable row level security;

create policy "Users can view their matches"
  on matches for select
  using (auth.uid() in (player1_id, player2_id));

create policy "Users can update their matches"
  on matches for update
  using (auth.uid() in (player1_id, player2_id));

-- Invitations: link-based invites
create table if not exists invitations (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references profiles(id) on delete cascade,
  link_code     text not null unique,
  match_id      uuid references matches(id) on delete set null,
  status        text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

alter table invitations enable row level security;

create policy "Senders can view their invitations"
  on invitations for select
  using (auth.uid() = sender_id);

create policy "Anyone can insert invitations"
  on invitations for insert
  with check (true);

create policy "Senders can update their invitations"
  on invitations for update
  using (auth.uid() = sender_id);

-- Scores: daily score entries per player per match
create table if not exists scores (
  id        uuid primary key default gen_random_uuid(),
  match_id  uuid not null references matches(id) on delete cascade,
  player_id uuid not null references profiles(id) on delete cascade,
  score     integer not null check (score >= 0 and score <= 999),
  date      date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_score_per_player_per_date_per_match
    unique (match_id, player_id, date)
);

alter table scores enable row level security;

create policy "Match participants can view scores"
  on scores for select
  using (
    exists (
      select 1 from matches m
      where m.id = scores.match_id
      and auth.uid() in (m.player1_id, m.player2_id)
    )
  );

create policy "Match participants can insert their own scores"
  on scores for insert
  with check (
    auth.uid() = player_id
    and exists (
      select 1 from matches m
      where m.id = scores.match_id
      and auth.uid() in (m.player1_id, m.player2_id)
    )
  );

create policy "Match participants can update their own scores"
  on scores for update
  using (
    auth.uid() = player_id
    and exists (
      select 1 from matches m
      where m.id = scores.match_id
      and auth.uid() in (m.player1_id, m.player2_id)
    )
  );

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Indexes
create index if not exists idx_scores_match_date on scores (match_id, date);
create index if not exists idx_invitations_link_code on invitations (link_code);
create index if not exists idx_matches_player on matches (player1_id, player2_id);
