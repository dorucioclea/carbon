INSERT INTO "customerType" (name, protected, "createdBy") VALUES
('Retail', false, '24df39db-d58f-465d-b740-0935a8faaac5'),
('Wholesale', false, '24df39db-d58f-465d-b740-0935a8faaac5'),
('Enterprise', false, '24df39db-d58f-465d-b740-0935a8faaac5');

INSERT INTO customer (
    name,
    "taxId",
    "customerTypeId",
    "updatedAt"
) VALUES 
(
    'Acme Corporation',
    '123456789',
    (SELECT id FROM "customerType" WHERE name = 'Retail'),
    NOW()
),
(
    'Baxter Innovations',
    '987654321',
    (SELECT id FROM "customerType" WHERE name = 'Wholesale'),
    NOW()
),
-- New entries below
(
    'Crestone LLC',
    '555666777',
    (SELECT id FROM "customerType" WHERE name = 'Enterprise'),
    NOW()
),
(
    'Dynamo Corp',
    '222333444',
    (SELECT id FROM "customerType" WHERE name = 'Wholesale'),
    NOW()
),
(
    'Blue Ocean Technologies',
    '222333444',
    (SELECT id FROM "customerType" WHERE name = 'Wholesale'),
    NOW()
),
(
    'Solar Flare Innovations',
    '222333444',
    (SELECT id FROM "customerType" WHERE name = 'Enterprise'),
    NOW()
);

