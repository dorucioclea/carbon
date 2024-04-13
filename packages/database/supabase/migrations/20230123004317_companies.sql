CREATE TABLE "company" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "taxId" TEXT,
  "logo" TEXT,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "countryCode" TEXT,
  "phone" TEXT,
  "fax" TEXT,
  "email" TEXT,
  "website" TEXT,
  "updatedBy" TEXT,
  
  CONSTRAINT "accountDefault_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id")
);

ALTER TABLE "company" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view company" ON "company"
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
  );

CREATE POLICY "Employees with settings_create can create company" ON "company"
  FOR INSERT
  WITH CHECK (
    coalesce(get_my_claim('settings_create')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees with settings_update can update company" ON "company"
  FOR UPDATE
  USING (
    coalesce(get_my_claim('settings_update')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE TABLE "userToCompany" (
  "userId" TEXT NOT NULL REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "companyId" INTEGER NOT NULL REFERENCES "company" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);