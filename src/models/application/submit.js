import db from '../db.js';
/**
 * Creates a new rental application and updates the unit status.
 * @param {Object} data - { applicant_id, unit_id, status }
 */
const createApplication = async (data) => {
    const { applicant_id, unit_id, status } = data;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Insert the Application record
        const appQuery = `
            INSERT INTO Applications (applicant_id, unit_id, status)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const appResult = await client.query(appQuery, [applicant_id, unit_id, status || 'pending']);

        // 2. Update the Unit status to 'under_application'
        const unitUpdateQuery = `
            UPDATE units 
            SET status = 'under_application' 
            WHERE id = $1;
        `;
        await client.query(unitUpdateQuery, [unit_id]);

        await client.query('COMMIT');
        return appResult.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Fetches all applications with associated user, unit, and property details.
 */
const getAllApplications = async () => {
    const query = `
        SELECT 
            a.id AS application_id,
            a.status AS application_status,
            a.submitted_at,
            u.first_name, 
            u.last_name, 
            u.email AS applicant_email,
            un.unit_number,
            p.name AS property_name
        FROM Applications a
        JOIN Users u ON a.applicant_id = u.id
        JOIN Units un ON a.unit_id = un.id
        JOIN Properties p ON un.property_id = p.id
        ORDER BY a.submitted_at DESC;
    `;

    const result = await db.query(query);
    return result.rows;
};

export {
    createApplication,
    getAllApplications
};