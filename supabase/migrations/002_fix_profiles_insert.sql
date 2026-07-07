-- Allow authenticated users to insert their own profile
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own profile') then
    create policy "Users can insert own profile"
      on profiles for insert with check (auth.uid() = id);
  end if;
end
$$;

-- Backfill: ensure all auth users have a profile row
insert into public.profiles (id, name, email, avatar_url)
select id, coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1)), email, raw_user_meta_data->>'avatar_url'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
