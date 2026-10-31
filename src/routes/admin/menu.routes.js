import { Router } from 'express';
import { menuController } from '../../controllers/admin/menu.controller.js';
import { authenticateMiddleware } from '../../middlewares/authenticate.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createMenuSchema, updateMenuSchema } from '../../validations/admin/menu.schema.js';
import { idParamSchema } from '../../validations/common/params.schema.js';

const router = Router();

router.use(authenticateMiddleware, authorize('admin'));

router.post('/', validate({ body: createMenuSchema }), menuController.create);
router.get('/', menuController.list);
router.patch('/:id', validate({ params: idParamSchema, body: updateMenuSchema }), menuController.update);
router.delete('/:id', validate({ params: idParamSchema }), menuController.remove);

export default router;
