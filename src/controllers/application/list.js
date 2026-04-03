import { getAllApplications, approveApplication } from '../../models/application/submit.js';

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

const processApproval = async (req, res) => {
    const { id } = req.params;

    // Check if req.user exists. If your middleware uses req.session.user, adjust accordingly.
    const adminId = req.session.user ? req.session.user.id : null;

    if (!adminId) {
        console.error("Approval attempted without a valid admin session.");
        return res.status(401).send("Unauthorized: Admin session not found.");
    }

    try {
        await approveApplication(id, adminId);
        res.redirect('/applications');
    } catch (error) {
        console.error("Approval Error:", error);
        res.status(500).send("Failed to approve application.");
    }
};

export {
    adminApplicationsPage,
    processApproval
};