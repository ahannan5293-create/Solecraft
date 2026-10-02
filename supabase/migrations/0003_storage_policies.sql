-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

create policy "product_images_public_read" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "product_images_admin_insert" on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_update" on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_delete" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

create policy "product_models_public_read" on storage.objects for select
  using (bucket_id = 'product-models');
create policy "product_models_admin_insert" on storage.objects for insert
  with check (bucket_id = 'product-models' and public.is_admin());
create policy "product_models_admin_update" on storage.objects for update
  using (bucket_id = 'product-models' and public.is_admin());
create policy "product_models_admin_delete" on storage.objects for delete
  using (bucket_id = 'product-models' and public.is_admin());
