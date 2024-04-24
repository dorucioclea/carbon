-- Internal quote documents view

CREATE POLICY "Users with sales_view can view documents that start with quote" ON "document" 
  FOR SELECT USING (
    has_role('employee')
    AND (storage.foldername(path))[1] = ANY(
            get_permission_companies_as_text('sales_view')
        )
    AND (storage.foldername(path))[2] = 'quote'
  );
  
CREATE POLICY "Users with sales_create can create documents that start with quote" ON "document" 
  FOR INSERT WITH CHECK (
    has_role('employee')
    AND (storage.foldername(path))[1] = ANY(
            get_permission_companies_as_text('sales_create')
        )
    AND (storage.foldername(path))[2] = 'quote'
  );

CREATE POLICY "Users with sales_update can update documents that start with quote" ON "document"
  FOR UPDATE USING (
    has_role('employee')
    AND (storage.foldername(path))[1] = ANY(
            get_permission_companies_as_text('sales_update')
        )
    AND (storage.foldername(path))[2] = 'quote'
  );

CREATE POLICY "Users with sales_delete can delete documents that start with quote" ON "document"
  FOR DELETE USING (
    has_role('employee')
    AND (storage.foldername(path))[1] = ANY(
            get_permission_companies_as_text('sales_delete')
        )
    AND (storage.foldername(path))[2] = 'quote'
  );

-- TODO: policies for suppliers

