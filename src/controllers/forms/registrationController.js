import { Router } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { 
    emailExists, 
    saveUser, 
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../../models/forms/registration.js';


const router = Router();


/**
 * Display the registration form page.
 */
export const showRegistrationForm = (req, res) => {
    // TODO: Render the registration form view (forms/registration/form)
    // TODO: Pass title: 'User Registration' in the data object
    res.render('forms/registration/form', {
        title: 'User Registration',
        stylesheet: 'register.css'
    });
};

/**
 * Handle user registration with validation and password hashing.
 */
export const processRegistration = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // ... (Your existing error logging)
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/register');
    }

    // UPDATED: Destructure the correct fields from the form
    const { firstName, lastName, email, password, phone } = req.body;

    try {
        const storedEmail = await emailExists(email);
        if (storedEmail) {
            req.flash('warning', 'An account with this email already exists.');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // UPDATED: Pass individual names to your saveUser model
        await saveUser({
            firstName, 
            lastName, 
            email, 
            passwordHash: hashedPassword, 
            phone,
            role: 'tenant' // Default role
        });

        console.log('User registered successfully:', email);
        req.flash('success', 'Registration successful! Please log in.');
        return res.redirect('/login'); 

    } catch (error) {
        console.error('Registration Error:', error);
        req.flash('error', 'An unexpected error occurred.');
        return res.redirect('/register');
    }
};

/**
 * Display all registered users.
 */
export const showAllUsers = async (req, res) => {
    let users = [];
    try {
        users = await getAllUsers();

    } catch (error) {
        console.error('Error retrieving users:', error);
    }
    res.render('forms/registration/list', {
        title: 'Registered Users',
        users,
        user: req.session && req.session.user ? req.session.user : null,
        stylesheet: 'listUsers.css'
    });
};

/**
 * Display the edit account form
 * Users can edit their own account, admins can edit any account
 */
export const showEditAccountForm = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;
    const targetUser = await getUserById(targetUserId);
    if (!targetUser) {
        req.flash('error', 'User not found.');
        return res.redirect('/register/list');
    }
    // Check permissions: users can edit themselves, admins can edit anyone
    const canEdit = currentUser.id === targetUserId || currentUser.role === 'admin';
    if (!canEdit) {
        req.flash('error', 'You do not have permission to edit this account.');
        return res.redirect('/register/list');
    }
    res.render('forms/registration/edit', {
        title: 'Edit Account',
        user: targetUser,
        currentUser: currentUser,
        stylesheet: 'editaccount.css'
    });
};
/**
 * Process account edit form submission
 */
export const processEditAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;
    const { firstName, lastName, email, phone, role } = req.body;

    try {
        const targetUser = await getUserById(targetUserId);
        if (!targetUser) {
            req.flash('error', 'User not found.');
            return res.redirect('/register/list');
        }

        const canEdit = currentUser.id === targetUserId || currentUser.role === 'admin';
        if (!canEdit) {
            req.flash('error', `You do not have permission to edit this account.`);
            return res.redirect('/register/list');
        }

        const updateData = { firstName, lastName, email, phone };

       if (currentUser.role === 'admin' && role) {
            updateData.role = role;
        } else {
            updateData.role = targetUser.role;
        }

        await updateUser(targetUserId, updateData);

        // Update session if user edited themselves
        if (currentUser.id === targetUserId) {
            req.session.user = { 
                ...req.session.user, 
                first_name: firstName, 
                last_name: lastName, 
                email, 
                phone,
                role: updateData.role 
            };
        }

        req.flash('success', 'Account updated successfully.');
        if (currentUser.role === 'admin') {
            res.redirect('/register/list');
        } else {
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.error('Error updating account:', error);
        req.flash('error', 'An error occurred while updating the account.');
        res.redirect(`/register/${targetUserId}/edit`);
    }
};

/**
 * Process account deletion
 * Only admins can delete accounts, and they cannot delete themselves
 */
export const processDeleteAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;
    // Only admins can delete accounts
    if (currentUser.role !== 'admin') {
        req.flash('error', 'You do not have permission to delete accounts.');
        return res.redirect('/register/list');
    }
    // Prevent admins from deleting their own account
    if (currentUser.id === targetUserId) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/register/list');
    }
    try {
        const deleted = await deleteUser(targetUserId);
        if (deleted) {
            req.flash('success', 'User account deleted successfully.');
        } else {
            req.flash('error', 'User not found or already deleted.');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'An error occurred while deleting the account.');
    }
    res.redirect('/register/list');
};
