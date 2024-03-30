CREATE FUNCTION public.delete_orphaned_documents()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.document WHERE path = old.name;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER delete_orphaned_storage_documents
  AFTER DELETE on storage."objects"
  FOR EACH ROW EXECUTE PROCEDURE public.delete_orphaned_documents();