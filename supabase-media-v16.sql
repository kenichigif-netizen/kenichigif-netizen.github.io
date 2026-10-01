-- 写真2枚・動画対応
-- Supabase SQL Editorで1回実行してください。

alter table public.fish_records
add column if not exists image_path_2 text;

alter table public.fish_records
add column if not exists video_path text;

alter table public.fish_records
add column if not exists video_mime_type text;

alter table public.fish_records
add column if not exists video_duration_seconds integer;
