CREATE OR REPLACE VIEW "parts" AS 
  SELECT
    p.id,
    p.name,
    p.description,
    p."partType",
    p."partGroupId",
    pg.name AS "partGroup",
    p."replenishmentSystem",
    p.active,
    p."customFields",
    p."companyId",
    array_agg(ps."supplierId") AS "supplierIds"
  FROM "part" p
  LEFT JOIN "partGroup" pg ON pg.id = p."partGroupId"
  LEFT JOIN "partSupplier" ps ON ps."partId" = p.id
  GROUP BY p.id,
    p.name,
    p.description,
    p."partType",
    p."partGroupId",
    pg.name,
    p."replenishmentSystem",
    p.active,
    p."customFields",
    p."companyId";
  
