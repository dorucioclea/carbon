CREATE OR REPLACE VIEW "employees" WITH(SECURITY_INVOKER=true) AS
  SELECT 
    u.id,
    u."email",
    u."firstName",
    u."lastName",
    u."fullName" AS "name",
    u."avatarUrl",
    u."active",
    e."employeeTypeId",
    e."companyId"
  FROM "user" u
  INNER JOIN "employee" e
    ON e.id = u.id
  WHERE u.active = TRUE;
