import { Router } from 'express';
import { successResponse } from '../utils/response.js';

const router = Router();

router.get('/', (req, res) => {
  successResponse(res, 200, 'Service is healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
