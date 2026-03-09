import bcrypt from 'bcrypt';
import db from '../db.js';
/**
 * Find a user by email address for login verification.
 * 
 * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} User object with password hash or null if not found
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT 
            users.id, 
            users.name, 
            users.email, 
            users.password, 
            users.created_at,
            roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE LOWER(users.email) = LOWER($1)
        LIMIT 1
    `;
    const result = await db.query(query, [email]);
    console.log('--- DB Check ---');
    console.log('Searching for email:', email);
    console.log('User found in DB:', result.rows[0] ? 'YES' : 'NO');
    return result.rows[0] || null;
};
/**
 * Verify a plain text password against a stored bcrypt hash.
 * 
 * @param {string} plainPassword - The password to verify
 * @param {string} hashedPassword - The stored password hash
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    // TODO: Use bcrypt.compare() to verify the password
    // TODO: Return the result (true/false)

    try {
        console.log('--- Password Check ---');
        console.log('Plain text provided:', plainPassword);
        console.log('Hash from DB:', hashedPassword);
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        console.log('Bcrypt Match:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
};
export { findUserByEmail, verifyPassword };