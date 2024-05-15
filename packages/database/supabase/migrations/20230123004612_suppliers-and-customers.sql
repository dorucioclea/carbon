CREATE TABLE "country" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL
);

CREATE TABLE "contact" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "fullName" TEXT GENERATED ALWAYS AS ("firstName" || ' ' || "lastName") STORED,
  "email" TEXT NOT NULL,
  "title" TEXT,
  "mobilePhone" TEXT,
  "homePhone" TEXT,
  "workPhone" TEXT,
  "fax" TEXT,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "countryCode" INTEGER,
  "birthday" DATE,
  "notes" TEXT,
  "companyId" TEXT NOT NULL,

  CONSTRAINT "contact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "contact_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "contact_companyId_idx" ON "contact" ("companyId");

CREATE TABLE "address" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "countryCode" INTEGER,
  "phone" TEXT,
  "fax" TEXT,
  "companyId" TEXT NOT NULL,

  CONSTRAINT "address_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "address_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "address_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "address_companyId_idx" ON "address" ("companyId");

CREATE TABLE "supplierStatus" (
    "id" TEXT NOT NULL DEFAULT xid(),
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    "customFields" JSONB,

    CONSTRAINT "supplierStatus_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "supplierStatus_name_unique" UNIQUE ("name", "companyId"),
    CONSTRAINT "supplierStatus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "supplierStatus_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT "supplierStatus_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX "supplierStatus_companyId_fkey" ON "supplierStatus"("companyId");

CREATE TABLE "supplierType" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "protected" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    "customFields" JSONB,

    CONSTRAINT "supplierType_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "supplierType_name_unique" UNIQUE ("name", "companyId"),
    CONSTRAINT "supplierType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "supplierType_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT "supplierType_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX "supplierType_companyId_fkey" ON "supplierType"("companyId");

CREATE TABLE "supplier" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "supplierTypeId" TEXT,
    "supplierStatusId" TEXT,
    "taxId" TEXT,
    "accountManagerId" TEXT,
    "logo" TEXT,
    "assignee" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    "updatedBy" TEXT,
    "customFields" JSONB,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "supplier_supplierTypeId_fkey" FOREIGN KEY ("supplierTypeId") REFERENCES "supplierType"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "supplier_supplierStatusId_fkey" FOREIGN KEY ("supplierStatusId") REFERENCES "supplierStatus"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "supplier_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "supplier_assignee_fkey" FOREIGN KEY ("assignee") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "supplier_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON UPDATE CASCADE,
    CONSTRAINT "supplier_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON UPDATE CASCADE,
    CONSTRAINT "supplier_name_unique" UNIQUE ("name", "companyId")
);

CREATE INDEX "supplier_companyId_fkey" ON "supplier"("companyId");

ALTER publication supabase_realtime ADD TABLE "supplier";

CREATE TABLE "supplierLocation" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "supplierId" TEXT NOT NULL,
  "addressId" TEXT NOT NULL,
  "customFields" JSONB,

  CONSTRAINT "supplierLocation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "supplierLocation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "supplierLocation_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE "supplierContact" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "supplierId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "supplierLocationId" TEXT,
  "userId" TEXT,
  "customFields" JSONB,

  CONSTRAINT "supplierContact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "supplierContact_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "supplierContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "supplierContact_supplierLocationId_fkey" FOREIGN KEY ("supplierLocationId") REFERENCES "supplierLocation"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "supplierContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX "supplierContact_supplierId_idx" ON "supplierContact"("supplierId");

CREATE TABLE "supplierAccount" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "supplierAccount_pkey" PRIMARY KEY ("id", "companyId"),
    CONSTRAINT "supplierAccount_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "supplierAccount_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "supplierAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "supplierAccount_supplierId_idx" ON "supplierAccount"("supplierId");
CREATE INDEX "supplierAccount_companyId_idx" ON "supplierAccount" ("companyId");

CREATE TABLE "customerStatus" (
    "id" TEXT NOT NULL DEFAULT xid(),
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    "customFields" JSONB,

    CONSTRAINT "customerStatus_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customerStatus_name_unique" UNIQUE ("name", "companyId"),
    CONSTRAINT "customerStatus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "customerStatus_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT "customerStatus_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX "customerStatus_companyId_fkey" ON "customerStatus"("companyId");

CREATE TABLE "customerType" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "protected" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    "customFields" JSONB,

    CONSTRAINT "customerType_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customerType_name_unique" UNIQUE ("name", "companyId"),
    CONSTRAINT "customerType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "customerType_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT "customerType_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX "customerType_companyId_fkey" ON "customerType"("companyId");

CREATE TABLE "customer" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "customerTypeId" TEXT,
    "customerStatusId" TEXT,
    "taxId" TEXT,
    "accountManagerId" TEXT,
    "logo" TEXT,
    "assignee" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    "updatedBy" TEXT,
    "customFields" JSONB,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customer_customerTypeId_fkey" FOREIGN KEY ("customerTypeId") REFERENCES "customerType"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_customerStatusId_fkey" FOREIGN KEY ("customerStatusId") REFERENCES "customerStatus"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_assignee_fkey" FOREIGN KEY ("assignee") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "customer_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_name_unique" UNIQUE ("name", "companyId")
);

CREATE INDEX "customer_companyId_fkey" ON "customer"("companyId");

ALTER publication supabase_realtime ADD TABLE "customer";

CREATE TABLE "customerLocation" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "customerId" TEXT NOT NULL,
  "addressId" TEXT NOT NULL,
  "customFields" JSONB,

  CONSTRAINT "customerLocation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customerLocation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "customerLocation_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE "customerContact" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "customerId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "customerLocationId" TEXT,
  "userId" TEXT,
  "customFields" JSONB,

  CONSTRAINT "customerContact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customerContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "customerContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "customerContact_customerLocationId_fkey" FOREIGN KEY ("customerLocationId") REFERENCES "customerLocation"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "customerContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX "customerContact_customerId_idx" ON "customerContact"("customerId");

CREATE TABLE "customerAccount" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "customerAccount_pkey" PRIMARY KEY ("id", "companyId"),
    CONSTRAINT "customerAccount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customerAccount_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customerAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "customerAccount_customerId_idx" ON "customerAccount"("customerId");
CREATE INDEX "customerAccount_companyId_idx" ON "customerAccount" ("companyId");


