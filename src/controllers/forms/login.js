import { validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';
import { Router } from 'express';
import { loginValidation } from '../../middleware/validation/forms.js'

const router = Router();

const showLoginForm = (req, res) => {
    // TODO: Render the login form view (forms/login/form)
    // TODO: Pass title: 'User Login'
    res.render('forms/login/form', {
        title: 'User Login',
        stylesheet: 'login.css'
    })
};
/**
 * Process login form submission.
 */
const processLogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/login');
    }

    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            console.log('Login failed: User not found ->', email);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        // FIX: Changed user.password to user.password_hash
        const isMatch = await verifyPassword(password, user.password_hash);

        if (!isMatch) {
            console.log('Login failed: Incorrect password for ->', email);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        // SECURITY: Create a session object without the sensitive hash
        const { password_hash, ...sessionUser } = user; 

        // Store user in session
        req.session.user = sessionUser;
        
        req.session.save((err) => {
            if (err) {
                console.error('Session Save Error:', err);
                return res.redirect('/login');
            }
            console.log('Login successful and session saved:', email);
            return res.redirect('/dashboard');
        });

    } catch (error) {
        console.error('Login Process Error:', error);
        req.flash('error', 'An unexpected error occurred.');
        return res.redirect('/login');
    }
};
/**
 * Handle user logout.
 * 
 * NOTE: connect.sid is the default session cookie name since we did not
 * specify a custom name when creating the session in server.js.
 */
const processLogout = (req, res) => {
    // First, check if there is a session object on the request
    if (!req.session) {
        // If no session exists, there's nothing to destroy,
        // so we just redirect the user back to the home page
        return res.redirect('/');
    }
    // Call destroy() to remove this session from the store (PostgreSQL in our case)
    req.session.destroy((err) => {
        if (err) {
            // If something goes wrong while removing the session from the database:
            console.error('Error destroying session:', err);
            /**
             * Clear the session cookie from the browser anyway, so the client
             * does not keep sending an invalid session ID.
             */
            res.clearCookie('connect.sid');
            /** 
             * Normally we would respond with a 500 error since logout did not fully succeed.
             * Example: return res.status(500).send('Error logging out');
             * 
             * Since this is a practice site, we will redirect to the home page anyway.
             */
            return res.redirect('/');
        }
        // If session destruction succeeded, clear the session cookie from the browser
        res.clearCookie('connect.sid');
        // Redirect the user to the home page
        res.redirect('/');
    });
};

// Routes
router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);
// Export router as default, and specific functions for root-level routes
export default router;
export { processLogout };