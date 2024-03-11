
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

CREATE INDEX "customFieldTable_module_index" ON "customFieldTable" ("module");
CREATE INDEX "customFieldTable_table_index" ON "customFieldTable" ("table");

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
  "attributeDataTypeId" INTEGER NOT NULL,
  "listOptions" TEXT ARRAY,
  "active" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "createdBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE,
  "updatedBy" TEXT,

  CONSTRAINT "customField_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customField_customFieldTableId_fkey" FOREIGN KEY ("customFieldTableId") REFERENCES "customFieldTable"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "customField_attributeDataTypeId_fkey" FOREIGN KEY ("attributeDataTypeId") REFERENCES "attributeDataType"("id") ON DELETE CASCADE ON UPDATE CASCADE,
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

CREATE TABLE "customFieldValue" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "customFieldId" TEXT NOT NULL,
  "recordId" TEXT NOT NULL,
  "valueBoolean" BOOLEAN,
  "valueDate" DATE,
  "valueNumeric" NUMERIC,
  "valueText" TEXT,
  "valueUser" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "createdBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE,
  "updatedBy" TEXT,

  CONSTRAINT "customFieldValue_singleValue"
    CHECK (
      (
        "valueBoolean" IS NOT NULL AND
        "valueDate" IS NULL AND
        "valueNumeric" IS NULL AND
        "valueText" IS NULL AND
        "valueUser" IS NULL
      ) 
      OR (
        "valueBoolean" IS NULL AND
        "valueDate" IS NULL AND
        "valueNumeric" IS NULL AND
        "valueText" IS NOT NULL AND
        "valueUser" IS NULL
      ) 
      OR (
        "valueBoolean" IS NULL AND
        "valueDate" IS NOT NULL AND
        "valueNumeric" IS NULL AND
        "valueText" IS NULL AND
        "valueUser" IS NULL
      ) 
      OR (
        "valueBoolean" IS NULL AND
        "valueDate" IS NULL AND
        "valueNumeric" IS NOT NULL AND
        "valueText" IS NULL AND
        "valueUser" IS NULL
      ) 
      OR (
        "valueBoolean" IS NULL AND
        "valueDate" IS NULL AND
        "valueNumeric" IS NULL AND
        "valueText" IS NULL AND
        "valueUser" IS NOT NULL
      ) 
    ),

  CONSTRAINT "customFieldValue_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "customField"("id") ON DELETE CASCADE,
  CONSTRAINT "customFieldValue_valueUser_fkey" FOREIGN KEY ("valueUser") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "customFieldValue_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id"),
  CONSTRAINT "customFieldValue_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id"),
  CONSTRAINT uq_customFieldId_recordId 
    UNIQUE ( "customFieldId", "recordId")
);

CREATE INDEX "customFieldValue_customFieldId_index" ON "customFieldValue" ("customFieldId");
CREATE INDEX "customFieldValue_recordId_index" ON "customFieldValue" ("recordId");

-- TODO: fine-grained control over read/write access to custom field values based on customFieldTable module

ALTER TABLE "customFieldValue" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view custom field values" ON "customFieldValue"
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees can insert custom field values" ON "customFieldValue"
  FOR INSERT
  WITH CHECK (   
    auth.role() = 'authenticated' 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees can update custom field values" ON "customFieldValue"
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees can delete custom field values" ON "customFieldValue"
  FOR DELETE
  USING (
    auth.role() = 'authenticated' 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

