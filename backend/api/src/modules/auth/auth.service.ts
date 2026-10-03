import { IAuthRepository } from './auth.repository.js';
import { PasswordService, defaultPasswordService } from './password.service.js';
import { TokenService, defaultTokenService } from './token.service.js';
import { RegisterRequest, LoginRequest } from '@careerpilot/contracts';
import { ValidationError, UnauthorizedError } from '../../core/errors.js';
import { User, Role } from '@prisma/client';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export class AuthService {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly passwordService: PasswordService = defaultPasswordService,
    private readonly tokenService: TokenService = defaultTokenService
  ) {}

  /**
   * Registers a new candidate user, hashes password with Argon2id + pepper,
   * and creates an initial refresh session.
   */
  async register(dto: RegisterRequest, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    const existing = await this.authRepo.findUserByEmail(dto.email);
    if (existing) {
      throw new ValidationError('An account with this email address already exists');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.authRepo.createUser({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      role: Role.CANDIDATE,
      isEmailVerified: false,
    });

    await this.authRepo.createAuditEvent({
      userId: user.id,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: user.id,
      ipAddress,
      userAgent,
    });

    return this.createAuthSession(user);
  }

  /**
   * Authenticates user credentials in constant time and returns a session.
   */
  async login(
    dto: LoginRequest,
    ipAddress?: string,
    userAgent?: string,
    requireAdminRole = false
  ): Promise<AuthResult> {
    const user = await this.authRepo.findUserByEmail(dto.email);
    if (!user || user.deletedAt) {
      // Use generic error to avoid user enumeration
      throw new UnauthorizedError('Invalid email or password');
    }

    if (requireAdminRole && user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await this.passwordService.verify(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await this.authRepo.createAuditEvent({
      userId: user.id,
      action: requireAdminRole ? 'ADMIN_LOGIN_SUCCESS' : 'USER_LOGIN_SUCCESS',
      targetType: 'User',
      targetId: user.id,
      ipAddress,
      userAgent,
    });

    return this.createAuthSession(user);
  }

  /**
   * Rotates a refresh token with automatic replay-attack detection per SECURITY.md §5.
   */
  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const session = await this.authRepo.findRefreshSessionByHash(tokenHash);

    if (!session) {
      throw new UnauthorizedError('Session not found or expired');
    }

    // REPLAY ATTACK DETECTION:
    // If the token presented was already revoked, an attacker or compromised client
    // is attempting to reuse an old refresh token!
    if (session.isRevoked) {
      // Revoke the entire token family immediately
      await this.authRepo.revokeSessionFamily(session.tokenFamilyId);

      await this.authRepo.createAuditEvent({
        userId: session.userId,
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        targetType: 'RefreshSession',
        targetId: session.id,
        metadata: { tokenFamilyId: session.tokenFamilyId },
        ipAddress,
        userAgent,
      });

      throw new UnauthorizedError('Session compromised due to reuse detection. Please sign in again.');
    }

    if (new Date() > session.expiresAt) {
      await this.authRepo.revokeSession(session.id);
      throw new UnauthorizedError('Refresh token expired');
    }

    // Normal rotation: Revoke current session, create new session in same family
    await this.authRepo.revokeSession(session.id);

    const user = await this.authRepo.findUserById(session.userId);
    if (!user || user.deletedAt) {
      throw new UnauthorizedError('User account not found or suspended');
    }

    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newSessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const newSession = await this.authRepo.createRefreshSession({
      userId: user.id,
      tokenFamilyId: session.tokenFamilyId, // preserve family
      tokenHash: this.tokenService.hashRefreshToken(newRefreshToken),
      expiresAt: newSessionExpiresAt,
    });

    const { token: accessToken, expiresInSeconds } = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: newSession.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken: newRefreshToken,
      expiresInSeconds,
    };
  }

  /**
   * Logs out a session by revoking the refresh token.
   */
  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const session = await this.authRepo.findRefreshSessionByHash(tokenHash);
    if (session) {
      await this.authRepo.revokeSession(session.id);
    }
  }

  /**
   * Revokes all active refresh sessions for a user across all devices.
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await this.authRepo.revokeAllUserSessions(userId);
  }

  private async createAuthSession(user: User): Promise<AuthResult> {
    const rawRefreshToken = this.tokenService.generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const tokenFamilyId = `fam_${crypto.randomUUID()}`;

    const session = await this.authRepo.createRefreshSession({
      userId: user.id,
      tokenFamilyId,
      tokenHash: this.tokenService.hashRefreshToken(rawRefreshToken),
      expiresAt,
    });

    const { token: accessToken, expiresInSeconds } = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken: rawRefreshToken,
      expiresInSeconds,
    };
  }
}
