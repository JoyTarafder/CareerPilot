import { Request, Response, NextFunction } from 'express';
import { ResumesService } from './resumes.service.js';
import { DocxExportService } from '../exports/docx-export.service.js';
import { PdfExportService } from '../exports/pdf-export.service.js';
import { renderResumeToHtml } from '../exports/templates/html-renderer.js';
import {
  CreateResumeRequestSchema,
  UpdateResumeRequestSchema,
} from '@careerpilot/contracts';
import { ValidationError, UnauthorizedError } from '../../core/errors.js';

export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly docxExporter: DocxExportService = new DocxExportService(),
    private readonly pdfExporter: PdfExportService = new PdfExportService()
  ) {}

  listResumes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const resumes = await this.resumesService.listResumes(req.user.userId);
      res.status(200).json({ resumes });
    } catch (err) {
      next(err);
    }
  };

  createResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const parsed = CreateResumeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid resume input', parsed.error.flatten().fieldErrors);
      }

      const resume = await this.resumesService.createResume(req.user.userId, parsed.data);
      res.status(201).json({ resume });
    } catch (err) {
      next(err);
    }
  };

  getResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const resume = await this.resumesService.getResume(req.user.userId, req.params.id as string);
      res.status(200).json({ resume });
    } catch (err) {
      next(err);
    }
  };

  updateResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const parsed = UpdateResumeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid resume update', parsed.error.flatten().fieldErrors);
      }

      const updated = await this.resumesService.updateResume(
        req.user.userId,
        req.params.id as string,
        parsed.data
      );
      res.status(200).json({ resume: updated });
    } catch (err) {
      next(err);
    }
  };

  duplicateResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const duplicated = await this.resumesService.duplicateResume(
        req.user.userId,
        req.params.id as string
      );
      res.status(201).json({ resume: duplicated });
    } catch (err) {
      next(err);
    }
  };

  archiveResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      await this.resumesService.archiveResume(req.user.userId, req.params.id as string);
      res.status(200).json({ message: 'Resume archived' });
    } catch (err) {
      next(err);
    }
  };

  previewHtml = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const content = await this.resumesService.getLatestContent(
        req.user.userId,
        req.params.id as string
      );
      const html = renderResumeToHtml(content);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    } catch (err) {
      next(err);
    }
  };

  exportDocx = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const resume = await this.resumesService.getResume(req.user.userId, req.params.id as string);
      const content = await this.resumesService.getLatestContent(
        req.user.userId,
        req.params.id as string
      );

      const buffer = await this.docxExporter.generateDocx(content);
      const filename = `${resume.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  };

  exportPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const resume = await this.resumesService.getResume(req.user.userId, req.params.id as string);
      const content = await this.resumesService.getLatestContent(
        req.user.userId,
        req.params.id as string
      );

      const { buffer, mimeType } = await this.pdfExporter.generatePdf(content);
      const filename = `${resume.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  };
}
