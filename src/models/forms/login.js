import bcrypt from 'bcrypt';
import db from '../db.js';

/**
 * Find a user by email address for login verification.
 * Adjusted to match the Users schema: id, email, password_hash, first_name, last_name, phone, role
 * * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} User object or null if not found
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT 
            id, 
            email, 
            password_hash, 
            first_name, 
            last_name, 
            phone,
            role,
            created_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
          AND deleted_at IS NULL
        LIMIT 1
    `;
    
    try {
        const result = await db.query(query, [email]);
        
        console.log('--- DB Check ---');
        console.log('Searching for email:', email);
        console.log('User found in DB:', result.rows[0] ? 'YES' : 'NO');
        
        return result.rows[0] || null;
    } catch (error) {
        console.error('Database error in findUserByEmail:', error);
        throw error;
    }
};

/**
 * Verify a plain text password against a stored bcrypt hash.
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    try {
        // Bcrypt handles the salt parsing internally from the hash string
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        
        console.log('--- Password Check ---');
        console.log('Bcrypt Match:', isMatch);
        
        return isMatch;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
};

export { findUserByEmail, verifyPassword };