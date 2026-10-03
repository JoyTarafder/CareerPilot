import {
  IProfilesRepository,
  UpdateProfileData,
  EducationData,
  ExperienceData,
  ProjectData,
  FullProfileResult,
} from './profiles.repository.js';
import { NotFoundError } from '../../core/errors.js';

export class ProfilesService {
  constructor(private readonly profilesRepo: IProfilesRepository) {}

  async getProfile(userId: string): Promise<FullProfileResult> {
    const profile = await this.profilesRepo.getProfileByUserId(userId);
    if (!profile) {
      // If profile does not exist yet, initialize it
      await this.profilesRepo.updateProfile(userId, {});
      return (await this.profilesRepo.getProfileByUserId(userId))!;
    }
    return profile;
  }

  async updateProfile(userId: string, data: UpdateProfileData) {
    return this.profilesRepo.updateProfile(userId, data);
  }

  async addEducation(userId: string, data: EducationData) {
    return this.profilesRepo.addEducation(userId, data);
  }

  async deleteEducation(userId: string, educationId: string) {
    const success = await this.profilesRepo.deleteEducation(userId, educationId);
    if (!success) {
      throw new NotFoundError('Education record not found or not owned by user');
    }
  }

  async addExperience(userId: string, data: ExperienceData) {
    return this.profilesRepo.addExperience(userId, data);
  }

  async deleteExperience(userId: string, experienceId: string) {
    const success = await this.profilesRepo.deleteExperience(userId, experienceId);
    if (!success) {
      throw new NotFoundError('Experience record not found or not owned by user');
    }
  }

  async addProject(userId: string, data: ProjectData) {
    return this.profilesRepo.addProject(userId, data);
  }

  async deleteProject(userId: string, projectId: string) {
    const success = await this.profilesRepo.deleteProject(userId, projectId);
    if (!success) {
      throw new NotFoundError('Project record not found or not owned by user');
    }
  }
}
