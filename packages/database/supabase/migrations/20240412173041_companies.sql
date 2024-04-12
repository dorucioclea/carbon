-- Update the company table to have a UUID id primary key instead of boolean primary key
-- This will allow us to have multiple companies in the future

ALTER TABLE "company" DROP CONSTRAINT IF EXISTS "company_pkey";
ALTER TABLE "company" DROP CONSTRAINT IF EXISTS "accountDefault_id_check";
ALTER TABLE "company" DROP CONSTRAINT IF EXISTS "accountDefault_id_unique";
ALTER TABLE "company" ADD COLUMN "tmpId" TEXT NOT NULL DEFAULT xid();
UPDATE "company" SET "tmpId" = xid();
ALTER TABLE "company" DROP COLUMN IF EXISTS "id";
ALTER TABLE "company" RENAME COLUMN "tmpId" TO "id";
ALTER TABLE "company" ADD CONSTRAINT "company_pkey" PRIMARY KEY ("id");

ALTER TABLE "customer" ADD COLUMN "companyId" TEXT REFERENCES "company" ("id") ON DELETE SET NULL;
ALTER TABLE "part" ADD COLUMN "companyId" TEXT REFERENCES "company" ("id") ON DELETE SET NULL;
ALTER TABLE "purchaseOrder" ADD COLUMN "companyId" TEXT REFERENCES "company" ("id") ON DELETE SET NULL;
ALTER TABLE "purchaseInvoice" ADD COLUMN "companyId" TEXT REFERENCES "company" ("id") ON DELETE SET NULL;
ALTER TABLE "quote" ADD COLUMN "companyId" TEXT REFERENCES "company" ("id") ON DELETE SET NULL;
ALTER TABLE "receipt" ADD COLUMN "companyId" TEXT REFERENCES "company" ("id") ON DELETE SET NULL;
ALTER TABLE "requestForQuote" ADD COLUMN "companyId" TEXT REFERENCES "company" ("id") ON DELETE SET NULL;
ALTER TABLE "service" ADD COLUMN "companyId" TEXT REFERENCES "company" ("id") ON DELETE SET NULL;
ALTER TABLE "supplier" ADD COLUMN "companyId" TEXT REFERENCES "company" ("id") ON DELETE SET NULL;