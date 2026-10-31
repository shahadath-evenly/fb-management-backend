import { Router } from 'express';
import { menuAssignmentController } from '../../controllers/admin/menu-assignment.controller.js';
import { authenticateMiddleware } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createAssignmentSchema,
  listAssignmentsQuerySchema,
  updateAssignmentPriceSchema,
} from '../../validations/admin/menu-assignment.schema.js';
import { idParamSchema } from '../../validations/common/params.schema.js';

const router = Router();

router.use(authenticateMiddleware, authorize('admin'));

router.post('/', validate({ body: createAssignmentSchema }), menuAssignmentController.create);
router.get('/', validate({ query: listAssignmentsQuerySchema }), menuAssignmentController.list);
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateAssignmentPriceSchema }),
  menuAssignmentController.updatePrice,
);
router.delete('/:id', validate({ params: idParamSchema }), menuAssignmentController.remove);

export default router;
