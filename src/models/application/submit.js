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

const approveApplication = async (applicationId, adminId) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Fetch details
        const detailsQuery = `
            SELECT a.applicant_id, a.unit_id, u.market_rent 
            FROM Applications a
            JOIN Units u ON a.unit_id = u.id
            WHERE a.id = $1
        `;
        const detailsRes = await client.query(detailsQuery, [applicationId]);
        
        if (detailsRes.rows.length === 0) throw new Error("Application not found");
        
        const { applicant_id, unit_id, market_rent } = detailsRes.rows[0];

        // 2. Update Application
        await client.query(
            `UPDATE Applications SET status = 'approved', updated_at = NOW() WHERE id = $1`,
            [applicationId]
        );

        // 3. Update Unit status
        await client.query(
            `UPDATE Units SET status = 'occupied' WHERE id = $1`,
            [unit_id]
        );

        // 4. Create Lease with Security Deposit
        // Setting deposit equal to market_rent to satisfy the NOT NULL constraint
        const rentAmount = market_rent || 0;
        const depositAmount = rentAmount; 

        const leaseQuery = `
            INSERT INTO Leases (
                unit_id, 
                tenant_id, 
                application_id, 
                start_date, 
                end_date, 
                monthly_rent, 
                security_deposit_amount, 
                status
            )
            VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', $4, $5, 'active')
        `;
        
        await client.query(leaseQuery, [
            unit_id, 
            applicant_id, 
            applicationId, 
            rentAmount, 
            depositAmount
        ]);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export {
    createApplication,
    getAllApplications,
    approveApplication
};