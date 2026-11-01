import { Router } from 'express';
import { staffDashboardController } from '../../controllers/staff/dashboard.controller.js';
import { authenticateMiddleware } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticateMiddleware, authorize('staff'));

// outletId is always derived from req.user — never from the client.
router.get('/', staffDashboardController.summary);

export default router;
