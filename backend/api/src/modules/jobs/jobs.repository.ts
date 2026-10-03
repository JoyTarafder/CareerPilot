import { PrismaClient, JobDescription } from '@prisma/client';
import { ExtractedJobRequirements } from '@careerpilot/contracts';

export interface CreateJobData {
  title: string;
  company?: string;
  rawContent: string;
  extractedData?: ExtractedJobRequirements;
}

export interface UpdateJobData {
  title?: string;
  company?: string;
  extractedData?: ExtractedJobRequirements;
}

export interface IJobsRepository {
  listJobs(userId: string): Promise<JobDescription[]>;
  getJobById(userId: string, jobId: string): Promise<JobDescription | null>;
  createJob(userId: string, data: CreateJobData): Promise<JobDescription>;
  updateJob(userId: string, jobId: string, data: UpdateJobData): Promise<JobDescription | null>;
  deleteJob(userId: string, jobId: string): Promise<boolean>;
}

export class PrismaJobsRepository implements IJobsRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async listJobs(userId: string): Promise<JobDescription[]> {
    return this.prisma.jobDescription.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getJobById(userId: string, jobId: string): Promise<JobDescription | null> {
    return this.prisma.jobDescription.findFirst({
      where: { id: jobId, userId },
    });
  }

  async createJob(userId: string, data: CreateJobData): Promise<JobDescription> {
    return this.prisma.jobDescription.create({
      data: {
        userId,
        title: data.title,
        company: data.company,
        rawContent: data.rawContent,
        extractedData: data.extractedData as any,
      },
    });
  }

  async updateJob(userId: string, jobId: string, data: UpdateJobData): Promise<JobDescription | null> {
    const job = await this.prisma.jobDescription.findFirst({
      where: { id: jobId, userId },
    });
    if (!job) return null;

    return this.prisma.jobDescription.update({
      where: { id: jobId },
      data: {
        title: data.title,
        company: data.company,
        extractedData: data.extractedData ? (data.extractedData as any) : undefined,
      },
    });
  }

  async deleteJob(userId: string, jobId: string): Promise<boolean> {
    const result = await this.prisma.jobDescription.deleteMany({
      where: { id: jobId, userId },
    });
    return result.count > 0;
  }
}

export class InMemoryJobsRepository implements IJobsRepository {
  private jobs: Map<string, JobDescription> = new Map();

  async listJobs(userId: string): Promise<JobDescription[]> {
    return Array.from(this.jobs.values())
      .filter((j) => j.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getJobById(userId: string, jobId: string): Promise<JobDescription | null> {
    const job = this.jobs.get(jobId);
    if (!job || job.userId !== userId) return null;
    return job;
  }

  async createJob(userId: string, data: CreateJobData): Promise<JobDescription> {
    const id = `job_${crypto.randomUUID()}`;
    const job: JobDescription = {
      id,
      userId,
      title: data.title,
      company: data.company || null,
      rawContent: data.rawContent,
      extractedData: (data.extractedData as any) || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(userId: string, jobId: string, data: UpdateJobData): Promise<JobDescription | null> {
    const job = this.jobs.get(jobId);
    if (!job || job.userId !== userId) return null;

    if (data.title) job.title = data.title;
    if (data.company !== undefined) job.company = data.company || null;
    if (data.extractedData) job.extractedData = data.extractedData as any;
    job.updatedAt = new Date();

    return job;
  }

  async deleteJob(userId: string, jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.userId !== userId) return false;
    return this.jobs.delete(jobId);
  }
}
