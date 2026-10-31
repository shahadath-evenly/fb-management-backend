import { Router } from 'express';
import outletRoutes from './outlet.routes.js';
import staffRoutes from './staff.routes.js';

const router = Router();

router.use('/outlets', outletRoutes);
router.use('/staff', staffRoutes);

// Menu, menu-assignment and report routes are mounted here starting
// their respective phases.

export default router;
