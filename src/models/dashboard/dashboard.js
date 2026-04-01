import db from '../db.js';

/**
 * Helper to map database rows to a clean Lease object.
 */
const mapLeaseRow = (row) => ({
    id: row.lease_id,
    status: row.lease_status,
    startDate: row.start_date,
    endDate: row.end_date,
    monthlyRent: parseFloat(row.monthly_rent),
    securityDeposit: parseFloat(row.security_deposit_amount),
    unit: {
        id: row.unit_id,
        number: row.unit_number,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms
    },
    property: {
        id: row.property_id,
        name: row.property_name,
        address: row.address,
        city: row.city,
        fullAddress: `${row.address}, ${row.city}, ${row.state} ${row.zip}`
    }
});

/**
 * Fetches the currently active lease for a specific user.
 */
export const getActiveLeaseByTenant = async (tenantId) => {
    const query = `
        SELECT 
            l.id as lease_id, l.status as lease_status, l.start_date, l.end_date, 
            l.monthly_rent, l.security_deposit_amount,
            u.id as unit_id, u.unit_number, u.bedrooms, u.bathrooms,
            p.id as property_id, p.name as property_name, p.address, p.city, p.state, p.zip
        FROM leases l
        JOIN units u ON l.unit_id = u.id
        JOIN properties p ON u.property_id = p.id
        WHERE l.tenant_id = $1 
        AND l.status = 'active'
        LIMIT 1
    `;

    const result = await db.query(query, [tenantId]);
    
    if (result.rows.length === 0) return null;
    return mapLeaseRow(result.rows[0]);
};

/**
 * Fetches all leases (past and present) for a specific user.
 */
export const getLeaseHistoryByTenant = async (tenantId) => {
    const query = `
        SELECT 
            l.id as lease_id, l.status as lease_status, l.start_date, l.end_date, 
            l.monthly_rent, u.unit_number, p.name as property_name
        FROM leases l
        JOIN units u ON l.unit_id = u.id
        JOIN properties p ON u.property_id = p.id
        WHERE l.tenant_id = $1
        ORDER BY l.start_date DESC
    `;

    const result = await db.query(query, [tenantId]);
    return result.rows.map(row => ({
        leaseId: row.lease_id,
        status: row.lease_status,
        period: `${row.start_date} to ${row.end_date}`,
        property: row.property_name,
        unit: row.unit_number,
        rent: row.monthly_rent
    }));
};

/**
 * Fetches all maintenance work orders submitted by a specific user.
 */
export const getWorkOrdersByTenant = async (tenantId) => {
    const query = `
        SELECT 
            wo.id, wo.title, wo.description, wo.priority, wo.status, 
            wo.cost, wo.created_at,
            v.company_name as vendor_name
        FROM work_orders wo
        LEFT JOIN vendors v ON wo.vendor_id = v.id
        WHERE wo.requester_id = $1
        ORDER BY wo.created_at DESC
    `;

    const result = await db.query(query, [tenantId]);
    return result.rows;
};