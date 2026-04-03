import { getAllApplications } from '../../models/application/submit.js';

const adminApplicationsPage = async (req, res) => {
    try {
        const applications = await getAllApplications();
        
        res.render('application/list', {
            title: 'Manage Applications',
            stylesheet: 'applicationList.css',
            applications 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching applications.");
    }
};

export {
    adminApplicationsPage
};