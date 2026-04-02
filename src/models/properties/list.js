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
    getAvailableProperties
};