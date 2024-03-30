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

DROP VIEW "documents";
CREATE OR REPLACE VIEW "documents" WITH(SECURITY_INVOKER=true) AS 
  SELECT
    d.*,  
    ARRAY(SELECT dl.label FROM "documentLabel" dl WHERE dl."documentId" = d.id AND dl."userId" = auth.uid()::text) AS labels,
    EXISTS(SELECT 1 FROM "documentFavorite" df WHERE df."documentId" = d.id AND df."userId" = auth.uid()::text) AS favorite,
    (SELECT MAX("createdAt") FROM "documentTransaction" dt WHERE dt."documentId" = d.id) AS "lastActivityAt"
  FROM "document" d
  LEFT JOIN "user" u ON u.id = d."createdBy"
  LEFT JOIN "user" u2 ON u2.id = d."updatedBy";