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

export {
    createApplication
};