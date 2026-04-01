import { Router } from 'express';
// Pointing to the new nested path
import * as regController from '../forms/registrationController.js';

import { requireLogin, requireRole } from '../../middleware/auth.js';
import { registrationValidation, updateAccountValidation } from '../../middleware/validation/forms.js';

const router = Router();

// --- Static Routes ---
router.get('/', regController.showRegistrationForm);
router.post('/', registrationValidation, regController.processRegistration);
router.get('/list', requireRole('admin'), regController.showAllUsers);

// --- Parameterized Routes ---
router.get('/:id/edit', requireLogin, regController.showEditAccountForm);
router.post('/:id/edit', requireLogin, updateAccountValidation, regController.processEditAccount);
router.post('/:id/delete', requireLogin, regController.processDeleteAccount);

export default router;