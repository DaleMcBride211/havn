import { validationResult } from 'express-validator';
import { Router } from 'express';
import { createContactForm, getAllContacts, getContactById, updateContactStatus } from '../../models/forms/contact.js';
import { contactValidation } from '../../middleware/validation/forms.js'; 
import { getAvailableProperties } from '../../models/properties/list.js';

const router = Router();

/**
 * Display the contact form.
 */
const showContactForm = async (req, res) => {
    
    try {
        const availableProperties = await getAvailableProperties();

        res.render('forms/contact/form', {
        title: 'Contact Havn',
        stylesheet: 'contact.css',
        properties: availableProperties
    });
    } catch (error) {
        console.error('Error fetching properties for contact form:', error);
        req.flash('error', 'Unable to load property list at this time.');

        res.render('forms/contact/form', {
        title: 'Contact Havn',
        stylesheet: 'contact.css',
        properties: []
    });
    }

    
};

/**
 * Process contact form submission.
 */
const processContactSubmission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/contact');
    }

    try {
        // 2. Extract data (note: propertyName instead of property_id)
        const { 
            firstName, 
            lastName, 
            email, 
            phone, 
            subject, 
            message, 
            propertyName // This is now a string (e.g., "Havn Heights")
        } = req.body;

        // 3. Save to database
        await createContactForm({
            firstName,
            lastName,
            email,
            phone,
            subject,
            message,
            // Pass the string directly. If empty, it stays null.
            propertyName: propertyName || null 
        });

        console.log(`New inquiry received regarding: ${propertyName || 'General'}`);
        req.flash('success', 'Thank you! Your message has been sent to the Havn team.');
        
        return res.redirect('/contact/success'); 

    } catch (error) {
        console.error('Contact Submission Error:', error);
        req.flash('error', 'Something went wrong. Please try again later.');
        return res.redirect('/contact');
    }
};

/**
 * Show success page (Optional but good UX)
 */
const showSuccessPage = (req, res) => {
    res.render('forms/contact/success', {
        title: 'Message Sent',
        stylesheet: 'contact.css'
    });
};

const contactListPage = async (req, res, next) => {
    try {
        const contacts = await getAllContacts();

        
        const contactData = contacts || [];

        res.render('forms/contact/list', {
            title: 'Contact Inquiries',
            stylesheet: 'contactList.css', 
            contacts: contactData
        });

    } catch (error) {
        console.error('Error fetching contact list:', error);
        
        req.flash('error', 'Could not retrieve contact inquiries.');
        res.redirect('/'); 
    }
};

const contactDetailPage = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await getContactById(id);

        if (!contact) {
            req.flash('error', 'Inquiry not found.');
            return res.redirect('/contact/responses');
        }

        res.render('forms/contact/detail', {
            title: `Inquiry #${id} - ${contact.subject}`,
            stylesheet: 'contactDetail.css', // Suggested stylesheet name
            contact
        });
    } catch (error) {
        console.error('Error fetching contact detail:', error);
        res.redirect('/contact/responses');
    }
};

const handleStatusUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await updateContactStatus(id, status);

        if (!updated) {
            req.flash('error', 'Could not find the inquiry to update.');
            return res.redirect('/contact/responses');
        }

        req.flash('success', `Inquiry #${id} marked as ${status}.`);
        res.redirect(`/contact/responses/${id}`);
    } catch (error) {
        console.error('Error updating status:', error);
        req.flash('error', 'Failed to update status.');
        res.redirect('/contact/responses');
    }
};

// Routes
router.get('/', showContactForm);
router.get('/success', showSuccessPage);
router.post('/', contactValidation, processContactSubmission); 
router.get('/responses', contactListPage);
router.get('/responses/:id', contactDetailPage);
router.post('/responses/:id', handleStatusUpdate);

export default router;