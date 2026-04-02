import db from '../db.js';

/**
 * Inserts a new inquiry into the Contact_Inquiries table.
 * * @param {Object} data - The inquiry data object
 * @param {string} data.first_name
 * @param {string} data.last_name
 * @param {string} data.email
 * @param {string} data.phone
 * @param {string} data.subject
 * @param {string} data.message
 * @param {number|null} data.property_id - Optional FK to Properties
 * @returns {Promise<Object>} The newly created inquiry record
 */
const createContactForm = async ({ firstName, lastName, email, phone, subject, message, property_id }) => {
    const query = `
        INSERT INTO Contact_Inquiries (
            first_name, 
            last_name, 
            email, 
            phone, 
            subject, 
            message, 
            property_id, 
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'new')
        RETURNING *
    `;
    const values = [
        firstName, 
        lastName, 
        email, 
        phone, 
        subject, 
        message, 
        property_id || null
    ];

    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Retrieves all inquiries from Contact_Inquiries, ordered by most recent.
 * * @returns {Promise<Array>} Array of inquiry records
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
            property_id, 
            status, 
            created_at
        FROM Contact_Inquiries
        ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

export { createContactForm, getAllContacts };