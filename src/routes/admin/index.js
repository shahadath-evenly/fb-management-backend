import { Router } from 'express';
import outletRoutes from './outlet.routes.js';

const router = Router();

router.use('/outlets', outletRoutes);

// Staff, menu, menu-assignment and report routes are mounted here
// starting their respective phases.

export default router;
