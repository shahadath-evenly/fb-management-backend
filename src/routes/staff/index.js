import { Router } from 'express';
import menuRoutes from './menu.routes.js';
import inventoryRoutes from './inventory.routes.js';

const router = Router();

router.use('/menu', menuRoutes);
router.use('/inventory', inventoryRoutes);

// Sales routes are mounted here starting Phase 12.

export default router;
