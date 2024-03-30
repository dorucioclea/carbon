-- these policies were taken from the purchasing-files migration
ALTER POLICY "Internal purchasing documents view requires purchasing_view" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('purchasing_view')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'purchasing'
    AND (storage.foldername(name))[2] = 'internal'
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);

ALTER POLICY "Internal purchasing documents insert requires purchasing_create" ON storage.objects 
WITH CHECK (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('purchasing_create')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'purchasing'
    AND (storage.foldername(name))[2] = 'internal'
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);



ALTER POLICY "Internal purchasing documents update requires purchasing_update" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('purchasing_update')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'purchasing'
    AND (storage.foldername(name))[2] = 'internal'
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);


ALTER POLICY "Internal purchasing documents delete requires purchasing_delete" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('purchasing_delete')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'purchasing'
    AND (storage.foldername(name))[2] = 'internal'
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);

DELETE FROM storage.buckets WHERE id = 'purchasing-internal';


-- External purchasing storage

ALTER POLICY "External purchasing documents view requires purchasing_view" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('purchasing_view')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'purchasing'
    AND (storage.foldername(name))[2] = 'external'
    AND (
      (get_my_claim('role'::text)) = '"employee"'::jsonb OR
      (
        (get_my_claim('role'::text)) = '"supplier"'::jsonb
      )
    )
);

ALTER POLICY "External purchasing documents insert requires purchasing_view" ON storage.objects 
WITH CHECK (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('purchasing_view')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'purchasing'
    AND (storage.foldername(name))[2] = 'external'
    AND (
      (get_my_claim('role'::text)) = '"employee"'::jsonb OR
      (
        (get_my_claim('role'::text)) = '"supplier"'::jsonb
      )
    )
);

ALTER POLICY "External purchasing documents update requires purchasing_update" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('purchasing_update')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'purchasing'
    AND (storage.foldername(name))[2] = 'external'
    AND (
      (get_my_claim('role'::text)) = '"employee"'::jsonb OR
      (
        (get_my_claim('role'::text)) = '"supplier"'::jsonb
      )
    )
);

ALTER POLICY "External purchasing documents delete requires purchasing_delete" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('purchasing_delete')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'purchasing'
    AND (storage.foldername(name))[2] = 'external'
    AND (
      (get_my_claim('role'::text)) = '"employee"'::jsonb OR
      (
        (get_my_claim('role'::text)) = '"supplier"'::jsonb
      )
    )
);

DELETE FROM storage.buckets WHERE id = 'purchasing-external';

-- Internal purchasing documents view

CREATE POLICY "Users with purchasing_view can view documents that start with purchasing" ON "document" 
  FOR SELECT USING (
    coalesce(get_my_claim('purchasing_view')::boolean, false) = true 
    AND (path LIKE 'purchasing%')
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );
  
CREATE POLICY "Users with purchasing_create can create documents that start with purchasing" ON "document" 
  FOR INSERT WITH CHECK (
    coalesce(get_my_claim('purchasing_create')::boolean, false) = true 
    AND (path LIKE 'purchasing%')
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Users with purchasing_update can update documents that start with purchasing" ON "document"
  FOR UPDATE USING (
    coalesce(get_my_claim('purchasing_update')::boolean, false) = true 
    AND (path LIKE 'purchasing%')
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Users with purchasing_delete can delete documents that start with purchasing" ON "document"
  FOR DELETE USING (
    coalesce(get_my_claim('purchasing_delete')::boolean, false) = true 
    AND (path LIKE 'purchasing%')
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

-- TODO: policies for suppliers

