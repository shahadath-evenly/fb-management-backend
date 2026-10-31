import { Router } from 'express';
import { staffController } from '../../controllers/admin/staff.controller.js';
import { authenticateMiddleware } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createStaffSchema,
  listStaffQuerySchema,
  updateStaffSchema,
  updateStaffStatusSchema,
} from '../../validations/admin/staff.schema.js';
import { idParamSchema } from '../../validations/common/params.schema.js';

const router = Router();

router.use(authenticateMiddleware, authorize('admin'));

router.post('/', validate({ body: createStaffSchema }), staffController.create);
router.get('/', validate({ query: listStaffQuerySchema }), staffController.list);
router.patch('/:id', validate({ params: idParamSchema, body: updateStaffSchema }), staffController.update);
router.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: updateStaffStatusSchema }),
  staffController.updateStatus,
);
router.delete('/:id', validate({ params: idParamSchema }), staffController.remove);

export default router;
