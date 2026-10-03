import { IResumesRepository, FullResume } from './resumes.repository.js';
import { IProfilesRepository } from '../profiles/profiles.repository.js';
import {
  CreateResumeRequest,
  UpdateResumeRequest,
  ResumeContentSnapshot,
} from '@careerpilot/contracts';
import { NotFoundError } from '../../core/errors.js';
import { Resume, ResumeVersion } from '@prisma/client';

export class ResumesService {
  constructor(
    private readonly resumesRepo: IResumesRepository,
    private readonly profilesRepo?: IProfilesRepository
  ) {}

  async listResumes(userId: string): Promise<Resume[]> {
    return this.resumesRepo.listResumes(userId);
  }

  async getResume(userId: string, resumeId: string): Promise<FullResume> {
    const resume = await this.resumesRepo.getResumeById(userId, resumeId);
    if (!resume) {
      throw new NotFoundError('Resume not found');
    }
    return resume;
  }

  async createResume(userId: string, dto: CreateResumeRequest): Promise<FullResume> {
    let initialContent: ResumeContentSnapshot;

    if (dto.initialContent) {
      initialContent = dto.initialContent;
    } else if (dto.fromProfile && this.profilesRepo) {
      const profile = await this.profilesRepo.getProfileByUserId(userId);
      initialContent = {
        personalInfo: {
          fullName: 'Candidate Name',
          email: 'candidate@example.com',
          phoneNumber: profile?.phoneNumber || undefined,
          location: profile?.location || undefined,
          portfolioUrl: profile?.portfolioUrl || undefined,
          githubUrl: profile?.githubUrl || undefined,
          linkedinUrl: profile?.linkedinUrl || undefined,
        },
        summary: profile?.summary || undefined,
        educations:
          profile?.educations.map((e) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
            startDate: e.startDate.toISOString().split('T')[0]!,
            endDate: e.endDate ? e.endDate.toISOString().split('T')[0] : undefined,
            isCurrent: e.isCurrent,
            description: e.description || undefined,
          })) || [],
        experiences:
          profile?.experiences.map((exp) => ({
            company: exp.company,
            role: exp.role,
            location: exp.location || undefined,
            startDate: exp.startDate.toISOString().split('T')[0]!,
            endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : undefined,
            isCurrent: exp.isCurrent,
            description: exp.description || undefined,
            highlights: exp.highlights || [],
          })) || [],
        projects:
          profile?.projects.map((p) => ({
            title: p.title,
            description: p.description || undefined,
            url: p.url || undefined,
            technologies: p.technologies || [],
          })) || [],
        skills: [
          {
            category: 'Core Skills',
            items: profile?.profileSkills.map((ps) => ps.skill.name) || [],
          },
        ],
        sectionOrder: ['summary', 'experience', 'education', 'projects', 'skills'],
        template: dto.templateName || 'Foundation',
      };
    } else {
      initialContent = {
        personalInfo: {
          fullName: 'Your Name',
          email: 'your.email@example.com',
        },
        summary: '',
        educations: [],
        experiences: [],
        projects: [],
        skills: [],
        sectionOrder: ['summary', 'experience', 'education', 'projects', 'skills'],
        template: dto.templateName || 'Foundation',
      };
    }

    return this.resumesRepo.createResume(userId, dto.title, dto.templateName, initialContent);
  }

  async updateResume(userId: string, resumeId: string, dto: UpdateResumeRequest): Promise<FullResume> {
    const existing = await this.resumesRepo.getResumeById(userId, resumeId);
    if (!existing) {
      throw new NotFoundError('Resume not found');
    }

    if (dto.title || dto.templateName) {
      await this.resumesRepo.updateResume(userId, resumeId, {
        title: dto.title,
        templateName: dto.templateName,
      });
    }

    if (dto.content) {
      await this.resumesRepo.createVersion(userId, resumeId, dto.content, 'Content updated');
    }

    return (await this.resumesRepo.getResumeById(userId, resumeId))!;
  }

  async duplicateResume(userId: string, resumeId: string): Promise<FullResume> {
    const duplicated = await this.resumesRepo.duplicateResume(userId, resumeId);
    if (!duplicated) {
      throw new NotFoundError('Resume not found to duplicate');
    }
    return duplicated;
  }

  async archiveResume(userId: string, resumeId: string): Promise<void> {
    const success = await this.resumesRepo.archiveResume(userId, resumeId);
    if (!success) {
      throw new NotFoundError('Resume not found');
    }
  }

  async createVersion(
    userId: string,
    resumeId: string,
    content: ResumeContentSnapshot,
    summaryDiff?: string
  ): Promise<ResumeVersion> {
    const version = await this.resumesRepo.createVersion(userId, resumeId, content, summaryDiff);
    if (!version) {
      throw new NotFoundError('Resume not found');
    }
    return version;
  }

  async getLatestContent(userId: string, resumeId: string): Promise<ResumeContentSnapshot> {
    const version = await this.resumesRepo.getLatestVersion(userId, resumeId);
    if (!version) {
      throw new NotFoundError('Resume or version not found');
    }
    return version.contentSnapshot as unknown as ResumeContentSnapshot;
  }
}
