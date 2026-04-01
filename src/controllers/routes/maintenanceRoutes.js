import { Router } from 'express';
import { 
    maintenanceRequestPage, 
    maintenanceDetailPage, 
    createMaintananceRequestPage,
    handleCreateMaintenanceRequest,
    updateMaintenanceRequestPage,
    handleUpdateMaintenanceRequest
} from '../maintenance/maintenance.js'; 
import { requireLogin } from '../../middleware/auth.js';
import { maintenanceUpdateValidation, maintenanceCreateValidation } from '../../middleware/validation/forms.js';

const router = Router();


router.use(requireLogin);

router.get('/', maintenanceRequestPage);

router.get('/new', createMaintananceRequestPage);
router.post('/new', maintenanceCreateValidation, handleCreateMaintenanceRequest);

router.get('/update/:id', updateMaintenanceRequestPage);
router.post('/update/:id', maintenanceUpdateValidation, handleUpdateMaintenanceRequest);

router.get('/:id', maintenanceDetailPage);

export default router;