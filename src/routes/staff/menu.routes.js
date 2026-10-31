import { Router } from 'express';
import { staffMenuController } from '../../controllers/staff/menu.controller.js';
import { authenticateMiddleware } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticateMiddleware, authorize('staff'));

// outletId is always derived from req.user (set by authenticateMiddleware
// from the verified JWT) — never from a client-supplied param/query/body.
router.get('/', staffMenuController.list);

export default router;
