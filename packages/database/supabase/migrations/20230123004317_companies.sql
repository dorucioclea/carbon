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
    is_claims_admin()
  );

CREATE POLICY "Employees with settings_update can update company" ON "company"
  FOR UPDATE
  USING (
    has_role('employee') AND
    has_company_permission('settings_update', "id")
  );

CREATE POLICY "Employees with settings_delete can delete company" ON "company"
  FOR DELETE
  USING (
    is_claims_admin()
  );

CREATE TABLE "userToCompany" (
  "userId" TEXT NOT NULL REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "companyId" INTEGER NOT NULL REFERENCES "company" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);