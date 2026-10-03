import { PrismaClient, Resume, ResumeVersion } from '@prisma/client';
import { ResumeContentSnapshot } from '@careerpilot/contracts';

export type FullResume = Resume & { versions: ResumeVersion[] };

export interface IResumesRepository {
  listResumes(userId: string): Promise<Resume[]>;
  getResumeById(userId: string, resumeId: string): Promise<FullResume | null>;
  createResume(
    userId: string,
    title: string,
    templateName: string,
    initialContent: ResumeContentSnapshot
  ): Promise<FullResume>;
  updateResume(
    userId: string,
    resumeId: string,
    data: { title?: string; templateName?: string }
  ): Promise<Resume | null>;
  duplicateResume(userId: string, resumeId: string): Promise<FullResume | null>;
  archiveResume(userId: string, resumeId: string): Promise<boolean>;
  createVersion(
    userId: string,
    resumeId: string,
    contentSnapshot: ResumeContentSnapshot,
    summaryDiff?: string
  ): Promise<ResumeVersion | null>;
  getLatestVersion(userId: string, resumeId: string): Promise<ResumeVersion | null>;
  getVersionByNumber(userId: string, resumeId: string, versionNumber: number): Promise<ResumeVersion | null>;
}

export class PrismaResumesRepository implements IResumesRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async listResumes(userId: string): Promise<Resume[]> {
    return this.prisma.resume.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getResumeById(userId: string, resumeId: string): Promise<FullResume | null> {
    return this.prisma.resume.findFirst({
      where: { id: resumeId, userId, deletedAt: null },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
      },
    });
  }

  async createResume(
    userId: string,
    title: string,
    templateName: string,
    initialContent: ResumeContentSnapshot
  ): Promise<FullResume> {
    return this.prisma.resume.create({
      data: {
        userId,
        title,
        templateName,
        versions: {
          create: {
            versionNumber: 1,
            contentSnapshot: initialContent as any,
          },
        },
      },
      include: {
        versions: true,
      },
    });
  }

  async updateResume(
    userId: string,
    resumeId: string,
    data: { title?: string; templateName?: string }
  ): Promise<Resume | null> {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId, deletedAt: null },
    });
    if (!resume) return null;

    return this.prisma.resume.update({
      where: { id: resumeId },
      data,
    });
  }

  async duplicateResume(userId: string, resumeId: string): Promise<FullResume | null> {
    const original = await this.getResumeById(userId, resumeId);
    if (!original || original.versions.length === 0) return null;

    const latestVersion = original.versions[0]!;

    return this.createResume(
      userId,
      `${original.title} (Copy)`,
      original.templateName,
      latestVersion.contentSnapshot as unknown as ResumeContentSnapshot
    );
  }

  async archiveResume(userId: string, resumeId: string): Promise<boolean> {
    const result = await this.prisma.resume.updateMany({
      where: { id: resumeId, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  }

  async createVersion(
    userId: string,
    resumeId: string,
    contentSnapshot: ResumeContentSnapshot,
    summaryDiff?: string
  ): Promise<ResumeVersion | null> {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume) return null;

    const nextVersionNumber =
      resume.versions.length > 0
        ? Math.max(...resume.versions.map((v) => v.versionNumber)) + 1
        : 1;

    return this.prisma.resumeVersion.create({
      data: {
        resumeId,
        versionNumber: nextVersionNumber,
        contentSnapshot: contentSnapshot as any,
        summaryDiff,
      },
    });
  }

  async getLatestVersion(userId: string, resumeId: string): Promise<ResumeVersion | null> {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume || resume.versions.length === 0) return null;
    return resume.versions[0]!;
  }

  async getVersionByNumber(
    userId: string,
    resumeId: string,
    versionNumber: number
  ): Promise<ResumeVersion | null> {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume) return null;

    return (
      this.prisma.resumeVersion.findFirst({
        where: { resumeId, versionNumber },
      })
    );
  }
}

export class InMemoryResumesRepository implements IResumesRepository {
  private resumes: Map<string, Resume> = new Map();
  private versions: Map<string, ResumeVersion[]> = new Map();

  async listResumes(userId: string): Promise<Resume[]> {
    return Array.from(this.resumes.values())
      .filter((r) => r.userId === userId && !r.deletedAt)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getResumeById(userId: string, resumeId: string): Promise<FullResume | null> {
    const resume = this.resumes.get(resumeId);
    if (!resume || resume.userId !== userId || resume.deletedAt) return null;

    const vList = this.versions.get(resumeId) || [];
    const sortedVersions = [...vList].sort((a, b) => b.versionNumber - a.versionNumber);

    return {
      ...resume,
      versions: sortedVersions,
    };
  }

  async createResume(
    userId: string,
    title: string,
    templateName: string,
    initialContent: ResumeContentSnapshot
  ): Promise<FullResume> {
    const resumeId = `res_${crypto.randomUUID()}`;
    const resume: Resume = {
      id: resumeId,
      userId,
      title,
      templateName,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const firstVersion: ResumeVersion = {
      id: `ver_${crypto.randomUUID()}`,
      resumeId,
      versionNumber: 1,
      contentSnapshot: initialContent as any,
      summaryDiff: 'Initial creation',
      createdAt: new Date(),
    };

    this.resumes.set(resumeId, resume);
    this.versions.set(resumeId, [firstVersion]);

    return {
      ...resume,
      versions: [firstVersion],
    };
  }

  async updateResume(
    userId: string,
    resumeId: string,
    data: { title?: string; templateName?: string }
  ): Promise<Resume | null> {
    const resume = this.resumes.get(resumeId);
    if (!resume || resume.userId !== userId || resume.deletedAt) return null;

    if (data.title) resume.title = data.title;
    if (data.templateName) resume.templateName = data.templateName;
    resume.updatedAt = new Date();

    return resume;
  }

  async duplicateResume(userId: string, resumeId: string): Promise<FullResume | null> {
    const original = await this.getResumeById(userId, resumeId);
    if (!original || original.versions.length === 0) return null;

    const latest = original.versions[0]!;
    return this.createResume(
      userId,
      `${original.title} (Copy)`,
      original.templateName,
      latest.contentSnapshot as unknown as ResumeContentSnapshot
    );
  }

  async archiveResume(userId: string, resumeId: string): Promise<boolean> {
    const resume = this.resumes.get(resumeId);
    if (!resume || resume.userId !== userId || resume.deletedAt) return false;

    resume.deletedAt = new Date();
    return true;
  }

  async createVersion(
    userId: string,
    resumeId: string,
    contentSnapshot: ResumeContentSnapshot,
    summaryDiff?: string
  ): Promise<ResumeVersion | null> {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume) return null;

    const vList = this.versions.get(resumeId) || [];
    const nextVersionNumber = vList.length > 0 ? Math.max(...vList.map((v) => v.versionNumber)) + 1 : 1;

    const newVersion: ResumeVersion = {
      id: `ver_${crypto.randomUUID()}`,
      resumeId,
      versionNumber: nextVersionNumber,
      contentSnapshot: contentSnapshot as any,
      summaryDiff: summaryDiff || null,
      createdAt: new Date(),
    };

    vList.push(newVersion);
    this.versions.set(resumeId, vList);

    // Update resume's updatedAt timestamp
    const r = this.resumes.get(resumeId)!;
    r.updatedAt = new Date();

    return newVersion;
  }

  async getLatestVersion(userId: string, resumeId: string): Promise<ResumeVersion | null> {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume || resume.versions.length === 0) return null;
    return resume.versions[0]!;
  }

  async getVersionByNumber(
    userId: string,
    resumeId: string,
    versionNumber: number
  ): Promise<ResumeVersion | null> {
    const resume = await this.getResumeById(userId, resumeId);
    if (!resume) return null;
    return resume.versions.find((v) => v.versionNumber === versionNumber) || null;
  }
}
