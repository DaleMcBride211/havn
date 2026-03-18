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
    
    const query = `
        SELECT id, name, address, city, state, zip, property_type, amenities
        FROM properties
        WHERE ${whereClause}
    `;

    const result = await db.query(query, [identifier]);

    if (result.rows.length === 0) return null;
    return mapPropertyRow(result.rows[0]);
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
    getProperty 
};