import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export function createNotificationsRouter(controller: NotificationsController): Router {
  const router = Router();

  router.use(requireAuth);

  router.get('/preferences', controller.getPreferences);
  router.patch('/preferences', controller.updatePreferences);
  router.post('/dispatch-reminders', controller.dispatchReminders);

  return router;
}
