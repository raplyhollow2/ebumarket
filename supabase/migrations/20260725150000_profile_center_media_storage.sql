-- Live image storage for profile themes + donation centre covers

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-media', 'profile-media', true),
  ('center-media', 'center-media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- profile-media: public read; owner folder = auth.uid()
DROP POLICY IF EXISTS "profile_media_public_read" ON storage.objects;
CREATE POLICY "profile_media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-media');

DROP POLICY IF EXISTS "profile_media_auth_upload" ON storage.objects;
CREATE POLICY "profile_media_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-media'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "profile_media_owner_update" ON storage.objects;
CREATE POLICY "profile_media_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "profile_media_owner_delete" ON storage.objects;
CREATE POLICY "profile_media_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- center-media: public read; admins upload/update/delete
DROP POLICY IF EXISTS "center_media_public_read" ON storage.objects;
CREATE POLICY "center_media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'center-media');

DROP POLICY IF EXISTS "center_media_admin_upload" ON storage.objects;
CREATE POLICY "center_media_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'center-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "center_media_admin_update" ON storage.objects;
CREATE POLICY "center_media_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'center-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "center_media_admin_delete" ON storage.objects;
CREATE POLICY "center_media_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'center-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
