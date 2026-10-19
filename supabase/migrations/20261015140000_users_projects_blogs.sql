-- Users, bilingual projects and blogs, ordered content blocks, and image storage.
--
-- Text blocks store a TipTap / ProseMirror document in body_en and body_sr:
--   { "type": "doc", "content": [ { "type": "paragraph", "content": [
--       { "type": "text", "text": "Hello", "marks": [{ "type": "bold" }] }
--   ] } ] }
-- Allowed marks: bold, italic, underline, strike, and link ({ "type": "link", "attrs": { "href": "https://..." } }).
-- Image blocks store image_path, the object key inside the content-images bucket
-- (for example "<parent-id>/<filename>"). The public URL is built from the project URL.

create extension if not exists pgcrypto with schema extensions;

create type public.content_status as enum ('draft', 'published');

create type public.content_block_type as enum ('text', 'image');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is
  'Application profile. id matches auth.users. Email is readable by signed-in users only.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.sync_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is not null and new.email is distinct from old.email then
    update public.users
    set email = new.email
    where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
execute function public.sync_user_email();

revoke all on function public.handle_new_user() from public;
revoke all on function public.sync_user_email() from public;
grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.sync_user_email() to supabase_auth_admin;

create or replace function public.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_en text not null,
  title_sr text not null,
  description_en text not null default '',
  description_sr text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_published_at_set check (
    status <> 'published' or published_at is not null
  )
);

comment on column public.projects.slug is 'English URL slug.';

create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_en text not null,
  title_sr text not null,
  description_en text not null default '',
  description_sr text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blogs_published_at_set check (
    status <> 'published' or published_at is not null
  )
);

comment on column public.blogs.slug is 'English URL slug.';

create trigger projects_set_published_at
before insert or update on public.projects
for each row
execute function public.set_published_at();

create trigger blogs_set_published_at
before insert or update on public.blogs
for each row
execute function public.set_published_at();

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create trigger blogs_set_updated_at
before update on public.blogs
for each row
execute function public.set_updated_at();

create index projects_author_id_idx on public.projects (author_id);
create index projects_status_idx on public.projects (status);
create index projects_published_at_idx on public.projects (published_at);

create index blogs_author_id_idx on public.blogs (author_id);
create index blogs_status_idx on public.blogs (status);
create index blogs_published_at_idx on public.blogs (published_at);

create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  blog_id uuid references public.blogs (id) on delete cascade,
  position integer not null check (position >= 0),
  block_type public.content_block_type not null,
  body_en jsonb,
  body_sr jsonb,
  image_path text,
  alt_en text,
  alt_sr text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_blocks_one_parent check (
    (project_id is not null and blog_id is null)
    or (project_id is null and blog_id is not null)
  ),
  constraint content_blocks_payload check (
    (
      block_type = 'text'
      and body_en is not null
      and body_sr is not null
      and jsonb_typeof(body_en) = 'object'
      and jsonb_typeof(body_sr) = 'object'
      and image_path is null
      and alt_en is null
      and alt_sr is null
    )
    or (
      block_type = 'image'
      and image_path is not null
      and btrim(image_path) <> ''
      and body_en is null
      and body_sr is null
    )
  )
);

comment on column public.content_blocks.body_en is
  'English TipTap/ProseMirror document for text blocks.';
comment on column public.content_blocks.body_sr is
  'Serbian TipTap/ProseMirror document for text blocks.';
comment on column public.content_blocks.image_path is
  'Object key in the content-images bucket. Public URL is derived from the project URL.';

create trigger content_blocks_set_updated_at
before update on public.content_blocks
for each row
execute function public.set_updated_at();

create unique index content_blocks_project_position_idx
  on public.content_blocks (project_id, position)
  where project_id is not null;

create unique index content_blocks_blog_position_idx
  on public.content_blocks (blog_id, position)
  where blog_id is not null;

create index content_blocks_project_id_idx on public.content_blocks (project_id);
create index content_blocks_blog_id_idx on public.content_blocks (blog_id);

create view public.user_names
with (security_barrier = true, security_invoker = true) as
select id, first_name, last_name
from public.users;

comment on view public.user_names is
  'Public author names. Safe for select=* because email is not included.';

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.blogs enable row level security;
alter table public.content_blocks enable row level security;

revoke all on table public.users from public, anon, authenticated;
grant select (id, first_name, last_name) on table public.users to anon;
grant select (id, email, first_name, last_name, created_at, updated_at)
  on table public.users to authenticated;
grant update (first_name, last_name, updated_at) on table public.users to authenticated;
grant all on table public.users to service_role;

revoke all on table public.user_names from public, anon, authenticated;
grant select on table public.user_names to anon, authenticated, service_role;

revoke all on table public.projects from anon, authenticated;
revoke all on table public.blogs from anon, authenticated;
revoke all on table public.content_blocks from anon, authenticated;

grant select on table public.projects to anon;
grant select on table public.blogs to anon;
grant select on table public.content_blocks to anon;

grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.blogs to authenticated;
grant select, insert, update, delete on table public.content_blocks to authenticated;

grant all on table public.projects to service_role;
grant all on table public.blogs to service_role;
grant all on table public.content_blocks to service_role;

create policy users_select
on public.users
for select
to anon, authenticated
using (true);

create policy users_update_own
on public.users
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy projects_select_published
on public.projects
for select
to anon, authenticated
using (status = 'published');

create policy projects_select_authenticated
on public.projects
for select
to authenticated
using (true);

create policy projects_insert_authenticated
on public.projects
for insert
to authenticated
with check (true);

create policy projects_update_authenticated
on public.projects
for update
to authenticated
using (true)
with check (true);

create policy projects_delete_authenticated
on public.projects
for delete
to authenticated
using (true);

create policy blogs_select_published
on public.blogs
for select
to anon, authenticated
using (status = 'published');

create policy blogs_select_authenticated
on public.blogs
for select
to authenticated
using (true);

create policy blogs_insert_authenticated
on public.blogs
for insert
to authenticated
with check (true);

create policy blogs_update_authenticated
on public.blogs
for update
to authenticated
using (true)
with check (true);

create policy blogs_delete_authenticated
on public.blogs
for delete
to authenticated
using (true);

-- Parent policies hide draft blocks from anon. Signed-in users can see every parent.
create policy content_blocks_select
on public.content_blocks
for select
to anon, authenticated
using (
  (
    project_id is not null
    and exists (
      select 1
      from public.projects
      where projects.id = content_blocks.project_id
    )
  )
  or (
    blog_id is not null
    and exists (
      select 1
      from public.blogs
      where blogs.id = content_blocks.blog_id
    )
  )
);

create policy content_blocks_insert_authenticated
on public.content_blocks
for insert
to authenticated
with check (true);

create policy content_blocks_update_authenticated
on public.content_blocks
for update
to authenticated
using (true)
with check (true);

create policy content_blocks_delete_authenticated
on public.content_blocks
for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy content_images_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'content-images');

create policy content_images_authenticated_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'content-images');

create policy content_images_authenticated_update
on storage.objects
for update
to authenticated
using (bucket_id = 'content-images')
with check (bucket_id = 'content-images');

create policy content_images_authenticated_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'content-images');

-- Requested admin. Password is shorter than the Auth API minimum, so the hash is
-- inserted directly. email_confirmed_at is set so sign-in does not wait for a confirmation email.
do $$
declare
  seeded_user_id uuid := '8f3c1a2e-5b74-4d90-a6e1-9c0d7f2b4a18';
begin
  if not exists (
    select 1
    from auth.users
    where email = 'dunjastojanov2@gmail.com'
  ) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change,
      email_change_token_new,
      email_change_token_current,
      phone_change,
      phone_change_token,
      reauthentication_token,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000',
      seeded_user_id,
      'authenticated',
      'authenticated',
      'dunjastojanov2@gmail.com',
      extensions.crypt('admin', extensions.gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"first_name":"Dunja","last_name":"Stojanov"}'::jsonb,
      now(),
      now(),
      false,
      false
    );

    insert into auth.identities (
      id,
      user_id,
      provider,
      provider_id,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      seeded_user_id,
      'email',
      seeded_user_id::text,
      jsonb_build_object(
        'sub', seeded_user_id::text,
        'email', 'dunjastojanov2@gmail.com',
        'email_verified', true,
        'phone_verified', false
      ),
      now(),
      now(),
      now()
    );
  end if;
end;
$$;

insert into public.users (id, email, first_name, last_name)
select id, email, 'Dunja', 'Stojanov'
from auth.users
where email = 'dunjastojanov2@gmail.com'
on conflict (id) do nothing;
