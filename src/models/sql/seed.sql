-- Comprehensive Database Seed File for Property Management System
-- Locations: WY, MT, ID | 20 Properties | 1 Flagship (20 Units)

BEGIN;

-- 1. Drop existing tables and types (in reverse dependency order)
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS inspections CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS managers_properties CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS property_type_enum CASCADE;
DROP TYPE IF EXISTS unit_status CASCADE;
DROP TYPE IF EXISTS lease_status CASCADE;
DROP TYPE IF EXISTS inspection_type CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS work_order_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS document_related_type CASCADE;

-- 2. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'tenant');
CREATE TYPE property_type_enum AS ENUM ('apartment_building', 'house');
CREATE TYPE unit_status AS ENUM ('vacant', 'occupied', 'maintenance', 'listed');
CREATE TYPE lease_status AS ENUM ('draft', 'active', 'expired', 'terminated');
CREATE TYPE inspection_type AS ENUM ('move_in', 'move_out', 'routine');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'emergency');
CREATE TYPE work_order_status AS ENUM ('new', 'in_progress', 'completed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('rent', 'deposit', 'late_fee', 'utility');
CREATE TYPE transaction_status AS ENUM ('pending', 'succeeded', 'failed');
CREATE TYPE document_related_type AS ENUM ('lease', 'property', 'user', 'work_order');

-- 3. Create Tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip VARCHAR(20) NOT NULL,
    property_type property_type_enum NOT NULL,
    amenities JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms DECIMAL(3,1) NOT NULL,
    sq_ft INTEGER,
    market_rent DECIMAL(10,2) NOT NULL,
    status unit_status NOT NULL DEFAULT 'vacant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, unit_number)
);

CREATE TABLE managers_properties (
    manager_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    PRIMARY KEY (manager_id, property_id)
);

CREATE TABLE leases (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit_amount DECIMAL(10,2) NOT NULL,
    status lease_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inspections (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    inspector_id INTEGER NOT NULL REFERENCES users(id),
    type inspection_type NOT NULL,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    service_category VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES units(id),
    requester_id INTEGER NOT NULL REFERENCES users(id),
    assigned_manager_id INTEGER REFERENCES users(id),
    vendor_id INTEGER REFERENCES vendors(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority priority_level NOT NULL DEFAULT 'medium',
    status work_order_status NOT NULL DEFAULT 'new',
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    lease_id INTEGER NOT NULL REFERENCES leases(id),
    amount DECIMAL(10,2) NOT NULL,
    type transaction_type NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    related_type document_related_type NOT NULL,
    related_id INTEGER NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert Seed Data

-- USERS (With the requested password hash for all)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role) VALUES
    (1, 'admin@propco.com', '$2b$10$Z1MzwIVDUaZIogaM6/SvTeOAE8SwzfmjJXMMLtBuJXdh2KX52viFO', 'Alice', 'Admin', '555-0100', 'admin'),
    (2, 'manager1@propco.com', '$2b$10$Z1MzwIVDUaZIogaM6/SvTeOAE8SwzfmjJXMMLtBuJXdh2KX52viFO', 'Bob', 'Manager', '555-0101', 'manager'),
    (3, 'manager2@propco.com', '$2b$10$Z1MzwIVDUaZIogaM6/SvTeOAE8SwzfmjJXMMLtBuJXdh2KX52viFO', 'Carol', 'Supervisor', '555-0102', 'manager'),
    (4, 'tenant1@email.com', '$2b$10$Z1MzwIVDUaZIogaM6/SvTeOAE8SwzfmjJXMMLtBuJXdh2KX52viFO', 'David', 'Tenant', '555-0201', 'tenant'),
    (5, 'tenant2@email.com', '$2b$10$Z1MzwIVDUaZIogaM6/SvTeOAE8SwzfmjJXMMLtBuJXdh2KX52viFO', 'Eve', 'Renter', '555-0202', 'tenant'),
    (6, 'tenant3@email.com', '$2b$10$Z1MzwIVDUaZIogaM6/SvTeOAE8SwzfmjJXMMLtBuJXdh2KX52viFO', 'Frank', 'Resident', '555-0203', 'tenant'),
    (7, 'dlmcburrito@gmail.com', '$2b$10$Z1MzwIVDUaZIogaM6/SvTeOAE8SwzfmjJXMMLtBuJXdh2KX52viFO', 'Dale', 'McBride', '3073145132', 'admin'),
    (8, 'lukehill@gmail.com', '$2b$10$Z1MzwIVDUaZIogaM6/SvTeOAE8SwzfmjJXMMLtBuJXdh2KX52viFO', 'Luke', 'Hill', '3077652130', 'tenant');

-- PROPERTIES (20 Properties in ID, MT, WY)
INSERT INTO properties (id, name, address, city, state, zip, property_type, amenities) VALUES
(1, 'Mountain View Flagship', '400 S 2nd W', 'Rexburg', 'ID', '83440', 'apartment_building', '{"gym": true, "parking": "garage", "fiber_internet": true}'),
(2, 'Yellowstone Gateway House', '120 Canyon Ave', 'Cody', 'WY', '82414', 'house', '{"yard": true, "view": "mountains"}'),
(3, 'Bozeman Trail Lofts', '15 Main St', 'Bozeman', 'MT', '59715', 'apartment_building', '{"balcony": true, "pet_wash": true}'),
(4, 'Teton Breeze Duplex', '88 Sagebrush Ln', 'Driggs', 'ID', '83422', 'house', '{"garage": true}'),
(5, 'Big Sky Alpine Retreat', '22 Lone Peak Dr', 'Big Sky', 'MT', '59716', 'house', '{"hot_tub": true, "fireplace": true}'),
(6, 'Snake River Suites', '500 Riverside Dr', 'Idaho Falls', 'ID', '83402', 'apartment_building', '{"pool": true}'),
(7, 'Buffalo Bill Heights', '99 Frontier Way', 'Cody', 'WY', '82414', 'house', '{"fenced_yard": true}'),
(8, 'Bridger Range Apts', '200 Kagy Blvd', 'Bozeman', 'MT', '59717', 'apartment_building', '{"gym": true}'),
(9, 'Madison River Cabin', '45 Flyfisher Dr', 'Ennis', 'MT', '59729', 'house', '{"river_access": true}'),
(10, 'Pioneer Park Lofts', '300 N Mill St', 'Sheridan', 'WY', '82801', 'apartment_building', '{"elevator": true}'),
(11, 'Rigby Star Apartments', '12 S State St', 'Rigby', 'ID', '83442', 'apartment_building', '{"covered_parking": true}'),
(12, 'Bitterroot Bungalow', '700 Pine St', 'Missoula', 'MT', '59802', 'house', '{"garden": true}'),
(13, 'Jackson Hole Hideaway', '1200 King St', 'Jackson', 'WY', '83001', 'house', '{"ski_in_ski_out": true}'),
(14, 'Gallatin Valley Condos', '1800 Ferguson Ave', 'Bozeman', 'MT', '59718', 'apartment_building', '{"dog_park": true}'),
(15, 'Targhee Terrace', '33 Ski Hill Rd', 'Alta', 'WY', '83414', 'apartment_building', '{"ski_locker": true}'),
(16, 'Sugar City Flats', '20 Center St', 'Sugar City', 'ID', '83448', 'house', '{"basement": true}'),
(17, 'Helena Star Lofts', '50 Broadway', 'Helena', 'MT', '59601', 'apartment_building', '{"roof_deck": true}'),
(18, 'Gillette Grove', '410 Boxelder Rd', 'Gillette', 'WY', '82718', 'house', '{"large_garage": true}'),
(19, 'Laramie Plains Apts', '1500 Grand Ave', 'Laramie', 'WY', '82070', 'apartment_building', '{"student_discount": true}'),
(20, 'Flathead Lake Villa', '10 Lakeside Blvd', 'Kalispell', 'MT', '59901', 'house', '{"dock": true}');

-- UNITS
-- Property 1: 20-Unit Flagship
INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, sq_ft, market_rent, status)
SELECT 1, 'Unit-' || i, 2, 1.5, 950, 1250.00, 'vacant'
FROM generate_series(1, 20) AS i;

-- All Houses: Single unit named 'Main'
INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, sq_ft, market_rent, status)
SELECT id, 'Main', 3, 2.0, 1800, 2200.00, 'vacant'
FROM properties 
WHERE property_type = 'house' AND id != 1; 

-- All Other Apartment Buildings: 4 Units each
INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, sq_ft, market_rent, status)
SELECT p.id, 'Unit-' || s.i, 2, 1.0, 850, 1350.00, 'vacant'
FROM properties p
CROSS JOIN generate_series(1, 4) AS s(i)
WHERE p.property_type = 'apartment_building' AND p.id != 1;

-- MANAGERS TO PROPERTIES
INSERT INTO managers_properties (manager_id, property_id) 
SELECT 2, id FROM properties WHERE id <= 10;
INSERT INTO managers_properties (manager_id, property_id) 
SELECT 3, id FROM properties WHERE id > 10;

-- VENDORS
INSERT INTO vendors (company_name, service_category, phone, email) VALUES
('Rocky Mountain Plumbing', 'Plumbing', '555-0881', 'dispatch@rmplumbing.com'),
('Teton Electric', 'Electrical', '555-0882', 'service@tetonelectric.com'),
('Yellowstone HVAC Specialists', 'HVAC', '555-0883', 'repairs@yellowstonehvac.com'),
('Pioneer Landscaping', 'Landscaping', '555-0884', 'hello@pioneergrounds.com');

-- LEASES (Dynamic subqueries guarantee we hit valid unit_ids for these specific properties)
-- Giving leases to Tenant 4, Tenant 5, Tenant 6, and new Tenant 8 (Luke)
INSERT INTO leases (unit_id, tenant_id, start_date, end_date, monthly_rent, security_deposit_amount, status) VALUES
-- Tenant 4 gets 2 units in Prop 1
((SELECT id FROM units WHERE property_id = 1 LIMIT 1 OFFSET 0), 4, '2024-01-01', '2024-12-31', 1250.00, 1000.00, 'active'),
((SELECT id FROM units WHERE property_id = 1 LIMIT 1 OFFSET 1), 4, '2024-01-01', '2024-12-31', 1250.00, 1000.00, 'active'),
-- Tenant 5 (Eve) gets the Yellowstone Gateway House (Prop 2)
((SELECT id FROM units WHERE property_id = 2 LIMIT 1), 5, '2024-03-01', '2025-02-28', 2200.00, 2200.00, 'active'),
-- Tenant 6 (Frank) gets an apartment in Bozeman Trail Lofts (Prop 3)
((SELECT id FROM units WHERE property_id = 3 LIMIT 1), 6, '2023-08-01', '2024-07-31', 1350.00, 1000.00, 'active'),
-- Tenant 8 (Luke) gets the Teton Breeze Duplex (Prop 4)
((SELECT id FROM units WHERE property_id = 4 LIMIT 1), 8, '2024-05-01', '2025-04-30', 2200.00, 2200.00, 'active');

-- Set units with active leases to 'occupied'
UPDATE units SET status = 'occupied' 
WHERE id IN (SELECT unit_id FROM leases WHERE status = 'active');

-- INSPECTIONS
INSERT INTO inspections (unit_id, inspector_id, type, notes, rating)
SELECT unit_id, 2, 'move_in', 'Standard move-in inspection completed. Minor wear and tear noted.', 4 
FROM leases WHERE status = 'active';

-- WORK ORDERS
INSERT INTO work_orders (unit_id, requester_id, assigned_manager_id, vendor_id, title, description, priority, status, cost) VALUES
-- Tenant 8 (Luke) requests electrical work
((SELECT unit_id FROM leases WHERE tenant_id = 8 LIMIT 1), 8, 2, 2, 'Flickering Hallway Lights', 'The lights in the hallway are flickering consistently.', 'medium', 'in_progress', NULL),
-- Tenant 5 (Eve) requests plumbing work
((SELECT unit_id FROM leases WHERE tenant_id = 5 LIMIT 1), 5, 2, 1, 'Leaky Kitchen Faucet', 'Continuous drip from the kitchen sink.', 'low', 'completed', 175.50),
-- Tenant 6 (Frank) requests emergency HVAC
((SELECT unit_id FROM leases WHERE tenant_id = 6 LIMIT 1), 6, 2, 3, 'Heater Broken', 'Furnace is completely unresponsive and it is freezing.', 'emergency', 'new', NULL);

-- TRANSACTIONS
-- 1. Insert Security Deposits for all active leases
INSERT INTO transactions (lease_id, amount, type, status)
SELECT id, security_deposit_amount, 'deposit', 'succeeded' FROM leases;

-- 2. Insert First Month's Rent for all active leases
INSERT INTO transactions (lease_id, amount, type, status)
SELECT id, monthly_rent, 'rent', 'succeeded' FROM leases;

-- 3. Add a Late Fee for Tenant 6
INSERT INTO transactions (lease_id, amount, type, status)
SELECT id, 50.00, 'late_fee', 'pending' FROM leases WHERE tenant_id = 6 LIMIT 1;

-- DOCUMENTS
-- Generate dummy lease documents for active leases
INSERT INTO documents (file_url, file_name, related_type, related_id)
SELECT 'https://s3.aws.com/property_bucket/leases/signed_lease_' || id || '.pdf', 'Signed_Lease_Agreement_' || id || '.pdf', 'lease', id 
FROM leases;

-- Generate an invoice document for the completed work order
INSERT INTO documents (file_url, file_name, related_type, related_id)
SELECT 'https://s3.aws.com/property_bucket/invoices/vendor_invoice_' || id || '.pdf', 'Vendor_Invoice_' || id || '.pdf', 'work_order', id
FROM work_orders WHERE status = 'completed';

-- 5. Reset Sequences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('properties_id_seq', (SELECT MAX(id) FROM properties));
SELECT setval('units_id_seq', (SELECT MAX(id) FROM units));
SELECT setval('leases_id_seq', (SELECT COALESCE(MAX(id), 1) FROM leases));
SELECT setval('vendors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM vendors));
SELECT setval('inspections_id_seq', (SELECT COALESCE(MAX(id), 1) FROM inspections));
SELECT setval('work_orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM work_orders));
SELECT setval('transactions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM transactions));
SELECT setval('documents_id_seq', (SELECT COALESCE(MAX(id), 1) FROM documents));

COMMIT;