import { Router } from 'express';
import { SupportController } from './support.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export function createSupportRouter(controller: SupportController): Router {
  const router = Router();

  router.use(requireAuth);

  // Candidate endpoints
  router.post('/grant', controller.grantAccess);
  router.delete('/revoke', controller.revokeAccess);
  router.get('/status', controller.getStatus);

  // Admin endpoints
  router.get('/admin/grants', requireRole('ADMIN', 'SUPER_ADMIN'), controller.adminListGrants);
  router.get('/admin/verify/:candidateId', requireRole('ADMIN', 'SUPER_ADMIN'), controller.adminVerifyAccess);

  return router;
}
