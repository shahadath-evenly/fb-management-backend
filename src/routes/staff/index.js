import { Router } from 'express';
import menuRoutes from './menu.routes.js';

const router = Router();

router.use('/menu', menuRoutes);

// Inventory and sales routes are mounted here starting their
// respective phases.

export default router;
