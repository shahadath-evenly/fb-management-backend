import { Router } from 'express';
import { staffInventoryController } from '../../controllers/staff/inventory.controller.js';
import { authenticateMiddleware } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  addStockSchema,
  updateStockSchema,
  listInventoryQuerySchema,
} from '../../validations/staff/inventory.schema.js';
import { uuidParamSchema } from '../../validations/common/params.schema.js';

const router = Router();

router.use(authenticateMiddleware, authorize('staff'));

// outletId is always derived from req.user — never from a
// client-supplied param/query/body.
router.get(
  '/',
  validate({ query: listInventoryQuerySchema }),
  staffInventoryController.list,
);
router.post('/', validate({ body: addStockSchema }), staffInventoryController.addStock);
router.patch(
  '/:menuId',
  validate({ params: uuidParamSchema('menuId'), body: updateStockSchema }),
  staffInventoryController.updateStock,
);

export default router;
