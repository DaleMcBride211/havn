import { Router } from 'express';
import { homePage, aboutPage } from './index.js';
import { propertyListPage, propertyDetailPage } from './properties/list.js';
import loginRoutes from './forms/login.js';
import registrationRoutes from './forms/registration.js';

const router = Router();


router.get('/', homePage);

router.get('/about', aboutPage);

router.get('/properties', propertyListPage);

router.get('/properties/:id', propertyDetailPage);

router.use('/register', registrationRoutes);

router.use('/login', loginRoutes);

export default router;