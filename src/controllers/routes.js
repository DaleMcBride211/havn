import { Router } from 'express';
import { homePage, aboutPage } from './index.js';
import { propertyListPage } from './properties/list.js'

const router = Router();


router.get('/', homePage);

router.get('/about', aboutPage);

router.get('/properties', propertyListPage);

export default router;