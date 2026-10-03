import { PrismaClient, User, RefreshSession, Role } from '@prisma/client';
import { config } from '../../config/index.js';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  role?: Role;
  isEmailVerified?: boolean;
}

export interface CreateSessionData {
  userId: string;
  tokenFamilyId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface AuditEventData {
  userId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  createRefreshSession(data: CreateSessionData): Promise<RefreshSession>;
  findRefreshSessionByHash(tokenHash: string): Promise<RefreshSession | null>;
  revokeSession(id: string): Promise<void>;
  revokeSessionFamily(tokenFamilyId: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;
  countAdmins(): Promise<number>;
  createAuditEvent(data: AuditEventData): Promise<void>;
}

export class PrismaAuthRepository implements IAuthRepository {
  private prisma: PrismaClient;
  private fallbackMemoryRepo?: InMemoryAuthRepository;
  private isUsingFallback = false;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  private getFallbackRepo(): InMemoryAuthRepository {
    if (!this.fallbackMemoryRepo) {
      console.warn(
        '[careerpilot-api] Database connection unavailable at localhost:5432. Activating in-memory auth fallback for local development.'
      );
      this.fallbackMemoryRepo = new InMemoryAuthRepository(true);
      this.isUsingFallback = true;
    }
    return this.fallbackMemoryRepo;
  }

  private isDbConnectionError(err: unknown): boolean {
    const error = err as { code?: string; message?: string; name?: string };
    return (
      error?.code === 'P1001' ||
      error?.name === 'PrismaClientInitializationError' ||
      Boolean(error?.message?.includes("Can't reach database server")) ||
      Boolean(error?.message?.includes('connect ECONNREFUSED'))
    );
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (this.isUsingFallback) {
      return this.getFallbackRepo().findUserByEmail(email);
    }
    try {
      return await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (err) {
      if (config.NODE_ENV === 'development' && this.isDbConnectionError(err)) {
        return this.getFallbackRepo().findUserByEmail(email);
      }
      throw err;
    }
  }

  async findUserById(id: string): Promise<User | null> {
    if (this.isUsingFallback) {
      return this.getFallbackRepo().findUserById(id);
    }
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (err) {
      if (config.NODE_ENV === 'development' && this.isDbConnectionError(err)) {
        return this.getFallbackRepo().findUserById(id);
      }
      throw err;
    }
  }

  async createUser(data: CreateUserData): Promise<User> {
    if (this.isUsingFallback) {
      return this.getFallbackRepo().createUser(data);
    }
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash: data.passwordHash,
          fullName: data.fullName.trim(),
          role: data.role || Role.CANDIDATE,
          isEmailVerified: data.isEmailVerified || false,
          profile: {
            create: {},
          },
        },
      });
    } catch (err) {
      if (config.NODE_ENV === 'development' && this.isDbConnectionError(err)) {
        return this.getFallbackRepo().createUser(data);
      }
      throw err;
    }
  }

  async createRefreshSession(data: CreateSessionData): Promise<RefreshSession> {
    if (this.isUsingFallback) {
      return this.getFallbackRepo().createRefreshSession(data);
    }
    try {
      return await this.prisma.refreshSession.create({
        data: {
          userId: data.userId,
          tokenFamilyId: data.tokenFamilyId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
        },
      });
    } catch (err) {
      if (config.NODE_ENV === 'development' && this.isDbConnectionError(err)) {
        return this.getFallbackRepo().createRefreshSession(data);
      }
      throw err;
    }
  }

  async findRefreshSessionByHash(tokenHash: string): Promise<RefreshSession | null> {
    if (this.isUsingFallback) {
      return this.getFallbackRepo().findRefreshSessionByHash(tokenHash);
    }
    try {
      return await this.prisma.refreshSession.findFirst({
        where: { tokenHash },
      });
    } catch (err) {
      if (config.NODE_ENV === 'development' && this.isDbConnectionError(err)) {
        return this.getFallbackRepo().findRefreshSessionByHash(tokenHash);
      }
      throw err;
    }
  }

  async revokeSession(id: string): Promise<void> {
    if (this.isUsingFallback) {
      return this.getFallbackRepo().revokeSession(id);
    }
    try {
      await this.prisma.refreshSession.update({
        where: { id },
        data: { isRevoked: true },
      });
    } catch (err) {
      if (config.NODE_ENV === 'development' && this.isDbConnectionError(err)) {
        return this.getFallbackRepo().revokeSession(id);
      }
      throw err;
    }
  }

  async revokeSessionFamily(tokenFamilyId: string): Promise<void> {
    if (this.isUsingFallback) {
      return this.getFallbackRepo().revokeSessionFamily(tokenFamilyId);
    }
    try {
      await this.prisma.refreshSession.updateMany({
        where: { tokenFamilyId },
        data: { isRevoked: true },
      });
    } catch (err) {
      if (config.NODE_ENV === 'development' && this.isDbConnectionError(err)) {
        return this.getFallbackRepo().revokeSessionFamily(tokenFamilyId);
      }
      throw err;
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    if (this.isUsingFallback) {
      return this.getFallbackRepo().revokeAllUserSessions(userId);
    }
    try {
      await this.prisma.refreshSession.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    } catch (err) {
      if (config.NODE_ENV === 'development' && this.isDbConnectionError(err)) {
        return this.getFallbackRepo().revokeAllUserSessions(userId);
      }
      throw err;
    }
  }

  async countAdmins(): Promise<number> {
    if (this.isUsingFallback) {
      return this.getFallbackRepo().countAdmins();
    }
    try {
      return await this.prisma.user.count({
        where: {
          role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
        },
      });
    } catch (err) {
      if (config.NODE_ENV === 'development' && this.isDbConnectionError(err)) {
        return this.getFallbackRepo().countAdmins();
      }
      throw err;
    }
  }

  async createAuditEvent(data: AuditEventData): Promise<void> {
    if (this.isUsingFallback) {
      return this.getFallbackRepo().createAuditEvent(data);
    }
    try {
      await this.prisma.auditEvent.create({
        data: {
          userId: data.userId,
          action: data.action,
          targetType: data.targetType,
          targetId: data.targetId,
          metadata: data.metadata ? (data.metadata as any) : undefined,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (err) {
      if (config.NODE_ENV === 'development' && this.isDbConnectionError(err)) {
        return this.getFallbackRepo().createAuditEvent(data);
      }
      throw err;
    }
  }
}

export class InMemoryAuthRepository implements IAuthRepository {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, RefreshSession> = new Map();
  public auditEvents: AuditEventData[] = [];

  constructor(seedDemo = false) {
    if (seedDemo) {
      this.seedDemoCandidate();
    }
  }

  private seedDemoCandidate(): void {
    const demoUser: User = {
      id: 'usr_demo_candidate',
      email: 'candidate@careerpilot.dev',
      // Argon2id hash for 'Password123!Safe' with default 'dev-pepper-secret'
      passwordHash: '$argon2id$v=19$m=65536,p=1,t=3$OqSwWbWPtf0MuW66cYdPDA$FJLoQ7usvvcoauxmWm+5tH5tUYgC/Slz130MaOydiLc',
      fullName: 'Demo Candidate',
      role: Role.CANDIDATE,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    this.users.set(demoUser.id, demoUser);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email === normalized) return user;
    }
    return null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const user: User = {
      id: `usr_${crypto.randomUUID()}`,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      fullName: data.fullName.trim(),
      role: data.role || Role.CANDIDATE,
      isEmailVerified: data.isEmailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    this.users.set(user.id, user);
    return user;
  }

  async createRefreshSession(data: CreateSessionData): Promise<RefreshSession> {
    const session: RefreshSession = {
      id: `ses_${crypto.randomUUID()}`,
      userId: data.userId,
      tokenFamilyId: data.tokenFamilyId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      isRevoked: false,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async findRefreshSessionByHash(tokenHash: string): Promise<RefreshSession | null> {
    for (const session of this.sessions.values()) {
      if (session.tokenHash === tokenHash) return session;
    }
    return null;
  }

  async revokeSession(id: string): Promise<void> {
    const s = this.sessions.get(id);
    if (s) {
      s.isRevoked = true;
    }
  }

  async revokeSessionFamily(tokenFamilyId: string): Promise<void> {
    for (const s of this.sessions.values()) {
      if (s.tokenFamilyId === tokenFamilyId) {
        s.isRevoked = true;
      }
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    for (const s of this.sessions.values()) {
      if (s.userId === userId) {
        s.isRevoked = true;
      }
    }
  }

  async countAdmins(): Promise<number> {
    let count = 0;
    for (const u of this.users.values()) {
      if (u.role === Role.ADMIN || u.role === Role.SUPER_ADMIN) count++;
    }
    return count;
  }

  async createAuditEvent(data: AuditEventData): Promise<void> {
    this.auditEvents.push(data);
  }
}
