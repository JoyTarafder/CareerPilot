import { Router } from 'express';
import { MatchingController } from './matching.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export function createMatchingRouter(controller: MatchingController): Router {
  const router = Router();

  router.use(requireAuth);

  router.post('/', controller.createAnalysis);
  router.get('/:id', controller.getAnalysis);
  router.get('/resume/:resumeVersionId', controller.listAnalysesForResume);

  return router;
}
