CREATE TABLE "employee" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "employeeTypeId" TEXT NOT NULL,
    CONSTRAINT "employee_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "employee_employeeTypeId_fkey" FOREIGN KEY ("employeeTypeId") REFERENCES "employeeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "employee_employeeCompany_unique" UNIQUE ("id", "companyId")
);

ALTER TABLE "employee" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only claims admin can view/modify employees" ON "employee" FOR ALL USING (is_claims_admin());
CREATE POLICY "Anyone that's authenticated can view employees" ON "employee" FOR SELECT USING (auth.role() = 'authenticated');
