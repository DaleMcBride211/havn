import db from '../db.js';

/**
 * Helper to map database rows to a clean Work Order object.
 */
const mapWorkOrderRow = (row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    cost: row.cost ? parseFloat(row.cost) : 0,
    createdAt: row.created_at,
    details: {
        property: row.property_name,
        unit: row.unit_number,
        tenantName: `${row.tenant_first} ${row.tenant_last}`,
        managerName: row.manager_first ? `${row.manager_first} ${row.manager_last}` : 'Unassigned',
        vendor: row.vendor_name || 'Not Assigned'
    }
});

/**
 * Fetches all maintenance work orders across the system.
 * Typically used by Admins or Managers to oversee operations.
 */
export const getAllMaintenanceRequests = async () => {
    const query = `
        SELECT 
            wo.id, wo.title, wo.description, wo.priority, wo.status, wo.cost, wo.created_at,
            u.unit_number,
            p.name as property_name,
            t.first_name as tenant_first, t.last_name as tenant_last,
            m.first_name as manager_first, m.last_name as manager_last,
            v.company_name as vendor_name
        FROM work_orders wo
        JOIN units u ON wo.unit_id = u.id
        JOIN properties p ON u.property_id = p.id
        JOIN users t ON wo.requester_id = t.id
        LEFT JOIN users m ON wo.assigned_manager_id = m.id
        LEFT JOIN vendors v ON wo.vendor_id = v.id
        ORDER BY 
            CASE 
                WHEN wo.priority = 'emergency' THEN 1
                WHEN wo.priority = 'high' THEN 2
                WHEN wo.priority = 'medium' THEN 3
                ELSE 4
            END, 
            wo.created_at DESC
    `;

    try {
        const result = await db.query(query);
        return result.rows.map(mapWorkOrderRow);
    } catch (error) {
        console.error("Error fetching all maintenance requests:", error);
        throw error;
    }
};

/**
 * Fetches a single maintenance work order by ID.
 */
export const getMaintenanceRequestById = async (id) => {
    const query = `
        SELECT 
            wo.id, wo.title, wo.description, wo.priority, wo.status, wo.cost, wo.created_at,
            u.unit_number,
            p.name as property_name,
            t.first_name as tenant_first, t.last_name as tenant_last,
            m.first_name as manager_first, m.last_name as manager_last,
            v.company_name as vendor_name
        FROM work_orders wo
        JOIN units u ON wo.unit_id = u.id
        JOIN properties p ON u.property_id = p.id
        JOIN users t ON wo.requester_id = t.id
        LEFT JOIN users m ON wo.assigned_manager_id = m.id
        LEFT JOIN vendors v ON wo.vendor_id = v.id
        WHERE wo.id = $1
    `;

    try {
        const result = await db.query(query, [id]);
        if (result.rows.length === 0) return null;
        return mapWorkOrderRow(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching maintenance request ${id}:`, error);
        throw error;
    }
};

/**
 * Creates a new maintenance work order.
 * @param {Object} data - The work order details.
 */
export const createMaintenanceRequest = async (data) => {
    const { 
        requesterId, 
        unitId, 
        title, 
        description, 
        priority = 'medium', 
        status = 'new' 
    } = data;

    const query = `
        INSERT INTO work_orders (
            requester_id, 
            unit_id, 
            title, 
            description, 
            priority, 
            status, 
            created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id;
    `;

    const values = [requesterId, unitId, title, description, priority, status];

    try {
        const result = await db.query(query, values);
        const newOrderId = result.rows[0].id;

        return await getMaintenanceRequestById(newOrderId);
    } catch (error) {
        console.error("Error creating maintenance request:", error);
        throw error;
    }
};

export const getAvailableUnitsForUser = async (userId, role) => {
    try {
        if (role === 'admin' || role === 'manager') {
            // ALL units for staff
            const query = `
                SELECT u.id, u.unit_number, p.name as property_name 
                FROM units u
                JOIN properties p ON u.property_id = p.id
                ORDER BY p.name, u.unit_number;
            `;
            const result = await db.query(query);
            return result.rows;
            
        } else {
            // ONLY leased units for tenants (filtering for 'active' leases)
            const query = `
                SELECT u.id, u.unit_number, p.name as property_name 
                FROM units u
                JOIN properties p ON u.property_id = p.id
                JOIN leases l ON u.id = l.unit_id
                WHERE l.tenant_id = $1 AND l.status = 'active'
                ORDER BY p.name, u.unit_number;
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error fetching available units for user:", error);
        throw error;
    }
};

/**
 * Updates an existing maintenance work order.
 * @param {number|string} id - The ID of the work order.
 * @param {Object} data - The updated data.
 */
export const updateMaintenanceRequest = async (id, data) => {
    const { title, description, priority, status, cost } = data;
    
    const query = `
        UPDATE work_orders 
        SET 
            title = COALESCE($1, title), 
            description = COALESCE($2, description), 
            priority = COALESCE($3, priority), 
            status = COALESCE($4, status), 
            cost = COALESCE($5, cost)
        WHERE id = $6
        RETURNING *;
    `;

    // We pass the cost, ensuring it defaults to 0 if not provided
    const values = [title, description, priority, status, cost ? parseFloat(cost) : null, id];

    try {
        const result = await db.query(query, values);
        if (result.rows.length === 0) return null; // No rows updated
        return result.rows[0];
    } catch (error) {
        console.error(`Error updating maintenance request ${id}:`, error);
        throw error;
    }
};