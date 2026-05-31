-- =============================================
-- ExitBiz — Supabase Setup
-- Rulează în: Supabase → SQL Editor → New query
-- =============================================

-- 1. Tabela profiles (extinde auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'client' check (role in ('client', 'admin')),
  created_at timestamptz default now()
);

-- 2. Tabela dosare
create table public.dosare (
  id uuid default gen_random_uuid() primary key,
  client_name text not null,
  client_email text not null,
  cui text,
  service_type text not null,
  status text default 'nou' check (status in ('nou', 'documente', 'depus_onrc', 'in_procesare', 'finalizat')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Activează RLS
alter table public.profiles enable row level security;
alter table public.dosare enable row level security;

-- 4. Politici profiles
create policy "Utilizator vede propriul profil"
  on profiles for select using (auth.uid() = id);

create policy "Utilizator actualizează propriul profil"
  on profiles for update using (auth.uid() = id);

-- 5. Politici dosare
create policy "Client vede dosarele proprii"
  on dosare for select using (
    client_email = auth.email()
    or public.is_admin()
  );

create policy "Admin inserează dosare"
  on dosare for insert with check (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "Admin actualizează dosare"
  on dosare for update using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "Admin șterge dosare"
  on dosare for delete using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- 6. Trigger: creează profil automat la signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. Trigger: actualizează updated_at la modificare dosar
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger dosare_updated_at
  before update on public.dosare
  for each row execute function public.update_updated_at();
