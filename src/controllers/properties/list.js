import { getProperties, getPropertyById, createProperty } from '../../models/properties/list.js';

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

    const specificProperty = await getPropertyById(propertyId);
    console.log('Specific Property', specificProperty);

    if (!propertyId) {
        const err = new Error(`Property id ${propertyId} not found`);
        err.status = 404;
        return next(err)
    }

    res.render('properties/detail', {
        title: specificProperty.name,
        stylesheet: 'propertyDetail.css',
        specificProperty
    });
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


export { propertyListPage, propertyDetailPage, getAvailableProperties, submitNewProperty, newPropertyPage };