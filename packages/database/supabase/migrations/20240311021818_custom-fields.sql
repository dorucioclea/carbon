
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
  'Scheduling',
  'Timecards',
  'Users'
);

CREATE TABLE "customFieldTable" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "module" module NOT NULL,
  "table" TEXT NOT NULL,
  "name" TEXT NOT NULL,

  CONSTRAINT "customFieldTable_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customFieldTable_module_table_name_key" UNIQUE ("module", "table", "name")
);

CREATE INDEX "customFieldTable_module_idx" ON "customFieldTable" ("module");
CREATE INDEX "customFieldTable_table_idx" ON "customFieldTable" ("table");

ALTER TABLE "customFieldTable" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view custom field tables" ON "customFieldTable"
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE TABLE "customField" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "name" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 1,
  "customFieldTableId" TEXT NOT NULL,
  "dataTypeId" INTEGER NOT NULL,
  "listOptions" TEXT ARRAY,
  "active" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "createdBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE,
  "updatedBy" TEXT,

  CONSTRAINT "customField_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customField_customFieldTableId_name_key" UNIQUE ("customFieldTableId", "name"),
  CONSTRAINT "customField_customFieldTableId_fkey" FOREIGN KEY ("customFieldTableId") REFERENCES "customFieldTable"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "customField_dataTypeId_fkey" FOREIGN KEY ("dataTypeId") REFERENCES "attributeDataType"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "customField_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON UPDATE CASCADE,
  CONSTRAINT "customField_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON UPDATE CASCADE
);

ALTER TABLE "customField" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view custom fields" ON "customField"
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees with settings_create can insert custom fields" ON "customField"
  FOR INSERT
  WITH CHECK (   
    coalesce(get_my_claim('settings_create')::boolean,false) 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees with settings_update can update custom fields" ON "customField"
  FOR UPDATE
  USING (
    coalesce(get_my_claim('settings_update')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees with settings_delete can delete custom fields" ON "customField"
  FOR DELETE
  USING (
    coalesce(get_my_claim('settings_delete')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE OR REPLACE VIEW "customFieldTables" WITH(SECURITY_INVOKER=true) AS
SELECT 
  cft.id,
  cft.module,
  cft.table,
  cft.name,
  cf.fields
FROM "customFieldTable" cft
LEFT JOIN (
  SELECT cf."customFieldTableId", 
    COALESCE(json_agg(
      json_build_object(
        'id', id, 
        'name', name,
        'sortOrder', "sortOrder",
        'dataTypeId', "dataTypeId",
        'listOptions', "listOptions",
        'active', active
      )
    ), '[]') AS fields 
  FROM "customField" cf
  GROUP BY cf."customFieldTableId"
) cf
ON cf."customFieldTableId" = cft.id;