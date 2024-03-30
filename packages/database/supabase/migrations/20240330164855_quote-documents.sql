-- these policies were taken from the quote-files migration
ALTER POLICY "Internal quote documents view requires sales_view" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('sales_view')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'quote'
    AND (storage.foldername(name))[2] = 'internal'
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);

ALTER POLICY "Internal quote documents insert requires sales_create" ON storage.objects 
WITH CHECK (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('sales_create')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'quote'
    AND (storage.foldername(name))[2] = 'internal'
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);



ALTER POLICY "Internal quote documents update requires sales_update" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('sales_update')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'quote'
    AND (storage.foldername(name))[2] = 'internal'
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);


ALTER POLICY "Internal quote documents delete requires sales_delete" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('sales_delete')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'quote'
    AND (storage.foldername(name))[2] = 'internal'
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);

DELETE FROM storage.buckets WHERE id = 'quote-internal';


-- External quote storage

ALTER POLICY "External quote documents view requires sales_view" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('sales_view')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'quote'
    AND (storage.foldername(name))[2] = 'external'
    AND (
      (get_my_claim('role'::text)) = '"employee"'::jsonb OR
      (
        (get_my_claim('role'::text)) = '"supplier"'::jsonb
      )
    )
);

ALTER POLICY "External quote documents insert requires sales_view" ON storage.objects 
WITH CHECK (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('sales_view')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'quote'
    AND (storage.foldername(name))[2] = 'external'
    AND (
      (get_my_claim('role'::text)) = '"employee"'::jsonb OR
      (
        (get_my_claim('role'::text)) = '"supplier"'::jsonb
      )
    )
);

ALTER POLICY "External quote documents update requires sales_update" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('sales_update')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'quote'
    AND (storage.foldername(name))[2] = 'external'
    AND (
      (get_my_claim('role'::text)) = '"employee"'::jsonb OR
      (
        (get_my_claim('role'::text)) = '"supplier"'::jsonb
      )
    )
);

ALTER POLICY "External quote documents delete requires sales_delete" ON storage.objects 
USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND coalesce(get_my_claim('sales_delete')::boolean, false) = true
    AND (storage.foldername(name))[1] = 'quote'
    AND (storage.foldername(name))[2] = 'external'
    AND (
      (get_my_claim('role'::text)) = '"employee"'::jsonb OR
      (
        (get_my_claim('role'::text)) = '"supplier"'::jsonb
      )
    )
);

DELETE FROM storage.buckets WHERE id = 'quote-external';

-- Internal quote documents view

CREATE POLICY "Users with sales_view can view documents that start with quote" ON "document" 
  FOR SELECT USING (
    coalesce(get_my_claim('sales_view')::boolean, false) = true 
    AND (path LIKE 'quote%')
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );
  
CREATE POLICY "Users with sales_create can create documents that start with quote" ON "document" 
  FOR INSERT WITH CHECK (
    coalesce(get_my_claim('sales_create')::boolean, false) = true 
    AND (path LIKE 'quote%')
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Users with sales_update can update documents that start with quote" ON "document"
  FOR UPDATE USING (
    coalesce(get_my_claim('sales_update')::boolean, false) = true 
    AND (path LIKE 'quote%')
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Users with sales_delete can delete documents that start with quote" ON "document"
  FOR DELETE USING (
    coalesce(get_my_claim('sales_delete')::boolean, false) = true 
    AND (path LIKE 'quote%')
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

-- TODO: policies for suppliers

