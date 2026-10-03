import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.post('/admin/login', controller.adminLogin);
  router.post('/refresh', controller.refresh);
  router.post('/logout', controller.logout);
  router.post('/revoke-all', requireAuth, controller.revokeAll);
  router.get('/me', requireAuth, controller.me);

  return router;
}
