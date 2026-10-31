import { Router } from 'express';
import menuRoutes from './menu.routes.js';
import inventoryRoutes from './inventory.routes.js';
import saleRoutes from './sale.routes.js';

const router = Router();

router.use('/menu', menuRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', saleRoutes);

export default router;
