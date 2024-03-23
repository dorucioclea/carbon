INSERT INTO "partGroup"(
    name, 
    description, 
    active, 
    "createdBy"
) VALUES 
('Engine Components', 'Parts related to engine assemblies', true, '24df39db-d58f-465d-b740-0935a8faaac5'),
('Suspension Parts', 'Components for vehicle suspension systems', true, '24df39db-d58f-465d-b740-0935a8faaac5'),
('Electrical Systems', 'Parts for vehicle electrical systems, including lighting and batteries', true, '24df39db-d58f-465d-b740-0935a8faaac5'),
('Braking Systems', 'Components related to vehicle braking systems', true, '24df39db-d58f-465d-b740-0935a8faaac5'),
('Fuel Systems', 'Parts for fuel storage and delivery in vehicles', true, '24df39db-d58f-465d-b740-0935a8faaac5');

INSERT INTO part (
    id,
    name,
    description,
    blocked,
    "replenishmentSystem",
    "partGroupId",
    "partType",
    "manufacturerPartNumber",
    "unitOfMeasureCode",
    active,
    approved,
    "createdBy",
    "createdAt"
) VALUES 
(
    '000000001', 
    'Carbon Fiber Chassis', 
    'Carbon fiber chassis component for high-performance vehicles', 
    false, 
    'Buy',
    (SELECT id FROM "partGroup" WHERE name = 'Engine Components'), -- Fetching partGroupId by part group name
    'Inventory',
    'MPN12345', 
    'PCS', -- Assuming PCS is a valid code in "unitOfMeasure"
    true, 
    false, 
    '24df39db-d58f-465d-b740-0935a8faaac5', -- Replace with an actual user ID from "user" table
    NOW()
),
(
    '000000002', 
    'Hydraulic Pump', 
    'High-pressure hydraulic pump for industrial applications.', 
    false, 
    'Buy',
    (SELECT id FROM "partGroup" WHERE name = 'Engine Components'), -- Fetching partGroupId by part group name
    'Inventory',
    'MPN12345', 
    'PCS', -- Assuming PCS is a valid code in "unitOfMeasure"
    true, 
    false, 
    '24df39db-d58f-465d-b740-0935a8faaac5', -- Replace with an actual user ID from "user" table
    NOW()
);
