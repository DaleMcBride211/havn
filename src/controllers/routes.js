import { Router } from 'express';
import { homePage, aboutPage } from './index.js';

const router = Router();


router.get('/', homePage);

router.get('/about', aboutPage);


// router.get('/properties', )

export default router;