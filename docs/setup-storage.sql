-- Run this in your Supabase SQL Editor to set up the storage bucket for photos
-- Bucket is PRIVATE - photos accessed via signed URLs only

insert into storage.buckets (id, name, public)
values ('journal_photos', 'journal_photos', false);

create policy "Users can upload their own photos"
  on storage.objects for insert
  with check ( bucket_id = 'journal_photos' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can update their own photos"
  on storage.objects for update
  using ( bucket_id = 'journal_photos' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete their own photos"
  on storage.objects for delete
  using ( bucket_id = 'journal_photos' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can view their own photos"
  on storage.objects for select
  using ( bucket_id = 'journal_photos' and auth.uid()::text = (storage.foldername(name))[1] );