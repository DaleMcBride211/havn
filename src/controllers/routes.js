import { Router } from 'express';
import { homePage, aboutPage } from './index.js';
import { propertyListPage, propertyDetailPage } from './properties/list.js';
import loginRoutes from './forms/login.js';
import registrationRoutes from './forms/registration.js';
import { processLogout, showDashboard } from './forms/login.js';
import { requireLogin } from '../middleware/auth.js';
import { tenantLeasePage } from './leaseunit/lease.js';

const router = Router();


router.get('/', homePage);

router.get('/about', aboutPage);

router.get('/properties', propertyListPage);

router.get('/properties/:id', propertyDetailPage);

router.use('/register', registrationRoutes);

router.get('/leaseunit', requireLogin, tenantLeasePage);

// router.get('/maintenance', );

router.use('/login', loginRoutes);

router.get('/logout', processLogout);

router.get('/dashboard', requireLogin, showDashboard);

export default router;