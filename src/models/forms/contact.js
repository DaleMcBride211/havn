import db from '../db.js';

/**
 * Inserts a new inquiry into the Contact_Inquiries table.
 * @param {Object} data - The inquiry data object
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.email
 * @param {string} data.phone
 * @param {string} data.subject
 * @param {string} data.message
 * @param {number|null} data.property_id - Optional FK to Properties
 * @returns {Promise<Object>} The newly created inquiry record
 */
const createContactForm = async (data) => {
    const query = `
        INSERT INTO Contact_Inquiries (
            first_name, last_name, email, phone, subject, message, property_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [
        data.firstName, 
        data.lastName, 
        data.email, 
        data.phone, 
        data.subject, 
        data.message, 
        data.propertyName 
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Retrieves all inquiries from Contact_Inquiries, ordered by most recent.
 * @returns {Promise<Array>} Array of inquiry records
 */
const getAllContacts = async () => {
    const query = `
        SELECT 
            id, 
            first_name, 
            last_name, 
            email, 
            phone, 
            subject, 
            message, 
            property_name, 
            status, 
            created_at
        FROM Contact_Inquiries
        ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Retrieves a single inquiry by its ID.
 * @param {number|string} id - The unique ID of the inquiry
 * @returns {Promise<Object|null>} The inquiry record or null if not found
 */
const getContactById = async (id) => {
    const query = `
        SELECT 
            id, 
            first_name, 
            last_name, 
            email, 
            phone, 
            subject, 
            message, 
            property_name, 
            status, 
            created_at
        FROM Contact_Inquiries
        WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

const updateContactStatus = async (id, status) => {
    const query = `
        UPDATE Contact_Inquiries
        SET status = $1
        WHERE id = $2
        RETURNING *
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0];
};

export { 
    createContactForm, 
    getAllContacts, 
    getContactById,
    updateContactStatus
};