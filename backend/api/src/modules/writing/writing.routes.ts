import { Router } from 'express';
import { WritingController } from './writing.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export function createWritingRouter(controller: WritingController): Router {
  const router = Router();

  router.use(requireAuth);

  router.post('/improve-bullet', controller.improveBullet);
  router.post('/improve-summary', controller.improveSummary);
  router.post('/cover-letter', controller.generateCoverLetter);
  router.get('/quota', controller.getQuota);
  router.get('/admin/metrics', requireRole('ADMIN', 'SUPER_ADMIN'), controller.getAdminMetrics);

  return router;
}
