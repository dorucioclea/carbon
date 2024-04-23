-- Internal purchasing documents view

CREATE POLICY "Users with purchasing_view can view documents that start with purchasing" ON "document" 
  FOR SELECT USING (
    has_role('employee')
    AND (storage.foldername(path))[1] = ANY(
            get_permission_companies_as_text('purchasing_view')
        )
    AND (storage.foldername(path))[2] = 'purchasing'
  );
  
CREATE POLICY "Users with purchasing_create can create documents that start with purchasing" ON "document" 
  FOR INSERT WITH CHECK (
    has_role('employee')
    AND (storage.foldername(path))[1] = ANY(
            get_permission_companies_as_text('purchasing_create')
        )
    AND (storage.foldername(path))[2] = 'purchasing'
  );

CREATE POLICY "Users with purchasing_update can update documents that start with purchasing" ON "document"
  FOR UPDATE USING (
    has_role('employee')
    AND (storage.foldername(path))[1] = ANY(
            get_permission_companies_as_text('purchasing_update')
        )
    AND (storage.foldername(path))[2] = 'purchasing'
  );

CREATE POLICY "Users with purchasing_delete can delete documents that start with purchasing" ON "document"
  FOR DELETE USING (
    has_role('employee')
    AND (storage.foldername(path))[1] = ANY(
            get_permission_companies_as_text('purchasing_delete')
        )
    AND (storage.foldername(path))[2] = 'purchasing'
  );

-- TODO: policies for suppliers

