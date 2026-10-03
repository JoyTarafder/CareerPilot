import { Router } from 'express';
import { ResumesController } from './resumes.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export function createResumesRouter(controller: ResumesController): Router {
  const router = Router();

  router.use(requireAuth);

  router.get('/', controller.listResumes);
  router.post('/', controller.createResume);
  router.get('/:id', controller.getResume);
  router.patch('/:id', controller.updateResume);
  router.post('/:id/duplicate', controller.duplicateResume);
  router.delete('/:id', controller.archiveResume);

  // Document preview and exports
  router.get('/:id/preview', controller.previewHtml);
  router.post('/:id/export/docx', controller.exportDocx);
  router.post('/:id/export/pdf', controller.exportPdf);

  return router;
}
