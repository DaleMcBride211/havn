import { Router } from 'express';
import { homePage } from './index.js';

const router = Router();

router.get('/', homePage);