import { Router } from 'express';
import { homePage, aboutPage } from './index.js';
import { propertyListPage, propertyDetailPage } from './properties/list.js';
import loginRoutes from './forms/login.js';
import registrationRoutes from './forms/registration.js';
import { processLogout } from './forms/login.js';
import { requireLogin, requireRole } from '../middleware/auth.js';
import { dashboardPage } from './dashboard/dashboard.js';
import { maintenanceRequestPage, maintenanceDetailPage, createMaintananceRequestPage } from './requests/maintenance.js';

const router = Router();


router.get('/', homePage);

router.get('/about', aboutPage);

router.get('/properties', propertyListPage);

router.get('/properties/:id', propertyDetailPage);

router.use('/register', registrationRoutes);

router.get('/dashboard', requireLogin, dashboardPage);

router.get('/maintenance', maintenanceRequestPage);

router.get('/maintenance/new', createMaintananceRequestPage);

router.get('/maintenance/:id', maintenanceDetailPage);

router.use('/login', loginRoutes);

router.get('/logout', processLogout);

export default router;