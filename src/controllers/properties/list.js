import { getProperties, getPropertyById, createProperty, hasActiveApplication } from '../../models/properties/list.js';
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
    const currentUser = req.session.user; 

    try {
        
        let hasApplied = false;
        if (currentUser) {
            hasApplied = await hasActiveApplication(currentUser.id);
        }

        const specificProperty = await getPropertyById(propertyId);

        if (!specificProperty) {
            const err = new Error(`Property id ${propertyId} not found`);
            err.status = 404;
            return next(err);
        }

        res.render('properties/detail', {
            title: specificProperty.name,
            stylesheet: 'propertyDetail.css',
            alreadyApplied: hasApplied, 
            specificProperty,
            currentUser, 
            messages: req.flash() 
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
        const userId = req.session.user.id;

        // 1. NEW CHECK: See if they already have an open application
        const alreadyApplied = await hasActiveApplication(userId);

        if (alreadyApplied) {
            req.flash('error', 'You already have an active application. You cannot apply for multiple units at once.');
            return res.redirect(`/properties/${propertyId}`);
        }

        // 2. Existing logic to create the application
        await createApplication({
            applicant_id: userId,
            unit_id: unitId,
            status: 'pending'
        });

        req.flash('success', 'Application submitted! A manager will review it shortly.');
        res.redirect(`/properties/${propertyId}`);

    } catch (error) {
        console.error('Error submitting application:', error);
        req.flash('error', 'Failed to submit application.');
        res.redirect('back');
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