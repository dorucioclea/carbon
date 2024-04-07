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
  "quoteId" TEXT,

  CONSTRAINT "salesOrder_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "salesOrder_salesOrderId_key" UNIQUE ("salesOrderId"),
  CONSTRAINT "salesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer" ("id") ON DELETE CASCADE,
  CONSTRAINT "salesOrder_customerLocationId_fkey" FOREIGN KEY ("customerLocationId") REFERENCES "customerLocation" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "salesOrder_customerContactId_fkey" FOREIGN KEY ("customerContactId") REFERENCES "customerContact" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "salesOrder_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quote"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "salesOrder_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "user" ("id") ON DELETE RESTRICT,
  CONSTRAINT "salesOrder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user" ("id") ON DELETE RESTRICT,
  CONSTRAINT "salesOrder_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id") ON DELETE RESTRICT
);

CREATE INDEX "salesOrder_salesOrderId_idx" ON "salesOrder" ("salesOrderId");
CREATE INDEX "salesOrder_customerId_idx" ON "salesOrder" ("customerId");
CREATE INDEX "salesOrder_customerContactId_idx" ON "salesOrder" ("customerContactId");
CREATE INDEX "salesOrder_status_idx" ON "salesOrder" ("status");
CREATE INDEX "salesOrder_quoteId_idx" ON "salesOrder" ("quoteId");

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
  "supplierId" TEXT,
  "supplierLocationId" TEXT,
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

ALTER TABLE "salesOrder" ADD COLUMN "assignee" TEXT REFERENCES "user" ("id") ON DELETE SET NULL;

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
  
ALTER TABLE "salesOrder" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with sales_view, inventory_view, or invoicing_view can view sales orders" ON "salesOrder"
  FOR SELECT
  USING (
    (
      coalesce(get_my_claim('sales_view')::boolean, false) = true OR
      coalesce(get_my_claim('inventory_view')::boolean, false) = true OR
      coalesce(get_my_claim('invoicing_view')::boolean, false) = true
    ) AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Customers with sales_view can their own sales orders" ON "salesOrder"
  FOR SELECT
  USING (
    coalesce(get_my_claim('sales_view')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"customer"'::jsonb 
    AND "customerId" IN (
      SELECT "customerId" FROM "customerAccount" WHERE id::uuid = auth.uid()
    )
  );

CREATE POLICY "Employees with sales_create can create sales orders" ON "salesOrder"
  FOR INSERT
  WITH CHECK (coalesce(get_my_claim('sales_create')::boolean,false) AND (get_my_claim('role'::text)) = '"employee"'::jsonb);


CREATE POLICY "Employees with sales_update can update sales orders" ON "salesOrder"
  FOR UPDATE
  USING (coalesce(get_my_claim('sales_update')::boolean,false) AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Customers with sales_update can update their own sales orders" ON "salesOrder"
  FOR UPDATE
  USING (
    coalesce(get_my_claim('sales_update')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"customer"'::jsonb 
    AND "customerId" IN (
      SELECT "customerId" FROM "customerAccount" WHERE id::uuid = auth.uid()
    )
  );

CREATE POLICY "Employees with sales_delete can delete sales orders" ON "salesOrder"
  FOR DELETE
  USING (coalesce(get_my_claim('sales_delete')::boolean, false) = true AND (get_my_claim('role'::text)) = '"employee"'::jsonb);


CREATE POLICY "Customers with sales_view can search for their own sales orders" ON "search"
  FOR SELECT
  USING (
    coalesce(get_my_claim('sales_view')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"customer"'::jsonb
    AND entity = 'Sales Order' 
    AND uuid IN (
        SELECT id FROM "salesOrder" WHERE "customerId" IN (
          SELECT "customerId" FROM "salesOrder" WHERE "customerId" IN (
            SELECT "customerId" FROM "customerAccount" WHERE id::uuid = auth.uid()
          )
        )
      )
  );

-- Search

CREATE FUNCTION public.create_sales_order_search_result()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.search(name, entity, uuid, link)
  VALUES (new."salesOrderId", 'Sales Order', new.id, '/x/sales-order/' || new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_sales_order_search_result
  AFTER INSERT on public."salesOrder"
  FOR EACH ROW EXECUTE PROCEDURE public.create_sales_order_search_result();

CREATE FUNCTION public.update_sales_order_search_result()
RETURNS TRIGGER AS $$
BEGIN
  IF (old."salesOrderId" <> new."salesOrderId") THEN
    UPDATE public.search SET name = new."salesOrderId"
    WHERE entity = 'Sales Order' AND uuid = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_sales_order_search_result
  AFTER UPDATE on public."salesOrder"
  FOR EACH ROW EXECUTE PROCEDURE public.update_sales_order_search_result();

CREATE FUNCTION public.delete_sales_order_search_result()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.search WHERE entity = 'Sales Order' AND uuid = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER delete_sales_order_search_result
  AFTER DELETE on public."salesOrder"
  FOR EACH ROW EXECUTE PROCEDURE public.delete_sales_order_search_result();


-- Sales Order Status History

ALTER TABLE "salesOrderStatusHistory" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone with sales_view can view sales order status history" ON "salesOrderStatusHistory"
  FOR SELECT
  USING (coalesce(get_my_claim('sales_view')::boolean, false) = true);

-- Sales Order Lines

ALTER TABLE "salesOrderLine" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with sales_view can view sales order lines" ON "salesOrderLine"
  FOR SELECT
  USING (coalesce(get_my_claim('sales_view')::boolean, false) = true AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Customers with sales_view can their own sales order lines" ON "salesOrderLine"
  FOR SELECT
  USING (
    coalesce(get_my_claim('sales_view')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"customer"'::jsonb 
    AND "salesOrderId" IN (
      SELECT id FROM "salesOrder" WHERE "customerId" IN (
        SELECT "customerId" FROM "salesOrder" WHERE "customerId" IN (
          SELECT "customerId" FROM "customerAccount" WHERE id::uuid = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Employees with sales_create can create sales order lines" ON "salesOrderLine"
  FOR INSERT
  WITH CHECK (coalesce(get_my_claim('sales_create')::boolean,false) AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Customers with sales_create can create lines on their own sales order" ON "salesOrderLine"
  FOR INSERT
  WITH CHECK (
    coalesce(get_my_claim('sales_create')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"customer"'::jsonb 
    AND "salesOrderId" IN (
      SELECT id FROM "salesOrder" WHERE "customerId" IN (
        SELECT "customerId" FROM "salesOrder" WHERE "customerId" IN (
          SELECT "customerId" FROM "customerAccount" WHERE id::uuid = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Employees with sales_update can update sales order lines" ON "salesOrderLine"
  FOR UPDATE
  USING (coalesce(get_my_claim('sales_update')::boolean,false) AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Customers with sales_update can update their own sales order lines" ON "salesOrderLine"
  FOR UPDATE
  USING (
    coalesce(get_my_claim('sales_update')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"customer"'::jsonb 
    AND "salesOrderId" IN (
      SELECT id FROM "salesOrder" WHERE "customerId" IN (
        SELECT "customerId" FROM "salesOrder" WHERE "customerId" IN (
          SELECT "customerId" FROM "customerAccount" WHERE id::uuid = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Employees with sales_delete can delete sales order lines" ON "salesOrderLine"
  FOR DELETE
  USING (coalesce(get_my_claim('sales_delete')::boolean, false) = true AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Customers with sales_delete can delete lines on their own sales order" ON "salesOrderLine"
  FOR DELETE
  USING (
    coalesce(get_my_claim('sales_delete')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"customer"'::jsonb 
    AND "salesOrderId" IN (
      SELECT id FROM "salesOrder" WHERE "customerId" IN (
        SELECT "customerId" FROM "salesOrder" WHERE "customerId" IN (
          SELECT "customerId" FROM "customerAccount" WHERE id::uuid = auth.uid()
        )
      )
    )
  );


-- Sales Order Deliveries

ALTER TABLE "salesOrderShipment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with sales_view can view sales order shipments" ON "salesOrderShipment"
  FOR SELECT
  USING (coalesce(get_my_claim('sales_view')::boolean, false) = true AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Customers with sales_view can their own sales order shipments" ON "salesOrderShipment"
  FOR SELECT
  USING (
    coalesce(get_my_claim('sales_view')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"customer"'::jsonb 
    AND id IN (
      SELECT id FROM "salesOrder" WHERE "customerId" IN (
        SELECT "customerId" FROM "salesOrder" WHERE "customerId" IN (
          SELECT "customerId" FROM "customerAccount" WHERE id::uuid = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Employees with sales_create can create sales order shipments" ON "salesOrderShipment"
  FOR INSERT
  WITH CHECK (coalesce(get_my_claim('sales_create')::boolean,false) AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Employees with sales_update can update sales order shipments" ON "salesOrderShipment"
  FOR UPDATE
  USING (coalesce(get_my_claim('sales_update')::boolean,false) AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Customers with sales_update can their own sales order shipments" ON "salesOrderShipment"
  FOR UPDATE
  USING (
    coalesce(get_my_claim('sales_update')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"customer"'::jsonb 
    AND id IN (
      SELECT id FROM "salesOrder" WHERE "customerId" IN (
        SELECT "customerId" FROM "salesOrder" WHERE "customerId" IN (
          SELECT "customerId" FROM "customerAccount" WHERE id::uuid = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Employees with sales_delete can delete sales order shipments" ON "salesOrderShipment"
  FOR DELETE
  USING (coalesce(get_my_claim('sales_delete')::boolean, false) = true AND (get_my_claim('role'::text)) = '"employee"'::jsonb);


-- Sales Order Payments

ALTER TABLE "salesOrderPayment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with sales_view can view sales order payments" ON "salesOrderPayment"
  FOR SELECT
  USING (coalesce(get_my_claim('sales_view')::boolean, false) = true AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Employees with sales_create can create sales order payments" ON "salesOrderPayment"
  FOR INSERT
  WITH CHECK (coalesce(get_my_claim('sales_create')::boolean,false) AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Employees with sales_update can update sales order payments" ON "salesOrderPayment"
  FOR UPDATE
  USING (coalesce(get_my_claim('sales_update')::boolean,false) AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

CREATE POLICY "Employees with sales_delete can delete sales order payments" ON "salesOrderPayment"
  FOR DELETE
  USING (coalesce(get_my_claim('sales_delete')::boolean, false) = true AND (get_my_claim('role'::text)) = '"employee"'::jsonb);

ALTER VIEW "salesOrders" SET (security_invoker = on);
ALTER VIEW "salesOrderCustomers" SET (security_invoker = on);


DROP VIEW "customers";
CREATE OR REPLACE VIEW "customers" WITH(SECURITY_INVOKER=true) AS 
  SELECT 
    c.*,
    ct.name AS "type",
    cs.name AS "status",
    so.count AS "orderCount"
  FROM "customer" c
  LEFT JOIN "customerType" ct ON ct.id = c."customerTypeId"
  LEFT JOIN "customerStatus" cs ON cs.id = c."customerStatusId"
  LEFT JOIN (
    SELECT 
      "customerId",
      COUNT(*) AS "count"
    FROM "salesOrder"
    GROUP BY "customerId"
  ) so ON so."customerId" = c.id;

CREATE OR REPLACE VIEW "salesOrderLines" WITH(SECURITY_INVOKER=true) AS
  SELECT 
    sol.*,
    so."customerId" ,
    p.name AS "partName",
    p.description AS "partDescription"
  FROM "salesOrderLine" sol
    INNER JOIN "salesOrder" so 
      ON so.id = sol."salesOrderId"
    LEFT OUTER JOIN "part" p
      ON p.id = sol."partId";

/*CREATE OR REPLACE VIEW "salesOrderLocations" WITH(SECURITY_INVOKER=true) AS
  SELECT 
    so.id,
    s.name AS "supplierName",
    sa."addressLine1" AS "supplierAddressLine1",
    sa."addressLine2" AS "supplierAddressLine2",
    sa."city" AS "supplierCity",
    sa."state" AS "supplierState",
    sa."postalCode" AS "supplierPostalCode",
    sa."countryCode" AS "supplierCountryCode",
    dl.name AS "deliveryName",
    dl."addressLine1" AS "deliveryAddressLine1",
    dl."addressLine2" AS "deliveryAddressLine2",
    dl."city" AS "deliveryCity",
    dl."state" AS "deliveryState",
    dl."postalCode" AS "deliveryPostalCode",
    dl."countryCode" AS "deliveryCountryCode",
    pod."dropShipment",
    c.name AS "customerName",
    ca."addressLine1" AS "customerAddressLine1",
    ca."addressLine2" AS "customerAddressLine2",
    ca."city" AS "customerCity",
    ca."state" AS "customerState",
    ca."postalCode" AS "customerPostalCode",
    ca."countryCode" AS "customerCountryCode"
  FROM "salesOrder" so 
  LEFT OUTER JOIN "supplier" s 
    ON s.id = po."supplierId"
  LEFT OUTER JOIN "supplierLocation" sl
    ON sl.id = po."supplierLocationId"
  LEFT OUTER JOIN "address" sa
    ON sa.id = sl."addressId"
  INNER JOIN "purchaseOrderDelivery" pod 
    ON pod.id = po.id 
  LEFT OUTER JOIN "location" dl
    ON dl.id = pod."locationId"
  LEFT OUTER JOIN "customer" c
    ON c.id = pod."customerId"
  LEFT OUTER JOIN "customerLocation" cl
    ON cl.id = pod."customerLocationId"
  LEFT OUTER JOIN "address" ca
    ON ca.id = cl."addressId";*/
  
/*
DROP VIEW "partQuantities";
CREATE OR REPLACE VIEW "partQuantities" AS 
  SELECT 
    p."id" AS "partId", 
    loc."id" AS "locationId",
    COALESCE(SUM(pl."quantity"), 0) AS "quantityOnHand",
    COALESCE(pol."quantityToReceive", 0) AS "quantityOnPurchaseOrder",
    COALESCE(sol."quantityToSend", 0) AS "quantityOnSalesOrder",
    0 AS "quantityOnProdOrder",
    0 AS "quantityAvailable"
  FROM "part" p 
  CROSS JOIN "location" loc
  LEFT JOIN "partLedger" pl
    ON pl."partId" = p."id" AND pl."locationId" = loc."id"
  LEFT JOIN (
    SELECT 
        pol."partId",
        pol."locationId",
        COALESCE(SUM(GREATEST(pol."quantityToReceive", 0)), 0) AS "quantityToReceive"
      FROM "purchaseOrderLine" pol 
      INNER JOIN "purchaseOrder" po 
        ON pol."purchaseOrderId" = po."id"
      WHERE po."status" != 'Draft' 
        AND po."status" != 'Rejected'
        AND po."status" != 'Closed'
      GROUP BY 
        pol."partId",
        pol."locationId"
  ) pol ON pol."partId" = p."id" AND pol."locationId" = loc."id"
  LEFT JOIN (
    SELECT 
        sol."partId",
        sol."locationId",
        COALESCE(SUM(GREATEST(sol."quantityToSend", 0)), 0) AS "quantityToSend"
      FROM "salesOrderLine" sol 
      INNER JOIN "salesOrder" so 
        ON sol."salesOrderId" = so."id"
      WHERE so."status" != 'Draft' 
        AND so."status" != 'Cancelled'
        AND so."status" != 'Needs Approval'
      GROUP BY 
        sol."partId",
        sol."locationId"
  ) sol ON sol."partId" = p."id" AND sol."locationId" = loc."id"
  GROUP BY 
    p."id", 
    loc."id",
    pol."quantityToReceive",
    sol."quantityToSend"*/
