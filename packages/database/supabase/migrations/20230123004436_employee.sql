CREATE TABLE "employee" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "employeeTypeId" TEXT NOT NULL,
    CONSTRAINT "employee_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "employee_employeeTypeId_fkey" FOREIGN KEY ("employeeTypeId") REFERENCES "employeeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "employee_employeeCompany_unique" UNIQUE ("id", "companyId")
);

CREATE INDEX "employee_companyId_idx" ON "employee" ("companyId");

ALTER TABLE "employee" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Employees can view employees from their company" ON "employee" FOR SELECT USING (
    is_claims_admin() OR
    "companyId" IN (
        SELECT "companyId" FROM "userToCompany" WHERE "userId" = auth.uid()::text
    )
);

CREATE POLICY "Employees with users_update can create employees" ON "employee" FOR INSERT WITH CHECK (
    has_company_permission('users_create', "companyId")
);

CREATE POLICY "Employees with users_update can update employees" ON "employee" FOR UPDATE USING (
    has_company_permission('users_update', "companyId")
);

CREATE POLICY "Employees with users_update can delete employees" ON "employee" FOR DELETE USING (
    has_company_permission('users_delete', "companyId")
);