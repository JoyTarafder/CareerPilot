import { Router } from 'express';
import { ApplicationsController } from './applications.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export function createApplicationsRouter(controller: ApplicationsController): Router {
  const router = Router();

  router.use(requireAuth);

  router.post('/', controller.createApplication);
  router.get('/', controller.listApplications);
  router.get('/metrics', controller.getMetrics);
  router.get('/reminders', controller.getReminders);
  router.get('/:id', controller.getApplicationById);
  router.patch('/:id', controller.updateApplication);
  router.patch('/:id/status', controller.updateStatus);
  router.delete('/:id', controller.deleteApplication);

  return router;
}
