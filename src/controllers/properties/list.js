import { getProperties, getPropertyById } from '../../models/properties/list.js'

const propertyListPage = async (req, res) => {

    const properties = await getProperties()
    console.log(properties);

    res.render('properties/list', {
        title: 'Properties',
        stylesheet: 'properties.css',
        properties
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
        specificProperty,
        
    });
};


export { propertyListPage, propertyDetailPage };