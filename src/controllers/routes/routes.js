import { Router } from 'express';
import { homePage, aboutPage } from './index.js';
import { propertyListPage, propertyDetailPage } from '../properties/list.js';
import loginRoutes from '../forms/login.js';
import registrationRoutes from './registrationRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js'; // Import the new file
import { processLogout } from '../forms/login.js';
import { requireLogin } from '../../middleware/auth.js';
import { dashboardPage } from '../dashboard/dashboard.js';

const router = Router();

// General Routes
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/properties', propertyListPage);
router.get('/properties/:id', propertyDetailPage);
router.get('/dashboard', requireLogin, dashboardPage);

// Auth Routes
router.use('/register', registrationRoutes);
router.use('/login', loginRoutes);
router.get('/logout', processLogout);

// Specialized Resource Routes
router.use('/maintenance', maintenanceRoutes);

export default router;