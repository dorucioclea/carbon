CREATE TYPE "salesOrderStatus" AS ENUM (
  'Draft',
  'Needs Approval',
  'Confirmed',
  'In Progress',
  'Completed',
  'Invoiced',
  'Cancelled'
);

CREATE TABLE "salesOrder" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "salesOrderId" TEXT NOT NULL,
  "revisionId" INTEGER NOT NULL DEFAULT 0,
  "status" "salesOrderStatus" NOT NULL DEFAULT 'Draft',
  "orderDate" DATE NOT NULL DEFAULT CURRENT_DATE,
  "notes" TEXT,
  "customerId" TEXT NOT NULL,
  "customerLocationId" TEXT,
  "customerContactId" TEXT,
  "customerReference" TEXT,
  "closedAt" DATE,
  "closedBy" TEXT,
  "customFields" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "createdBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE,
  "updatedBy" TEXT,

  CONSTRAINT "salesOrder_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "salesOrder_salesOrderId_key" UNIQUE ("salesOrderId"),
  CONSTRAINT "salesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrder_customerLocationId_fkey" FOREIGN KEY ("customerLocationId") REFERENCES "customerLocation" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "salesOrder_customerContactId_fkey" FOREIGN KEY ("customerContactId") REFERENCES "customerContact" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "salesOrder_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "user" ("id") ON DELETE RESTRICT,
  CONSTRAINT "salesOrder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user" ("id") ON DELETE RESTRICT,
  CONSTRAINT "salesOrder_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id") ON DELETE RESTRICT
);

CREATE INDEX "salesOrder_salesOrderId_idx" ON "salesOrder" ("salesOrderId");
CREATE INDEX "salesOrder_customerId_idx" ON "salesOrder" ("customerId");
CREATE INDEX "salesOrder_customerContactId_idx" ON "salesOrder" ("customerContactId");
CREATE INDEX "salesOrder_status_idx" ON "salesOrder" ("status");

CREATE TYPE "salesOrderLineType" AS ENUM (
  'Comment',
  'G/L Account',
  'Part',
  'Service',
  'Fixed Asset'
);

CREATE TABLE "salesOrderStatusHistory" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "salesOrderId" TEXT NOT NULL,
  "status" "salesOrderStatus" NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "createdBy" TEXT NOT NULL,

  CONSTRAINT "salesOrderStatusHistory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "salesOrderStatusHistory_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "salesOrder" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderStatusHistory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user" ("id") ON DELETE RESTRICT
);


CREATE TABLE "salesOrderLine" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "salesOrderId" TEXT NOT NULL,
  "salesOrderLineType" "salesOrderLineType" NOT NULL,
  "partId" TEXT,
  "serviceId" TEXT,
  "accountNumber" TEXT,
  "assetId" TEXT,
  "description" TEXT,
  "saleQuantity" NUMERIC(9,2) DEFAULT 0,
  "quantityToSend" NUMERIC(9,2) GENERATED ALWAYS AS (CASE WHEN "salesOrderLineType" = 'Comment' THEN 0 ELSE GREATEST(("saleQuantity" - "quantitySent"), 0) END) STORED,
  "quantitySent" NUMERIC(9,2) DEFAULT 0,
  "quantityToInvoice" NUMERIC(9,2) GENERATED ALWAYS AS (CASE WHEN "salesOrderLineType" = 'Comment' THEN 0 ELSE GREATEST(("saleQuantity" - "quantityInvoiced"), 0) END) STORED,
  "quantityInvoiced" NUMERIC(9,2) DEFAULT 0,
  "unitPrice" NUMERIC(9,2),
  "unitOfMeasureCode" TEXT,
  "locationId" TEXT,
  "shelfId" TEXT,
  "setupPrice" NUMERIC(9,2),
  "sentComplete" BOOLEAN NOT NULL DEFAULT FALSE,
  "invoicedComplete" BOOLEAN NOT NULL DEFAULT FALSE,
  "requiresInspection" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "createdBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE,
  "updatedBy" TEXT,
  "customFields" JSONB,

  CONSTRAINT "salesOrderLineType_number"
    CHECK (
      (
        "salesOrderLineType" = 'Comment' AND
        "partId" IS NULL AND
        "serviceId" IS NULL AND
        "accountNumber" IS NULL AND
        "assetId" IS NULL AND
        "description" IS NOT NULL
      ) 
      OR (
        "salesOrderLineType" = 'G/L Account' AND
        "partId" IS NULL AND
        "serviceId" IS NULL AND
        "accountNumber" IS NOT NULL AND
        "assetId" IS NULL 
      ) 
      OR (
        "salesOrderLineType" = 'Part' AND
        "partId" IS NOT NULL AND
        "serviceId" IS NULL AND
        "accountNumber" IS NULL AND
        "assetId" IS NULL 
      ) 
      OR (
        "salesOrderLineType" = 'Service' AND
        "partId" IS NULL AND
        "serviceId" IS NOT NULL AND
        "accountNumber" IS NULL AND
        "assetId" IS NULL 
      ) 
      OR (
        "salesOrderLineType" = 'Fixed Asset' AND
        "partId" IS NULL AND
        "serviceId" IS NULL AND
        "accountNumber" IS NULL AND
        "assetId" IS NOT NULL 
      ) 
    ),

  CONSTRAINT "salesOrderLine_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "salesOrderLine_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "salesOrder" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderLine_partId_fkey" FOREIGN KEY ("partId") REFERENCES "part" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "salesOrderLine_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "salesOrderLine_accountNumber_fkey" FOREIGN KEY ("accountNumber") REFERENCES "account" ("number") ON DELETE CASCADE ON UPDATE CASCADE,
  -- TODO: Add assetId foreign key
  CONSTRAINT "salesOrderLine_shelfId_fkey" FOREIGN KEY ("shelfId", "locationId") REFERENCES "shelf" ("id", "locationId") ON DELETE CASCADE,
  CONSTRAINT "salesOrderLine_unitOfMeasureCode_fkey" FOREIGN KEY ("unitOfMeasureCode") REFERENCES "unitOfMeasure" ("code") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "salesOrderLine_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user" ("id") ON DELETE RESTRICT,
  CONSTRAINT "salesOrderLine_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id") ON DELETE RESTRICT
);

ALTER publication supabase_realtime ADD TABLE "salesOrderLine";

CREATE TABLE "salesOrderPayment" (
  "id" TEXT NOT NULL,
  "invoiceCustomerId" TEXT,
  "invoiceCustomerLocationId" TEXT,
  "invoiceCustomerContactId" TEXT,
  "paymentTermId" TEXT,
  "paymentComplete" BOOLEAN NOT NULL DEFAULT FALSE,
  "currencyCode" TEXT NOT NULL DEFAULT 'USD',
  "updatedAt" TIMESTAMP WITH TIME ZONE,
  "updatedBy" TEXT,
  "customFields" JSONB,

  CONSTRAINT "salesOrderPayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "salesOrderPayment_id_fkey" FOREIGN KEY ("id") REFERENCES "salesOrder" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderPayment_invoiceCustomerId_fkey" FOREIGN KEY ("invoiceCustomerId") REFERENCES "customer" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderPayment_invoiceCustomerLocationId_fkey" FOREIGN KEY ("invoiceCustomerLocationId") REFERENCES "customerLocation" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderPayment_invoiceCustomerContactId_fkey" FOREIGN KEY ("invoiceCustomerContactId") REFERENCES "customerContact" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderPayment_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "paymentTerm" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderPayment_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "currency" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "salesOrderPayment_invoiceCustomerId_idx" ON "salesOrderPayment" ("invoiceCustomerId");
CREATE INDEX "salesOrderPayment_invoiceCustomerLocationId_idx" ON "salesOrderPayment" ("invoiceCustomerLocationId");
CREATE INDEX "salesOrderPayment_invoiceCustomerContactId_idx" ON "salesOrderPayment" ("invoiceCustomerContactId");

CREATE TABLE "salesOrderShipment" (
  "id" TEXT NOT NULL,
  "locationId" TEXT,
  "shippingMethodId" TEXT,
  "shippingTermId" TEXT,
  "receiptRequestedDate" DATE,
  "receiptPromisedDate" DATE,
  "deliveryDate" DATE,
  "notes" TEXT,
  "trackingNumber" TEXT,
  "dropShipment" BOOLEAN NOT NULL DEFAULT FALSE,
  "customerId" TEXT,
  "customerLocationId" TEXT,
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE,
  "customFields" JSONB,

  CONSTRAINT "salesOrderShipment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "salesOrderShipment_id_fkey" FOREIGN KEY ("id") REFERENCES "salesOrder" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderShipment_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderShipment_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "shippingMethod" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderShipment_shippingTermId_fkey" FOREIGN KEY ("shippingTermId") REFERENCES "shippingTerm" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderShipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderShipment_customerLocationId_fkey" FOREIGN KEY ("customerLocationId") REFERENCES "customerLocation" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderShipment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id") ON DELETE RESTRICT
);

CREATE TYPE "salesOrderTransactionType" AS ENUM (
  'Edit',
  'Favorite',
  'Unfavorite',
  'Approved',
  'Reject',
  'Request Approval'
);

CREATE TABLE "salesOrderTransaction" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "salesOrderId" TEXT NOT NULL,
  "type" "salesOrderTransactionType" NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT "salesOrderTransaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "salesOrderTransaction_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "salesOrder"("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "salesOrderTransaction_salesOrderId_idx" ON "salesOrderTransaction" ("salesOrderId");
CREATE INDEX "salesOrderTransaction_userId_idx" ON "salesOrderTransaction" ("userId");

CREATE TABLE "salesOrderFavorite" (
  "salesOrderId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,

  CONSTRAINT "salesOrderFavorites_pkey" PRIMARY KEY ("salesOrderId", "userId"),
  CONSTRAINT "salesOrderFavorites_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "salesOrder"("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrderFavorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "salesOrderFavorites_userId_idx" ON "salesOrderFavorite" ("userId");
CREATE INDEX "salesOrderFavorites_salesOrderId_idx" ON "salesOrderFavorite" ("salesOrderId");

ALTER TABLE "salesOrderFavorite" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales order favorites" ON "salesOrderFavorite" 
  FOR SELECT USING (
    auth.uid()::text = "userId"
  );

CREATE POLICY "Users can create their own sales order favorites" ON "salesOrderFavorite" 
  FOR INSERT WITH CHECK (
    auth.uid()::text = "userId"
  );

CREATE POLICY "Users can delete their own sales order favorites" ON "salesOrderFavorite"
  FOR DELETE USING (
    auth.uid()::text = "userId"
  ); 

CREATE OR REPLACE VIEW "salesOrders" AS
  SELECT
    s.*,
    sm."name" AS "shippingMethodName",
    st."name" AS "shippingTermName",
    pt."name" AS "paymentTermName",
    ss."receiptRequestedDate",
    ss."receiptPromisedDate",
    ss."dropShipment",
    l."id" AS "locationId",
    l."name" AS "locationName",
    c."name" AS "customerName",
    u."avatarUrl" AS "createdByAvatar",
    u."fullName" AS "createdByFullName",
    u2."avatarUrl" AS "updatedByAvatar",
    u2."fullName" AS "updatedByFullName",
    u3."avatarUrl" AS "closedByAvatar",
    u3."fullName" AS "closedByFullName",
    EXISTS(SELECT 1 FROM "salesOrderFavorite" sf WHERE sf."salesOrderId" = s.id AND sf."userId" = auth.uid()::text) AS favorite
  FROM "salesOrder" s
  LEFT JOIN "salesOrderShipment" ss ON ss."id" = s."id"
  LEFT JOIN "shippingMethod" sm ON sm."id" = ss."shippingMethodId"
  LEFT JOIN "shippingTerm" st ON st."id" = ss."shippingTermId"
  LEFT JOIN "salesOrderPayment" sp ON sp."id" = s."id"
  LEFT JOIN "paymentTerm" pt ON pt."id" = sp."paymentTermId"
  LEFT JOIN "location" l ON l."id" = ss."locationId"
  LEFT JOIN "customer" c ON c."id" = s."customerId"
  LEFT JOIN "user" u ON u."id" = s."createdBy"
  LEFT JOIN "user" u2 ON u2."id" = s."updatedBy"
  LEFT JOIN "user" u3 ON u3."id" = s."closedBy";


CREATE OR REPLACE VIEW "salesOrderCustomers" AS
  SELECT DISTINCT
    c."id",
    c."name"
  FROM "customer" c
  INNER JOIN "salesOrder" s ON s."customerId" = c."id";
  