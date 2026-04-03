import db from '../db.js';

/**
 * Helper to transform a database property row to a JS object.
 * This keeps the mapping logic in one place.
 */
const mapPropertyRow = (row) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    type: row.property_type,
    amenities: row.amenities, // Automatically parsed if using pg driver
    fullAddress: `${row.address}, ${row.city}, ${row.state} ${row.zip}`
});

/**
 * Core function to fetch a single property.
 */
const getProperty = async (identifier, identifierType = 'id') => {
    const whereClause = identifierType === 'name' ? 'name = $1' : 'id = $1';
    
    // 1. Fetch the Property
    const propertyQuery = `
        SELECT id, name, address, city, state, zip, property_type, amenities
        FROM properties
        WHERE ${whereClause}
    `;

    const propResult = await db.query(propertyQuery, [identifier]);

    if (propResult.rows.length === 0) return null;

    const property = mapPropertyRow(propResult.rows[0]);

    // 2. Fetch all Units associated with this Property ID
    const unitsQuery = `
        SELECT id, unit_number, bedrooms, bathrooms, sq_ft, market_rent, status
        FROM units
        WHERE property_id = $1
        ORDER BY unit_number ASC
    `;

    const unitsResult = await db.query(unitsQuery, [property.id]);

    // 3. Attach units to the property object
    property.units = unitsResult.rows;

    return property;
};

/**
 * Get all properties with optional sorting.
 * Now returns all records without filtering by type.
 * @param {string} sortBy - 'name' (default), 'type', 'city'
 */
const getProperties = async (sortBy = 'name') => {
    // Determine the ORDER BY clause based on the sortBy argument
    const orderBy = sortBy === 'type' ? 'property_type, name' : 
                    sortBy === 'city' ? 'city, name' : 
                    'name';

    // Simplified query: no WHERE clause, just the SELECT and ORDER BY
    const query = `SELECT * FROM properties ORDER BY ${orderBy}`;

    const result = await db.query(query);
    
    // Transform every row using your existing mapper
    return result.rows.map(mapPropertyRow);
};

/**
 * Search properties by city or zip code.
 */
const searchProperties = async (location) => {
    const query = `
        SELECT * FROM properties 
        WHERE city ILIKE $1 OR zip = $1
        ORDER BY name
    `;
    const result = await db.query(query, [`%${location}%`]);
    return result.rows.map(mapPropertyRow);
};

const getAvailableProperties = async () => {
    const query = `
        SELECT DISTINCT p.* FROM properties p
        JOIN units u ON p.id = u.property_id
        WHERE u.status IN ('vacant', 'listed')
        ORDER BY p.name ASC
    `;

    const result = await db.query(query);
    
    // Transform rows using the existing mapper
    return result.rows.map(mapPropertyRow);
};

/**
 * Create a new property (and its first unit if it is a house) using a transaction.
 * @param {Object} propertyData - Object containing property & unit details.
 */
const createProperty = async (propertyData) => {
    const client = await db.connect(); 

    try {
        await client.query('BEGIN'); 

        const { 
            name, address, city, state, zip, type, amenities, 
            bedrooms, bathrooms, sq_ft, market_rent,
            multi_unit_number, multi_bedrooms, multi_bathrooms, multi_sq_ft, multi_market_rent
        } = propertyData;

        // --- NEW: AMENITIES FORMATTING ---
        // 1. Force the incoming data into an array (handles 0, 1, or multiple checkboxes)
        const toArray = (val) => {
            if (!val) return [];
            return Array.isArray(val) ? val : [val];
        };

        // 2. Turn ["Pool", "Gym"] into {"Pool": true, "Gym": true}
        const amenitiesObj = toArray(amenities).reduce((acc, item) => {
            acc[item] = true;
            return acc;
        }, {});

        const formattedAmenities = JSON.stringify(amenitiesObj);
        // ---------------------------------

        // 1. Insert into Properties Table
        const propQuery = `
            INSERT INTO properties (name, address, city, state, zip, property_type, amenities)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        
        const propResult = await client.query(propQuery, [name, address, city, state, zip, type, formattedAmenities]);
        const newPropertyRow = propResult.rows[0];

        // 2a. Handle Single-Family House
        if (type === 'house') {
            const unitQuery = `
                INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, sq_ft, market_rent, status)
                VALUES ($1, $2, $3, $4, $5, $6, 'vacant');
            `;
            await client.query(unitQuery, [newPropertyRow.id, 'Main', bedrooms, bathrooms, sq_ft, market_rent]);
        }
        // 2b. Handle Multi-Family Apartment Building
        else if (type === 'apartment_building' && multi_unit_number) {
            
            const unitNumbers = toArray(multi_unit_number);
            const beds = toArray(multi_bedrooms);
            const baths = toArray(multi_bathrooms);
            const sqFts = toArray(multi_sq_ft);
            const rents = toArray(multi_market_rent);

            const unitQuery = `
                INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, sq_ft, market_rent, status)
                VALUES ($1, $2, $3, $4, $5, $6, 'vacant');
            `;

            for (let i = 0; i < unitNumbers.length; i++) {
                await client.query(unitQuery, [
                    newPropertyRow.id,
                    unitNumbers[i],
                    beds[i] || null,
                    baths[i] || null,
                    sqFts[i] || null,
                    rents[i] || null
                ]);
            }
        }

        await client.query('COMMIT'); 
        return mapPropertyRow(newPropertyRow); 

    } catch (error) {
        await client.query('ROLLBACK');
        throw error; 
    } finally {
        client.release(); 
    }
};

/**
 * Clean wrappers for external use
 */
const getPropertyById = (id) => getProperty(id, 'id');
const getPropertyByName = (name) => getProperty(name, 'name');

export { 
    getPropertyById, 
    getPropertyByName, 
    getProperties, 
    searchProperties,
    getProperty,
    getAvailableProperties,
    createProperty
};