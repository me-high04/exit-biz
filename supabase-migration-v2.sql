-- =============================================
-- ExitBiz — Migration v2
-- Rulează în: Supabase → SQL Editor
-- Adaugă MVP features pe schema existentă
-- =============================================

-- ── 1. EXTINDE TABELA dosare ──────────────────────────────────────────────

-- Actualizează statusuri (pipeline nou)
alter table public.dosare
  drop constraint if exists dosare_status_check;

alter table public.dosare
  add constraint dosare_status_check
  check (status in ('lead','diagnostic','analiza','documente','pregatire','depus','finalizat'));

-- Migrează statusuri vechi → noi
update public.dosare set status = 'lead'       where status = 'nou';
update public.dosare set status = 'documente'  where status = 'documente'; -- same
update public.dosare set status = 'depus'      where status = 'depus_onrc';
update public.dosare set status = 'pregatire'  where status = 'in_procesare';
-- 'finalizat' rămâne la fel

-- Câmpuri noi pe dosar
alter table public.dosare
  add column if not exists risk_level      text default 'necunoscut' check (risk_level in ('scazut','mediu','ridicat','necunoscut')),
  add column if not exists procedure_rec   text,
  add column if not exists resp_operator   text,
  add column if not exists resp_accountant text,
  add column if not exists resp_liquidator text,
  add column if not exists resp_lawyer     text,
  add column if not exists phone           text,
  add column if not exists diagnostic_data jsonb;

-- ── 2. TABELA checklist_templates ────────────────────────────────────────

create table if not exists public.checklist_templates (
  id           uuid default gen_random_uuid() primary key,
  service_type text not null,
  doc_name     text not null,
  doc_name_en  text,
  required     boolean default true,
  sort_order   int default 0
);

-- Template documente pentru fiecare serviciu
insert into public.checklist_templates (service_type, doc_name, doc_name_en, required, sort_order) values
  -- Radiere ONRC
  ('radiere', 'Actul constitutiv (actualizat)',           'Articles of association (updated)',        true,  1),
  ('radiere', 'Certificat de înregistrare ONRC',          'ONRC registration certificate',            true,  2),
  ('radiere', 'Hotărâre AGA dizolvare',                   'GMS dissolution decision',                 true,  3),
  ('radiere', 'Bilanț de lichidare',                      'Liquidation balance sheet',                true,  4),
  ('radiere', 'Dovadă publicare MO',                      'Official Gazette publication proof',       true,  5),
  ('radiere', 'Certificat fiscal ANAF',                   'ANAF tax certificate',                     true,  6),
  ('radiere', 'Dovadă notificare creditori',              'Creditor notification proof',              true,  7),
  ('radiere', 'CI asociat/administrator',                 'ID of partner/director',                   true,  8),
  -- Dizolvare voluntara
  ('dizolvare', 'Actul constitutiv',                      'Articles of association',                  true,  1),
  ('dizolvare', 'Certificat de înregistrare ONRC',        'ONRC registration certificate',            true,  2),
  ('dizolvare', 'Hotărâre AGA dizolvare',                 'GMS dissolution decision',                 true,  3),
  ('dizolvare', 'Certificat fiscal ANAF',                 'ANAF tax certificate',                     true,  4),
  ('dizolvare', 'CI asociat/administrator',               'ID of partner/director',                   true,  5),
  -- Suspendare
  ('suspendare', 'Hotărâre AGA suspendare',               'GMS suspension decision',                  true,  1),
  ('suspendare', 'Certificat de înregistrare ONRC',       'ONRC registration certificate',            true,  2),
  ('suspendare', 'CI administrator',                      'Director ID',                              true,  3),
  -- Cabinet profesionist
  ('cabinet', 'Contract prestări servicii',               'Service agreement',                        true,  1),
  ('cabinet', 'Actul constitutiv',                        'Articles of association',                  true,  2),
  ('cabinet', 'CI asociat/administrator',                 'ID of partner/director',                   true,  3)
on conflict do nothing;

-- ── 3. TABELA checklist_items (per dosar) ────────────────────────────────

create table if not exists public.checklist_items (
  id           uuid default gen_random_uuid() primary key,
  dosar_id     uuid references public.dosare on delete cascade not null,
  doc_name     text not null,
  doc_name_en  text,
  status       text default 'lipsa' check (status in ('lipsa','primit','verificat','respins')),
  required     boolean default true,
  notes        text,
  sort_order   int default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists checklist_items_dosar_idx on public.checklist_items (dosar_id);

-- ── 4. TABELA documents (upload-uri) ─────────────────────────────────────

create table if not exists public.documents (
  id               uuid default gen_random_uuid() primary key,
  dosar_id         uuid references public.dosare on delete cascade not null,
  checklist_item_id uuid references public.checklist_items on delete set null,
  filename         text not null,
  storage_path     text not null,
  file_type        text,
  version          int default 1,
  uploaded_by      uuid references auth.users on delete set null,
  uploader_role    text check (uploader_role in ('client','admin')),
  verified         boolean default false,
  created_at       timestamptz default now()
);

create index if not exists documents_dosar_idx on public.documents (dosar_id);

-- ── 5. TABELA tasks ───────────────────────────────────────────────────────

create table if not exists public.tasks (
  id             uuid default gen_random_uuid() primary key,
  dosar_id       uuid references public.dosare on delete cascade not null,
  title          text not null,
  assigned_role  text check (assigned_role in ('client','operator','contabil','lichidator','avocat')),
  assigned_to    uuid references auth.users on delete set null,
  status         text default 'pending' check (status in ('pending','done','blocked')),
  deadline       date,
  sort_order     int default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists tasks_dosar_idx on public.tasks (dosar_id);

-- ── 6. RLS pe tabelele noi ────────────────────────────────────────────────

alter table public.checklist_templates enable row level security;
alter table public.checklist_items enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;

-- checklist_templates: toți pot citi, doar admin modifică
create policy "Toți citesc templates"
  on checklist_templates for select using (true);

create policy "Admin modifică templates"
  on checklist_templates for all using (public.is_admin());

-- checklist_items: client vede pe ale sale, admin vede tot
create policy "Client vede checklist-ul propriu"
  on checklist_items for select using (
    exists (select 1 from dosare d where d.id = dosar_id and (d.client_email = auth.email() or public.is_admin()))
  );

create policy "Admin gestionează checklist"
  on checklist_items for all using (public.is_admin());

create policy "Client inserează checklist items"
  on checklist_items for insert with check (
    exists (select 1 from dosare d where d.id = dosar_id and d.client_email = auth.email())
  );

-- documents: client vede pe ale sale, admin vede tot
create policy "Client vede documentele proprii"
  on documents for select using (
    exists (select 1 from dosare d where d.id = dosar_id and (d.client_email = auth.email() or public.is_admin()))
  );

create policy "Client uploadează documente"
  on documents for insert with check (
    exists (select 1 from dosare d where d.id = dosar_id and d.client_email = auth.email())
    and uploader_role = 'client'
  );

create policy "Admin gestionează documente"
  on documents for all using (public.is_admin());

-- tasks: client vede taskurile sale, admin gestionează
create policy "Client vede taskurile proprii"
  on tasks for select using (
    exists (select 1 from dosare d where d.id = dosar_id and (d.client_email = auth.email() or public.is_admin()))
  );

create policy "Admin gestionează taskuri"
  on tasks for all using (public.is_admin());

-- ── 7. TRIGGERS updated_at pe tabelele noi ───────────────────────────────

create trigger checklist_items_updated_at
  before update on public.checklist_items
  for each row execute function public.update_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.update_updated_at();

-- ── 8. FUNCȚIE: copiază template → checklist la creare dosar ─────────────

create or replace function public.create_checklist_from_template(p_dosar_id uuid, p_service_type text)
returns void language plpgsql security definer as $$
begin
  insert into public.checklist_items (dosar_id, doc_name, doc_name_en, required, sort_order)
  select p_dosar_id, doc_name, doc_name_en, required, sort_order
  from public.checklist_templates
  where service_type = p_service_type
  order by sort_order;
end;
$$;

-- ── 9. Storage bucket pentru documente ───────────────────────────────────
-- Rulează din Supabase Dashboard → Storage → Create bucket "dosare-docs"
-- sau decomentează:
-- insert into storage.buckets (id, name, public) values ('dosare-docs', 'dosare-docs', false);
