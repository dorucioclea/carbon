CREATE TABLE "company" (
  "id" TEXT NOT NULL DEFAULT xid(),
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
  
  CONSTRAINT "company_pkey" PRIMARY KEY ("id"),
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
    has_any_company_permission('settings_create')
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
    has_company_permission('settings_delete', "id")
  );

CREATE TABLE "userToCompany" (
  "userId" TEXT NOT NULL REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "companyId" TEXT NOT NULL REFERENCES "company" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE "userToCompany" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view userToCompany" ON "userToCompany"
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
  );

CREATE POLICY "Employees with users_create can create userToCompany" ON "userToCompany"
  FOR INSERT
  WITH CHECK (
    has_company_permission('users_create', "companyId")
  );

CREATE POLICY "Employees with users_update can update userToCompany" ON "userToCompany"
  FOR UPDATE
  USING (
    has_company_permission('users_update', "companyId")
  );

CREATE POLICY "Employees with users_delete can delete userToCompany" ON "userToCompany"
  FOR DELETE
  USING (
    has_company_permission('users_delete', "companyId")
  );