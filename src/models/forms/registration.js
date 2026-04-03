import db from '../db.js';

/**
 * Checks if an email address is already registered.
 * Returns the user object if found, otherwise false.
 */
const emailExists = async (email) => {
    const query = `
        SELECT id, email FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL
    `;
    const result = await db.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : false;
};

/**
 * Saves a new user to the database.
 */
const saveUser = async (userData) => {
    // FIX: Changed 'hashedPassword' to 'passwordHash' to match controller
    const { firstName, lastName, email, passwordHash, phone, role = 'tenant' } = userData;
    
    const query = `
        INSERT INTO users (first_name, last_name, email, password_hash, phone, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, first_name, last_name, email, role, created_at
    `;
    
    const values = [firstName, lastName, email, passwordHash, phone, role];
    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Retrieves all non-deleted users.
 */
const getAllUsers = async () => {
    const query = `
        SELECT id, first_name, last_name, email, role, phone, created_at
        FROM users
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Retrieve a single user by ID.
 */
const getUserById = async (id) => {
    const query = `
        SELECT id, first_name, last_name, email, role, phone, role, created_at
        FROM users
        WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Update a user's profile info.
 * Updated to accept an object for consistency.
 */
const updateUser = async (id, updateData) => {
    const { firstName, lastName, email, phone, role } = updateData;
    const query = `
        UPDATE users 
        SET first_name = $1, 
            last_name = $2, 
            email = $3, 
            phone = $4, 
            role = $5, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 AND deleted_at IS NULL 
        RETURNING id, first_name, last_name, email, role, updated_at
    `;
    // Pass 6 arguments to match the query above
    const result = await db.query(query, [firstName, lastName, email, phone, role, id]);
    return result.rows[0] || null;
};

/**
 * Soft delete a user account.
 */
const deleteUser = async (id) => {
    const query = `
        UPDATE users 
        SET deleted_at = CURRENT_TIMESTAMP 
        WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

export { 
    emailExists, 
    saveUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
};