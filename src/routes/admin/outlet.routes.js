import { Router } from 'express';
import { outletController } from '../../controllers/admin/outlet.controller.js';
import { authenticateMiddleware } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createOutletSchema,
  listOutletsQuerySchema,
  updateOutletSchema,
  updateOutletStatusSchema,
} from '../../validations/admin/outlet.schema.js';
import { idParamSchema } from '../../validations/common/params.schema.js';

const router = Router();

router.use(authenticateMiddleware, authorize('admin'));

router.post('/', validate({ body: createOutletSchema }), outletController.create);
router.get('/', validate({ query: listOutletsQuerySchema }), outletController.list);
router.patch('/:id', validate({ params: idParamSchema, body: updateOutletSchema }), outletController.update);
router.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: updateOutletStatusSchema }),
  outletController.updateStatus,
);
router.delete('/:id', validate({ params: idParamSchema }), outletController.remove);

export default router;
