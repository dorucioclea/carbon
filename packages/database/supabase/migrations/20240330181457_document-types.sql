CREATE TYPE "documentSourceType" AS ENUM (
  'Job',
  'Part',
  'Purchase Order',
  'Purchase Invoice',
  'Purchase Return Order',
  'Quote',
  'Receipt',
  'Request for Quote',
  'Sales Order',
  'Sales Invoice',
  'Sales Return Order',
  'Service',
  'Shipment'
);

ALTER TABLE "document" ADD COLUMN "sourceDocument" "documentSourceType";
ALTER TABLE "document" ADD COLUMN "sourceDocumentId" TEXT;

DROP VIEW "documents";
CREATE OR REPLACE VIEW "documents" WITH(SECURITY_INVOKER=true) AS 
  SELECT
    d.*,  
    ARRAY(SELECT dl.label FROM "documentLabel" dl WHERE dl."documentId" = d.id AND dl."userId" = auth.uid()::text) AS labels,
    EXISTS(SELECT 1 FROM "documentFavorite" df WHERE df."documentId" = d.id AND df."userId" = auth.uid()::text) AS favorite,
    (SELECT MAX("createdAt") FROM "documentTransaction" dt WHERE dt."documentId" = d.id) AS "lastActivityAt"
  FROM "document" d
  LEFT JOIN "user" u ON u.id = d."createdBy"
  LEFT JOIN "user" u2 ON u2.id = d."updatedBy";