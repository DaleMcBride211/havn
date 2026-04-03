import { Router } from 'express';
import { homePage, aboutPage } from './index.js';
import { propertyListPage, propertyDetailPage, submitNewProperty, newPropertyPage, submitApplication  } from '../properties/list.js';
import loginRoutes from '../forms/login.js';
import registrationRoutes from './registrationRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js'; 
import { processLogout } from '../forms/login.js';
import { requireLogin, requireRole } from '../../middleware/auth.js';
import { dashboardPage } from '../dashboard/dashboard.js';
import contactRoutes from '../forms/contact.js';
import { cancelMaintenanceRequest } from '../maintenance/maintenance.js';
import { propertyCreateValidation } from '../../middleware/validation/forms.js';
import { adminApplicationsPage, processApproval } from '../application/list.js';

const router = Router();

// General Routes
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/apply/:propertyId/:unitId', requireLogin, submitApplication);
router.get('/applications', requireRole('admin'), adminApplicationsPage);
router.get('/applications/approve/:id', requireRole('admin'), processApproval);
router.get('/properties', propertyListPage);
router.get('/properties/new', requireRole('admin'), newPropertyPage);
router.post('/properties/new', requireRole('admin'), propertyCreateValidation, submitNewProperty);
router.get('/properties/:id', propertyDetailPage);
router.use('/contact', contactRoutes);
router.get('/dashboard', requireLogin, dashboardPage);
router.post('/dashboard', cancelMaintenanceRequest);

// Auth Routes
router.use('/register', registrationRoutes);
router.use('/login', loginRoutes);
router.get('/logout', processLogout);

// Specialized Resource Routes
router.use('/maintenance', maintenanceRoutes);

export default router;