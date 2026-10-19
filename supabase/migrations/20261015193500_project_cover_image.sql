alter table public.projects
add column cover_image_path text;

comment on column public.projects.cover_image_path is
  'Object key in the content-images bucket. Public URL is derived from the project URL.';
