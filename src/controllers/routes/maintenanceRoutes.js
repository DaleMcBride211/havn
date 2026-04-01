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

const router = Router();


router.use(requireLogin);

router.get('/', maintenanceRequestPage);

router.get('/new', createMaintananceRequestPage);
router.post('/new', handleCreateMaintenanceRequest);

router.get('/update/:id', updateMaintenanceRequestPage);
router.post('/update/:id', handleUpdateMaintenanceRequest);

router.get('/:id', maintenanceDetailPage);

export default router;