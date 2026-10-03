import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './core/errors.js';
import { IAuthRepository, PrismaAuthRepository } from './modules/auth/auth.repository.js';
import { AuthService } from './modules/auth/auth.service.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { IProfilesRepository, PrismaProfilesRepository } from './modules/profiles/profiles.repository.js';
import { ProfilesService } from './modules/profiles/profiles.service.js';
import { ProfilesController } from './modules/profiles/profiles.controller.js';
import { createProfilesRouter } from './modules/profiles/profiles.routes.js';
import { IResumesRepository, PrismaResumesRepository } from './modules/resumes/resumes.repository.js';
import { ResumesService } from './modules/resumes/resumes.service.js';
import { ResumesController } from './modules/resumes/resumes.controller.js';
import { createResumesRouter } from './modules/resumes/resumes.routes.js';
import { IJobsRepository, PrismaJobsRepository } from './modules/jobs/jobs.repository.js';
import { JobsService } from './modules/jobs/jobs.service.js';
import { JobsController } from './modules/jobs/jobs.controller.js';
import { createJobsRouter } from './modules/jobs/jobs.routes.js';
import { IMatchingRepository, PrismaMatchingRepository } from './modules/matching/matching.repository.js';
import { MatchingService } from './modules/matching/matching.service.js';
import { MatchingController } from './modules/matching/matching.controller.js';
import { createMatchingRouter } from './modules/matching/matching.routes.js';
import { IApplicationsRepository, PrismaApplicationsRepository } from './modules/applications/applications.repository.js';
import { ApplicationsService } from './modules/applications/applications.service.js';
import { ApplicationsController } from './modules/applications/applications.controller.js';
import { createApplicationsRouter } from './modules/applications/applications.routes.js';
import { IWritingRepository, PrismaWritingRepository } from './modules/writing/writing.repository.js';
import { WritingService } from './modules/writing/writing.service.js';
import { WritingController } from './modules/writing/writing.controller.js';
import { createWritingRouter } from './modules/writing/writing.routes.js';
import { IAIWritingAdapter, GeminiWritingAdapter } from './modules/ai/gemini-writing.adapter.js';
import { IInterviewRepository, PrismaInterviewRepository } from './modules/interview/interview.repository.js';
import { InterviewService } from './modules/interview/interview.service.js';
import { InterviewController } from './modules/interview/interview.controller.js';
import { createInterviewRouter } from './modules/interview/interview.routes.js';
import { IInterviewAIAdapter, GeminiInterviewAdapter } from './modules/ai/gemini-interview.adapter.js';
import { INotificationsRepository, PrismaNotificationsRepository } from './modules/notifications/notifications.repository.js';
import { NotificationsService } from './modules/notifications/notifications.service.js';
import { NotificationsController } from './modules/notifications/notifications.controller.js';
import { createNotificationsRouter } from './modules/notifications/notifications.routes.js';
import { ISupportRepository, PrismaSupportRepository } from './modules/support/support.repository.js';
import { SupportService } from './modules/support/support.service.js';
import { SupportController } from './modules/support/support.controller.js';
import { createSupportRouter } from './modules/support/support.routes.js';

export interface AppDependencies {
  authRepo?: IAuthRepository;
  profilesRepo?: IProfilesRepository;
  resumesRepo?: IResumesRepository;
  jobsRepo?: IJobsRepository;
  matchingRepo?: IMatchingRepository;
  applicationsRepo?: IApplicationsRepository;
  writingRepo?: IWritingRepository;
  writingAdapter?: IAIWritingAdapter;
  interviewRepo?: IInterviewRepository;
  interviewAdapter?: IInterviewAIAdapter;
  notificationsRepo?: INotificationsRepository;
  supportRepo?: ISupportRepository;
}

export function createApp(deps: AppDependencies = {}) {
  const app = express();

  // Basic security headers
  app.use(
    helmet({
      contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    })
  );

  // CORS allowlist configuration
  const allowedOrigins = config.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Origin not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key'],
    })
  );

  // Request ID & parsing
  app.use(requestIdMiddleware);
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  // Liveness check (process is running)
  app.get('/live', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Readiness check (dependencies reachable)
  app.get('/ready', (_req, res) => {
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  });

  // Base API health check
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'careerpilot-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  });

  // Wire Auth Module
  const authRepo = deps.authRepo || new PrismaAuthRepository();
  const authService = new AuthService(authRepo);
  const authController = new AuthController(authService);
  app.use('/api/v1/auth', createAuthRouter(authController));

  // Wire Profiles Module
  const profilesRepo = deps.profilesRepo || new PrismaProfilesRepository();
  const profilesService = new ProfilesService(profilesRepo);
  const profilesController = new ProfilesController(profilesService);
  app.use('/api/v1/profile', createProfilesRouter(profilesController));

  // Wire Resumes Module
  const resumesRepo = deps.resumesRepo || new PrismaResumesRepository();
  const resumesService = new ResumesService(resumesRepo, profilesRepo);
  const resumesController = new ResumesController(resumesService);
  app.use('/api/v1/resumes', createResumesRouter(resumesController));

  // Wire Jobs Module
  const jobsRepo = deps.jobsRepo || new PrismaJobsRepository();
  const jobsService = new JobsService(jobsRepo);
  const jobsController = new JobsController(jobsService);
  app.use('/api/v1/jobs', createJobsRouter(jobsController));

  // Wire Matching Module
  const matchingRepo = deps.matchingRepo || new PrismaMatchingRepository();
  const matchingService = new MatchingService(matchingRepo);
  const matchingController = new MatchingController(matchingService);
  app.use('/api/v1/analyses', createMatchingRouter(matchingController));

  // Wire Applications Module
  const applicationsRepo = deps.applicationsRepo || new PrismaApplicationsRepository();
  const applicationsService = new ApplicationsService(applicationsRepo);
  const applicationsController = new ApplicationsController(applicationsService);
  app.use('/api/v1/applications', createApplicationsRouter(applicationsController));

  // Wire Writing Module
  const writingRepo = deps.writingRepo || new PrismaWritingRepository();
  const writingAdapter = deps.writingAdapter || new GeminiWritingAdapter();
  const writingService = new WritingService(writingRepo, writingAdapter);
  const writingController = new WritingController(writingService);
  app.use('/api/v1/writing', createWritingRouter(writingController));

  // Wire Interview Module
  const interviewRepo = deps.interviewRepo || new PrismaInterviewRepository();
  const interviewAdapter = deps.interviewAdapter || new GeminiInterviewAdapter();
  const interviewService = new InterviewService(interviewRepo, interviewAdapter);
  const interviewController = new InterviewController(interviewService);
  app.use('/api/v1/interviews', createInterviewRouter(interviewController));

  // Wire Notifications Module
  const notificationsRepo = deps.notificationsRepo || new PrismaNotificationsRepository();
  const notificationsService = new NotificationsService(notificationsRepo, applicationsRepo, authRepo);
  const notificationsController = new NotificationsController(notificationsService);
  app.use('/api/v1/notifications', createNotificationsRouter(notificationsController));

  // Wire Support Module
  const supportRepo = deps.supportRepo || new PrismaSupportRepository();
  const supportService = new SupportService(supportRepo);
  const supportController = new SupportController(supportService);
  app.use('/api/v1/support', createSupportRouter(supportController));

  // 404 catch-all
  app.use((_req, _res, next) => {
    next(new NotFoundError('The requested endpoint does not exist'));
  });

  // Central error handler
  app.use(errorHandler);

  return app;
}
