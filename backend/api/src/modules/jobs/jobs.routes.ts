import { Router } from 'express';
import { JobsController } from './jobs.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export function createJobsRouter(controller: JobsController): Router {
  const router = Router();

  router.use(requireAuth);

  router.get('/', controller.listJobs);
  router.post('/', controller.createJob);
  router.get('/:id', controller.getJob);
  router.patch('/:id', controller.updateRequirements);
  router.delete('/:id', controller.deleteJob);

  return router;
}
