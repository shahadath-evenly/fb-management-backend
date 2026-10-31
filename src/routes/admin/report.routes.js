import { Router } from 'express';
import { reportController } from '../../controllers/admin/report.controller.js';
import { authenticateMiddleware } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticateMiddleware, authorize('admin'));

router.get('/revenue-by-outlet', reportController.revenueByOutlet);
router.get('/top-selling-items', reportController.topSellingItems);

export default router;
