import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateMiddleware } from '../middlewares/authenticate.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema } from '../validations/auth/login.schema.js';

const router = Router();

router.post('/login', validate({ body: loginSchema }), authController.login);
router.get('/me', authenticateMiddleware, authController.me);

export default router;
