
CREATE TYPE "searchEntity" AS ENUM ('Resource', 'Person', 'Customer', 'Supplier', 'Job', 'Part', 'Purchase Order', 'Lead', 'Opportunity', 'Quotation', 'Sales Order', 'Request for Quotation', 'Sales Invoice', 'Purchase Invoice', 'Document');

CREATE TABLE search (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  entity "searchEntity",
  uuid TEXT,
  link TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,

  CONSTRAINT search_uuid_unique UNIQUE (uuid),
  CONSTRAINT search_companyId_fkey FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "search_companyId_idx" ON "search" ("companyId");

ALTER TABLE
  public.search
ADD COLUMN
  fts tsvector GENERATED always as (to_tsvector('english', name || ' ' || description)) STORED;

CREATE INDEX index_search_uuid ON public.search (uuid);
CREATE INDEX index_search_fts ON public.search USING GIN (fts); 
CREATE INDEX index_search_companyId ON public.search ("companyId");

CREATE FUNCTION public.create_employee_search_result()
RETURNS TRIGGER AS $$
DECLARE
  employee TEXT;
BEGIN
  employee := (SELECT u."fullName" FROM public.user u WHERE u.id = new.id);
  INSERT INTO public.search(name, entity, uuid, link, "companyId")
  VALUES (employee, 'Person', new.id, '/x/person/' || new.id, new."companyId");
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_employee_search_result
  AFTER INSERT on public.employee
  FOR EACH ROW EXECUTE PROCEDURE public.create_employee_search_result();

CREATE FUNCTION public.update_employee_search_result()
RETURNS TRIGGER AS $$
BEGIN
  IF (new.active = false) THEN
    DELETE FROM public.search
    WHERE entity = 'Person' AND uuid = new.id;
    RETURN new;
  END IF;
  IF (old."fullName" <> new."fullName") THEN
    UPDATE public.search SET name = new."fullName"
    WHERE entity = 'Person' AND uuid = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_employee_search_result
  AFTER UPDATE on public.user
  FOR EACH ROW EXECUTE PROCEDURE public.update_employee_search_result();

CREATE FUNCTION public.create_customer_search_result()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.search(name, entity, uuid, link, "companyId")
  VALUES (new.name, 'Customer', new.id, '/x/customer/' || new.id, new."companyId");
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_customer_search_result
  AFTER INSERT on public.customer
  FOR EACH ROW EXECUTE PROCEDURE public.create_customer_search_result();

CREATE FUNCTION public.update_customer_search_result()
RETURNS TRIGGER AS $$
BEGIN
  IF (old.name <> new.name) THEN
    UPDATE public.search SET name = new.name
    WHERE entity = 'Customer' AND uuid = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_customer_search_result
  AFTER UPDATE on public.customer
  FOR EACH ROW EXECUTE PROCEDURE public.update_customer_search_result();

CREATE FUNCTION public.create_supplier_search_result()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.search(name, entity, uuid, link, "companyId")
  VALUES (new.name, 'Supplier', new.id, '/x/supplier/' || new.id, new."companyId");
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_supplier_search_result
  AFTER INSERT on public.supplier
  FOR EACH ROW EXECUTE PROCEDURE public.create_supplier_search_result();

CREATE FUNCTION public.update_supplier_search_result()
RETURNS TRIGGER AS $$
BEGIN
  IF (old.name <> new.name) THEN
    UPDATE public.search SET name = new.name
    WHERE entity = 'Supplier' AND uuid = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_supplier_search_result
  AFTER UPDATE on public.supplier
  FOR EACH ROW EXECUTE PROCEDURE public.update_supplier_search_result();

ALTER TABLE "search" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with sales_view can search for customers and sales orders" ON "search"
  FOR SELECT
  USING (has_company_permission('sales_view', "companyId") AND entity IN ('Customer', 'Sales Order', 'Quotation') AND has_role('employee'));

-- TODO: customers should be able to search for their own sales orders
-- CREATE POLICY "Customers with sales_view can search for their own sales orders" ON "search"
--   FOR SELECT
--   USING (
--     has_company_permission('sales_view', "companyId") 
--     AND entity = 'Sales Order' 
--     AND (get_my_claim('role'::text)) = '"customer"'::jsonb
--     AND uuid IN (
--        SELECT id FROM "salesOrder" WHERE "customerId" IN (
--          SELECT "customerId" FROM "salesOrder" WHERE "customerId" IN (
--            SELECT "customerId" FROM "customerAccount" WHERE id::uuid = auth.uid()
--          )
--        )
--      )
--   )

CREATE POLICY "Employees with purchasing_view can search for suppliers and purchase orders" ON "search"
  FOR SELECT
  USING (has_company_permission('purchasing_view', "companyId") AND entity IN ('Supplier', 'Purchase Order', 'Request for Quotation') AND (get_my_claim('role'::text)) = '"employee"'::jsonb);


CREATE POLICY "Employees with resources_view can search for resources" ON "search"
  FOR SELECT
  USING (has_company_permission('resources_view', "companyId") AND entity = 'Resource');

CREATE POLICY "Employees with resources_view can search for people" ON "search"
  FOR SELECT
  USING (has_company_permission('resources_view', "companyId") AND entity = 'Person');

-- TODO: documents should be filtered based on visibility
CREATE POLICY "Employees with document_view can search for documents" ON "search"
  FOR SELECT
  USING (has_company_permission('document_view', "companyId") AND entity = 'Document' AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Employees with parts can search for parts" ON "search"
  FOR SELECT
  USING (has_company_permission('parts_view', "companyId") AND entity = 'Part' AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

-- TODO: suppliers should be able to search for parts that they supply

CREATE POLICY "Employees with jobs_view can search for jobs" ON "search"
  FOR SELECT
  USING (has_company_permission('jobs_view', "companyId") AND entity = 'Job' AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

-- TODO: customers should be able to search for their jobs