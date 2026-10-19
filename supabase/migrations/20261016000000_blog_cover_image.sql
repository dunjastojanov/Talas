alter table public.blogs
add column cover_image_path text;

comment on column public.blogs.cover_image_path is
  'Object key in the content-images bucket. Public URL is derived from the project URL.';
