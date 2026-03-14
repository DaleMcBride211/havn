-- Comprehensive Database Seed File for Property Management System
-- Locations: WY, MT, ID | 20 Properties | 1 Flagship (20 Units)
-- Test Password for all users: P@$$w0rd!

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

-- Users (Uniform Password: P@$$w0rd!)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role) VALUES
    (1, 'admin@propco.com', 'P@$$w0rd!', 'Alice', 'Admin', '555-0100', 'admin'),
    (2, 'manager1@propco.com', 'P@$$w0rd!', 'Bob', 'Manager', '555-0101', 'manager'),
    (3, 'manager2@propco.com', 'P@$$w0rd!', 'Carol', 'Supervisor', '555-0102', 'manager'),
    (4, 'tenant1@email.com', 'P@$$w0rd!', 'David', 'Tenant', '555-0201', 'tenant'),
    (5, 'tenant2@email.com', 'P@$$w0rd!', 'Eve', 'Renter', '555-0202', 'tenant'),
    (6, 'tenant3@email.com', 'P@$$w0rd!', 'Frank', 'Resident', '555-0203', 'tenant');

-- 20 Properties in ID, MT, WY
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

-- Units for Property 1 (The 20-Unit Flagship in Rexburg)
INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, sq_ft, market_rent, status)
SELECT 1, 'Unit-' || i, 2, 1.5, 950, 1250.00, 'occupied'
FROM generate_series(101, 120) AS i;

-- Units for other properties
INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, sq_ft, market_rent, status) VALUES
(2, 'Main', 4, 3.0, 2600, 2900.00, 'occupied'),
(3, '101', 1, 1.0, 680, 1400.00, 'vacant'),
(4, 'Unit A', 3, 2.5, 1400, 1750.00, 'occupied');

-- Managers to Properties Mapping
INSERT INTO managers_properties (manager_id, property_id) 
SELECT 2, id FROM properties WHERE id <= 10;
INSERT INTO managers_properties (manager_id, property_id) 
SELECT 3, id FROM properties WHERE id > 10;

-- Leases for the Flagship
INSERT INTO leases (unit_id, tenant_id, start_date, end_date, monthly_rent, security_deposit_amount, status)
SELECT id, 4, '2024-01-01', '2024-12-31', 1250.00, 1000.00, 'active'
FROM units WHERE property_id = 1 LIMIT 5;

-- 5. Reset Sequences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('properties_id_seq', (SELECT MAX(id) FROM properties));
SELECT setval('units_id_seq', (SELECT MAX(id) FROM units));
SELECT setval('leases_id_seq', (SELECT COALESCE(MAX(id), 1) FROM leases));

COMMIT;