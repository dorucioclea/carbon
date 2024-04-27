
CREATE TYPE module AS ENUM (
  'Accounting',
  'Documents',
  'Invoicing',
  'Inventory',
  'Jobs',
  'Messaging',
  'Parts',
  'Purchasing',
  'Resources',
  'Sales',
  'Settings',
  'Scheduling',
  'Timecards',
  'Users'
);

CREATE VIEW "modules" AS
    SELECT unnest(enum_range(NULL::module)) AS name;


CREATE TABLE "employeeTypePermission" (
    "employeeTypeId" TEXT NOT NULL,
    "module" module NOT NULL,
    "create" INTEGER[] NOT NULL DEFAULT '{}',
    "delete" INTEGER[] NOT NULL DEFAULT '{}',
    "update" INTEGER[] NOT NULL DEFAULT '{}',
    "view" INTEGER[] NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE,

    CONSTRAINT "employeeTypePermission_pkey" PRIMARY KEY ("employeeTypeId", "module"),
    CONSTRAINT "employeeTypePermission_employeeTypeId_fkey" FOREIGN KEY ("employeeTypeId") REFERENCES "employeeType"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "employeeTypePermission" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only claims admin can view/modify permissions for employee types" ON "employeeTypePermission" FOR ALL USING (is_claims_admin());


