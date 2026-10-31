import { Router } from 'express';
import { outletController } from '../../controllers/admin/outlet.controller.js';
import { authenticateMiddleware } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createOutletSchema, updateOutletSchema } from '../../validations/admin/outlet.schema.js';
import { idParamSchema } from '../../validations/common/params.schema.js';

const router = Router();

router.use(authenticateMiddleware, authorize('admin'));

router.post('/', validate({ body: createOutletSchema }), outletController.create);
router.get('/', outletController.list);
router.patch('/:id', validate({ params: idParamSchema, body: updateOutletSchema }), outletController.update);

export default router;
