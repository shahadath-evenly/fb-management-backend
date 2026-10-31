import { Router } from 'express';
import outletRoutes from './outlet.routes.js';
import staffRoutes from './staff.routes.js';
import menuRoutes from './menu.routes.js';
import menuAssignmentRoutes from './menu-assignment.routes.js';
import reportRoutes from './report.routes.js';

const router = Router();

router.use('/outlets', outletRoutes);
router.use('/staff', staffRoutes);
router.use('/menus', menuRoutes);
router.use('/menu-assignments', menuAssignmentRoutes);
router.use('/reports', reportRoutes);

export default router;
