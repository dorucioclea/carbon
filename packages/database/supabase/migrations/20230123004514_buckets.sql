INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('public', 'public', true), 
  ('avatars', 'avatars', true),
  ('private', 'private', false);

CREATE POLICY "Anyone can read public buckets"
ON storage.objects FOR SELECT USING (
    bucket_id = 'public'
    AND (auth.role() = 'authenticated')
);

CREATE POLICY "Employees with settings_create can insert into the public bucket"
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'public'
    AND (auth.role() = 'authenticated')
    -- AND (
    --     CAST((storage.foldername(name))[1] AS INTEGER) = ANY(
    --         coalesce(
    --             get_permission_companies('settings_create')::integer[],
    --             array[]::integer[]
    --         )
    --     )
    -- )
);

CREATE POLICY "Employees with settings_update can update the public bucket"
ON storage.objects FOR UPDATE USING (
    bucket_id = 'public'
    AND (auth.role() = 'authenticated')
    -- AND (
    --     CAST((storage.foldername(name))[1] AS INTEGER) = ANY(
    --         coalesce(
    --             get_permission_companies('settings_update')::integer[],
    --             array[]::integer[]
    --         )
    --     )
    -- )
);

CREATE POLICY "Employees with settings_delete can delete from public bucket"
ON storage.objects FOR DELETE USING (
    bucket_id = 'public'
    AND (auth.role() = 'authenticated')
    -- AND (
    --     CAST((storage.foldername(name))[1] AS INTEGER) = ANY(
    --         coalesce(
    --             get_permission_companies('settings_delete')::integer[],
    --             array[]::integer[]
    --         )
    --     )
    -- )
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT USING (
    bucket_id = 'avatars'
    AND (auth.role() = 'authenticated')
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars'
    AND (auth.role() = 'authenticated')
    AND storage.filename(name) LIKE concat(auth.uid()::text, '%')
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars'
    AND (auth.role() = 'authenticated')
    AND storage.filename(name) LIKE concat(auth.uid()::text, '%')
);

CREATE POLICY "Users can insert their own avatars"
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.role() = 'authenticated')
    AND storage.filename(name) LIKE concat(auth.uid()::text, '%')
);