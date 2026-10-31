import { Router } from 'express';
import outletRoutes from './outlet.routes.js';
import staffRoutes from './staff.routes.js';
import menuRoutes from './menu.routes.js';

const router = Router();

router.use('/outlets', outletRoutes);
router.use('/staff', staffRoutes);
router.use('/menus', menuRoutes);

// Menu-assignment and report routes are mounted here starting their
// respective phases.

export default router;
