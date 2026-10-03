import { Router } from 'express';
import { InterviewController } from './interview.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export function createInterviewRouter(controller: InterviewController): Router {
  const router = Router();

  router.use(requireAuth);

  router.post('/', controller.startSession);
  router.get('/', controller.listSessions);
  router.get('/:id', controller.getSession);
  router.post('/:id/answers', controller.submitAnswer);
  router.post('/:id/complete', controller.completeSession);

  return router;
}
