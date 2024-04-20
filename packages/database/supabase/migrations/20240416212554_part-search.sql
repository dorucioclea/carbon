CREATE OR REPLACE FUNCTION public.update_quotation_search_result()
RETURNS TRIGGER AS $$
BEGIN
  IF (old."quoteId" <> new."quoteId" OR old."name" <> new."name") THEN
    UPDATE public.search SET name = new."quoteId", description = new.name
    WHERE entity = 'Quotation' AND uuid = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER update_quotation_search_result
  AFTER UPDATE on public."quote"
  FOR EACH ROW EXECUTE PROCEDURE public.update_quotation_search_result();

CREATE OR REPLACE FUNCTION public.update_part_search_result()
RETURNS TRIGGER AS $$
BEGIN
  IF (old.name <> new.name OR old.description <> new.description) THEN
    UPDATE public.search SET name = new.id, description = new.name || ' ' || COALESCE(new.description, '')
    WHERE entity = 'Part' AND uuid = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER update_part_search_result
  AFTER UPDATE on public.part
  FOR EACH ROW EXECUTE PROCEDURE public.update_part_search_result();

CREATE OR REPLACE FUNCTION public.create_part_search_result()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.search(name, description, entity, uuid, link)
  VALUES (new.id, new.name || ' ' || COALESCE(new.description, ''), 'Part', new.id, '/x/part/' || new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER create_part_search_result
  AFTER INSERT on public.part
  FOR EACH ROW EXECUTE PROCEDURE public.create_part_search_result();