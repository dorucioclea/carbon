-- Internal quote documents

CREATE POLICY "Internal quote documents view requires sales_view" ON storage.objects 
FOR SELECT USING (
    bucket_id = 'private'
    AND has_role('employee')
    AND (storage.foldername(name))[1] = ANY(
            get_permission_companies('sales_view')
        )
    AND (storage.foldername(name))[2] = 'quote'
    AND (storage.foldername(name))[3] = 'internal'
);

CREATE POLICY "Internal quote documents insert requires sales_create" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'private'
    AND has_role('employee')
    AND (storage.foldername(name))[1] = ANY(
            get_permission_companies('sales_create')
        )
    AND (storage.foldername(name))[2] = 'quote'
    AND (storage.foldername(name))[3] = 'internal'
);

CREATE POLICY "Internal quote documents update requires sales_update" ON storage.objects 
FOR UPDATE USING (
    bucket_id = 'private'
    AND has_role('employee')
    AND (storage.foldername(name))[1] = ANY(
            get_permission_companies('sales_update')
        )
    AND (storage.foldername(name))[2] = 'quote'
    AND (storage.foldername(name))[3] = 'internal'
);

CREATE POLICY "Internal quote documents delete requires sales_delete" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'private'
    AND has_role('employee')
    AND (storage.foldername(name))[1] = ANY(
            get_permission_companies('sales_delete')
        )
    AND (storage.foldername(name))[2] = 'quote'
    AND (storage.foldername(name))[3] = 'internal'
);

-- External quote documents

CREATE POLICY "External quote documents view requires sales_view" ON storage.objects 
FOR SELECT USING (
    bucket_id = 'private'
    AND has_role('employee')
    AND (storage.foldername(name))[1] = ANY(
            get_permission_companies('sales_view')
        )
    AND (storage.foldername(name))[2] = 'quote'
    AND (storage.foldername(name))[3] = 'external'
);

CREATE POLICY "External quote documents insert requires sales_create" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'private'
    AND has_role('employee')
    AND (storage.foldername(name))[1] = ANY(
            get_permission_companies('sales_create')
        )
    AND (storage.foldername(name))[2] = 'quote'
    AND (storage.foldername(name))[3] = 'external'
);

CREATE POLICY "External quote documents update requires sales_update" ON storage.objects 
FOR UPDATE USING (
    bucket_id = 'private'
    AND has_role('employee')
    AND (storage.foldername(name))[1] = ANY(
            get_permission_companies('sales_update')
        )
    AND (storage.foldername(name))[2] = 'quote'
    AND (storage.foldername(name))[3] = 'external'
);

CREATE POLICY "External quote documents delete requires sales_delete" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'private'
    AND has_role('employee')
    AND (storage.foldername(name))[1] = ANY(
            get_permission_companies('sales_delete')
        )
    AND (storage.foldername(name))[2] = 'quote'
    AND (storage.foldername(name))[3] = 'external'
);