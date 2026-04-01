import { 
    getAllMaintenanceRequests,
    getMaintenanceRequestById,
    createMaintenanceRequest
} from '../../models/requests/maintenance.js';



const maintenanceRequestPage = async (req, res, next) => {
    const maintenanceRequests = await getAllMaintenanceRequests();
    console.log(maintenanceRequests);
    res.render('maintenance/list', {
        title: 'Maintenance Requests',
        stylesheet: 'maintenanceRequests.css',
        maintenanceRequests
    })
};


const maintenanceDetailPage = async (req, res, next) => {
    const requestId = req.params.id;

    const specificRequest = await getMaintenanceRequestById(requestId);
    console.log(specificRequest);

    if (!requestId) {
        const err = new Error( `Request id ${requestId}`);
        err.status = 404;
        return next(err);
    }

    res.render('maintenance/detail', {
        title: specificRequest.details.property,
        stylesheet: 'requestDetail.css',
        specificRequest
    });
};

// GET - Renders the form to create a new request
const createMaintananceRequestPage = async (req, res, next) => {
    try {
        res.render('maintenance/create', {
            title: 'Submit Maintenance Request',
            stylesheet: 'maintenanceForm.css'
        });
    } catch (error) {
        next(error);
    }
};

// POST - Processes the form submission
const handleCreateMaintenanceRequest = async (req, res, next) => {
    try {
        // Assuming req.body contains: title, description, priority, unitId
        // And req.user.id comes from your authentication middleware
        const newRequest = await createMaintenanceRequest({
            requesterId: req.user.id, 
            unitId: req.body.unitId,
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority
        });

        // Redirect to the detail page of the newly created request
        res.redirect(`/maintenance/${newRequest.id}`);
    } catch (error) {
        console.error("Controller Error:", error);
        next(error);
    }
};



export { 
    maintenanceRequestPage, 
    maintenanceDetailPage, 
    createMaintananceRequestPage,
    handleCreateMaintenanceRequest 
};