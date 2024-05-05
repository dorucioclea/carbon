-- Enable the "pg_jsonschema" extension
CREATE EXTENSION pg_jsonschema WITH SCHEMA extensions;

CREATE TABLE "integration" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "logoPath" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT FALSE,
  "visible" BOOLEAN NOT NULL DEFAULT TRUE,
  "jsonschema" JSON NOT NULL,
  "metadata" JSON NOT NULL DEFAULT '{}',
  "companyId" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedBy" TEXT,

  CONSTRAINT integration_pkey PRIMARY KEY ("id", "companyId"),
  CONSTRAINT integration_metadata CHECK (
    active = false OR
    json_matches_schema(jsonschema, metadata)
  ),
  CONSTRAINT "integration_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON UPDATE CASCADE
);

CREATE POLICY "Employees with settings_view can view integrations." ON "integration"
  FOR SELECT USING (
    has_role('employee') AND
    has_company_permission('settings_view', "companyId")
  );

CREATE POLICY "Employees with settings_update can update integrations." ON "integration"
  FOR UPDATE
  USING (
    has_role('employee') AND
    has_company_permission('settings_update', "companyId")
  );
