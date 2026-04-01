import { validationResult } from 'express-validator';
import { 
    getAllMaintenanceRequests,
    getMaintenanceRequestById,
    createMaintenanceRequest
} from '../../models/maintenance/maintenance.js';
import { getAvailableUnitsForUser } from '../../models/maintenance/maintenance.js';

const maintenanceRequestPage = async (req, res, next) => {
    try {
        const maintenanceRequests = await getAllMaintenanceRequests();
        res.render('maintenance/list', {
            title: 'Maintenance Requests',
            stylesheet: 'maintenanceRequests.css',
            maintenanceRequests
        });
    } catch (error) {
        next(error);
    }
};

const maintenanceDetailPage = async (req, res, next) => {
    try {
        const requestId = req.params.id;
        const specificRequest = await getMaintenanceRequestById(requestId);

        // Check if the request actually exists in the database
        if (!specificRequest) {
            req.flash('error', `Maintenance Request #${requestId} not found.`);
            return res.redirect('/maintenance');
        }

        res.render('maintenance/detail', {
            title: specificRequest.details?.property || 'Request Details',
            stylesheet: 'requestDetail.css',
            specificRequest
        });
    } catch (error) {
        next(error);
    }
};

const createMaintananceRequestPage = async (req, res, next) => {
    try {
        // 2. Extract the user ID and role from the session 
        // (This relies on the addLocalVariables middleware you set up earlier)
        const userId = req.session.user.id;
        const userRole = req.session.user.role;

        // 3. Fetch the units from the database
        const units = await getAvailableUnitsForUser(userId, userRole);

        // 4. Render the page AND pass the 'units' array to EJS
        res.render('maintenance/create', {
            title: 'Submit Maintenance Request',
            stylesheet: 'maintenanceForm.css',
            units // <--- THIS is the magic line that fixes your error!
        });
    } catch (error) {
        next(error);
    }
};

const handleCreateMaintenanceRequest = async (req, res, next) => {
    try {
        // 1. Check for express-validator errors (consistent with login logic)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => req.flash('error', error.msg));
            return res.redirect('/maintenance/new');
        }

        const { unitId, title, description, priority } = req.body;

        // 2. Fallback validation for required fields
        if (!unitId || !title) {
            req.flash('error', 'Unit ID and Title are required.');
            return res.redirect('/maintenance/new');
        }

        const newRequest = await createMaintenanceRequest({
            requesterId: req.session.user.id, 
            unitId,
            title,
            description,
            priority
        });

        // 3. Success Flash
        req.flash('success', 'Maintenance request submitted successfully!');
        
        // Use the ID from the newly created record to redirect
        res.redirect(`/dashboard`);
    } catch (error) {
        console.error("Controller Error:", error);
        req.flash('error', 'There was an error submitting your request. Please try again.');
        res.redirect('/maintenance/new');
    }
};

export { 
    maintenanceRequestPage, 
    maintenanceDetailPage, 
    createMaintananceRequestPage,
    handleCreateMaintenanceRequest 
};