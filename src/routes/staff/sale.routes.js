import { Router } from 'express';
import { staffSaleController } from '../../controllers/staff/sale.controller.js';
import { authenticateMiddleware } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createSaleSchema } from '../../validations/staff/sale.schema.js';

const router = Router();

router.use(authenticateMiddleware, authorize('staff'));

// outletId is always derived from req.user — never from the client.
router.post('/', validate({ body: createSaleSchema }), staffSaleController.create);

export default router;
