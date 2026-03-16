import { getProperties } from '../../models/properties/list.js'

const propertyListPage = async (req, res) => {

    const properties = await getProperties()
    console.log(properties);

    res.render('properties/list', {
        title: 'Properties',
        stylesheet: 'properties.css',
        properties
    })
};


export { propertyListPage };