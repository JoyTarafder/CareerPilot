import { PrismaClient, CareerProfile, Education, Experience, Project } from '@prisma/client';

export interface UpdateProfileData {
  headline?: string;
  summary?: string;
  targetRoles?: string[];
  phoneNumber?: string;
  location?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface EducationData {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  isCurrent?: boolean;
  grade?: string;
  description?: string;
  displayOrder?: number;
}

export interface ExperienceData {
  company: string;
  role: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent?: boolean;
  description?: string;
  highlights?: string[];
  displayOrder?: number;
}

export interface ProjectData {
  title: string;
  description?: string;
  url?: string;
  technologies?: string[];
  displayOrder?: number;
}

export interface FullProfileResult extends CareerProfile {
  educations: Education[];
  experiences: Experience[];
  projects: Project[];
  profileSkills: Array<{
    id: string;
    proficiency: string | null;
    yearsOfExp: number | null;
    skill: { id: string; name: string; category: string | null };
  }>;
}

export interface IProfilesRepository {
  getProfileByUserId(userId: string): Promise<FullProfileResult | null>;
  updateProfile(userId: string, data: UpdateProfileData): Promise<CareerProfile>;
  addEducation(userId: string, data: EducationData): Promise<Education>;
  deleteEducation(userId: string, educationId: string): Promise<boolean>;
  addExperience(userId: string, data: ExperienceData): Promise<Experience>;
  deleteExperience(userId: string, experienceId: string): Promise<boolean>;
  addProject(userId: string, data: ProjectData): Promise<Project>;
  deleteProject(userId: string, projectId: string): Promise<boolean>;
}

export class PrismaProfilesRepository implements IProfilesRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async getProfileByUserId(userId: string): Promise<FullProfileResult | null> {
    return this.prisma.careerProfile.findUnique({
      where: { userId },
      include: {
        educations: { orderBy: { displayOrder: 'asc' } },
        experiences: { orderBy: { displayOrder: 'asc' } },
        projects: { orderBy: { displayOrder: 'asc' } },
        profileSkills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<CareerProfile> {
    return this.prisma.careerProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
  }

  async addEducation(userId: string, data: EducationData): Promise<Education> {
    const profile = await this.prisma.careerProfile.findUniqueOrThrow({
      where: { userId },
    });

    return this.prisma.education.create({
      data: {
        profileId: profile.id,
        ...data,
      },
    });
  }

  async deleteEducation(userId: string, educationId: string): Promise<boolean> {
    const profile = await this.prisma.careerProfile.findUnique({
      where: { userId },
    });
    if (!profile) return false;

    // Enforce ownership: profileId MUST match the authenticated user's profile
    const result = await this.prisma.education.deleteMany({
      where: {
        id: educationId,
        profileId: profile.id,
      },
    });

    return result.count > 0;
  }

  async addExperience(userId: string, data: ExperienceData): Promise<Experience> {
    const profile = await this.prisma.careerProfile.findUniqueOrThrow({
      where: { userId },
    });

    return this.prisma.experience.create({
      data: {
        profileId: profile.id,
        ...data,
      },
    });
  }

  async deleteExperience(userId: string, experienceId: string): Promise<boolean> {
    const profile = await this.prisma.careerProfile.findUnique({
      where: { userId },
    });
    if (!profile) return false;

    const result = await this.prisma.experience.deleteMany({
      where: {
        id: experienceId,
        profileId: profile.id,
      },
    });

    return result.count > 0;
  }

  async addProject(userId: string, data: ProjectData): Promise<Project> {
    const profile = await this.prisma.careerProfile.findUniqueOrThrow({
      where: { userId },
    });

    return this.prisma.project.create({
      data: {
        profileId: profile.id,
        ...data,
      },
    });
  }

  async deleteProject(userId: string, projectId: string): Promise<boolean> {
    const profile = await this.prisma.careerProfile.findUnique({
      where: { userId },
    });
    if (!profile) return false;

    const result = await this.prisma.project.deleteMany({
      where: {
        id: projectId,
        profileId: profile.id,
      },
    });

    return result.count > 0;
  }
}

export class InMemoryProfilesRepository implements IProfilesRepository {
  private profiles: Map<string, FullProfileResult> = new Map();

  async getProfileByUserId(userId: string): Promise<FullProfileResult | null> {
    return this.profiles.get(userId) || null;
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<CareerProfile> {
    let profile = this.profiles.get(userId);
    if (!profile) {
      profile = {
        id: `prof_${crypto.randomUUID()}`,
        userId,
        headline: null,
        summary: null,
        targetRoles: [],
        phoneNumber: null,
        location: null,
        portfolioUrl: null,
        githubUrl: null,
        linkedinUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        educations: [],
        experiences: [],
        projects: [],
        profileSkills: [],
      };
    }

    Object.assign(profile, data, { updatedAt: new Date() });
    this.profiles.set(userId, profile);
    return profile;
  }

  async addEducation(userId: string, data: EducationData): Promise<Education> {
    let profile = this.profiles.get(userId);
    if (!profile) {
      await this.updateProfile(userId, {});
      profile = this.profiles.get(userId)!;
    }

    const education: Education = {
      id: `edu_${crypto.randomUUID()}`,
      profileId: profile.id,
      institution: data.institution,
      degree: data.degree,
      fieldOfStudy: data.fieldOfStudy,
      startDate: data.startDate,
      endDate: data.endDate || null,
      isCurrent: data.isCurrent || false,
      grade: data.grade || null,
      description: data.description || null,
      displayOrder: data.displayOrder || 0,
    };

    profile.educations.push(education);
    return education;
  }

  async deleteEducation(userId: string, educationId: string): Promise<boolean> {
    const profile = this.profiles.get(userId);
    if (!profile) return false;

    const index = profile.educations.findIndex((e) => e.id === educationId);
    if (index !== -1) {
      profile.educations.splice(index, 1);
      return true;
    }
    return false;
  }

  async addExperience(userId: string, data: ExperienceData): Promise<Experience> {
    let profile = this.profiles.get(userId);
    if (!profile) {
      await this.updateProfile(userId, {});
      profile = this.profiles.get(userId)!;
    }

    const experience: Experience = {
      id: `exp_${crypto.randomUUID()}`,
      profileId: profile.id,
      company: data.company,
      role: data.role,
      location: data.location || null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      isCurrent: data.isCurrent || false,
      description: data.description || null,
      highlights: data.highlights || [],
      displayOrder: data.displayOrder || 0,
    };

    profile.experiences.push(experience);
    return experience;
  }

  async deleteExperience(userId: string, experienceId: string): Promise<boolean> {
    const profile = this.profiles.get(userId);
    if (!profile) return false;

    const index = profile.experiences.findIndex((e) => e.id === experienceId);
    if (index !== -1) {
      profile.experiences.splice(index, 1);
      return true;
    }
    return false;
  }

  async addProject(userId: string, data: ProjectData): Promise<Project> {
    let profile = this.profiles.get(userId);
    if (!profile) {
      await this.updateProfile(userId, {});
      profile = this.profiles.get(userId)!;
    }

    const project: Project = {
      id: `proj_${crypto.randomUUID()}`,
      profileId: profile.id,
      title: data.title,
      description: data.description || null,
      url: data.url || null,
      technologies: data.technologies || [],
      displayOrder: data.displayOrder || 0,
    };

    profile.projects.push(project);
    return project;
  }

  async deleteProject(userId: string, projectId: string): Promise<boolean> {
    const profile = this.profiles.get(userId);
    if (!profile) return false;

    const index = profile.projects.findIndex((p) => p.id === projectId);
    if (index !== -1) {
      profile.projects.splice(index, 1);
      return true;
    }
    return false;
  }
}
