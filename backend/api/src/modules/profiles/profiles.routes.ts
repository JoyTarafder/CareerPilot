import { Router } from 'express';
import { ProfilesController } from './profiles.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export function createProfilesRouter(controller: ProfilesController): Router {
  const router = Router();

  // All profile endpoints require authentication
  router.use(requireAuth);

  router.get('/', controller.getProfile);
  router.patch('/', controller.updateProfile);

  router.post('/educations', controller.addEducation);
  router.delete('/educations/:id', controller.deleteEducation);

  router.post('/experiences', controller.addExperience);
  router.delete('/experiences/:id', controller.deleteExperience);

  router.post('/projects', controller.addProject);
  router.delete('/projects/:id', controller.deleteProject);

  return router;
}
