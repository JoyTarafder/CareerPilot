import { IJobsRepository } from './jobs.repository.js';
import { IJobExtractionService, GeminiExtractionAdapter } from '../ai/gemini.adapter.js';
import { CreateJobRequest, UpdateJobRequirementsRequest } from '@careerpilot/contracts';
import { NotFoundError } from '../../core/errors.js';
import { JobDescription } from '@prisma/client';

export class JobsService {
  constructor(
    private readonly jobsRepo: IJobsRepository,
    private readonly extractor: IJobExtractionService = new GeminiExtractionAdapter()
  ) {}

  async listJobs(userId: string): Promise<JobDescription[]> {
    return this.jobsRepo.listJobs(userId);
  }

  async getJob(userId: string, jobId: string): Promise<JobDescription> {
    const job = await this.jobsRepo.getJobById(userId, jobId);
    if (!job) {
      throw new NotFoundError('Job description not found');
    }
    return job;
  }

  async createJob(userId: string, dto: CreateJobRequest): Promise<JobDescription> {
    // 1. Extract structured requirements (using AI or resilient fallback)
    const extractedData = await this.extractor.extractRequirements(
      dto.title,
      dto.rawContent,
      dto.company
    );

    // 2. Persist with ownership
    return this.jobsRepo.createJob(userId, {
      title: dto.title,
      company: dto.company,
      rawContent: dto.rawContent,
      extractedData,
    });
  }

  async updateRequirements(
    userId: string,
    jobId: string,
    dto: UpdateJobRequirementsRequest
  ): Promise<JobDescription> {
    const updated = await this.jobsRepo.updateJob(userId, jobId, dto);
    if (!updated) {
      throw new NotFoundError('Job description not found');
    }
    return updated;
  }

  async deleteJob(userId: string, jobId: string): Promise<void> {
    const success = await this.jobsRepo.deleteJob(userId, jobId);
    if (!success) {
      throw new NotFoundError('Job description not found');
    }
  }
}
