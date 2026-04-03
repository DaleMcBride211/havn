import { getProperties, getPropertyById, createProperty } from '../../models/properties/list.js';
import { createApplication } from '../../models/application/submit.js';

const propertyListPage = async (req, res) => {

    const properties = await getProperties();
    const currentUser = req.session.user;

    res.render('properties/list', {
        title: 'Properties',
        stylesheet: 'properties.css',
        properties,
        currentUser
    })
};

const propertyDetailPage = async (req, res, next) => {
    const propertyId = req.params.id;
    const currentUser = req.session.user; // Pass the user session

    try {
        const specificProperty = await getPropertyById(propertyId);

        if (!specificProperty) {
            const err = new Error(`Property id ${propertyId} not found`);
            err.status = 404;
            return next(err);
        }

        res.render('properties/detail', {
            title: specificProperty.name,
            stylesheet: 'propertyDetail.css',
            specificProperty,
            currentUser, // Now available in EJS
            messages: req.flash() // If using connect-flash
        });
    } catch (error) {
        next(error);
    }
};

const newPropertyPage = async (req, res) => {


    res.render('properties/newproperty', {
        title: 'New Property',
        stylesheet: 'newProperty.css'
    })
};

const submitNewProperty = async (req, res, next) => {
    try {
        const propertyData = req.body;

        // Call the model function (which will now handle the transaction)
        await createProperty(propertyData);

        // FIX 1: Set the flash message BEFORE the redirect
        req.flash('success', 'Property created successfully!');
        res.redirect('/properties');

    } catch (error) {
        console.error('Error creating property:', error);
        
        // FIX 2: Set error flash and redirect back to the form instead of crashing
        req.flash('error', 'Error creating property. Please try again.');
        res.redirect('/properties/new'); 
        
        // (Optional: If you want to use your global error handler instead, use next(error))
    }
};

const submitApplication = async (req, res, next) => {
    try {
        const { propertyId, unitId } = req.params;
        
        // Ensure user is logged in
        if (!req.session.user) {
            req.flash('error', 'You must be logged in to apply.');
            return res.redirect('/login');
        }

        const applicantId = req.session.user.id;

        // 1. Create the application record 
        // (You'll need to create this function in your models/applications/list.js)
        await createApplication({
            applicant_id: applicantId,
            unit_id: unitId,
            status: 'pending'
        });

        // 2. Success feedback
        req.flash('success', 'Application submitted! A manager will review it shortly.');
        res.redirect(`/properties/${propertyId}`);

    } catch (error) {
        console.error('Error submitting application:', error);
        req.flash('error', 'Failed to submit application. Please try again.');
        res.redirect('back'); // Sends them back to the property detail page
    }
};



const getAvailableProperties = async () => {
    
    const query = `
        SELECT id, name 
        FROM Properties 
        WHERE status != 'available' 
        ORDER BY name ASC
    `;
    const result = await db.query(query);
    return result.rows;
};


export { propertyListPage, propertyDetailPage, getAvailableProperties, submitNewProperty, newPropertyPage, submitApplication };