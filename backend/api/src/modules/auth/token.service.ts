import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../../config/index.js';
import { UnauthorizedError } from '../../core/errors.js';

export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
  role: 'CANDIDATE' | 'ADMIN' | 'SUPER_ADMIN';
  sessionId?: string;
}

export class TokenService {
  private readonly jwtSecret: string;
  private readonly accessExpiresIn: string;

  constructor(secret = config.JWT_ACCESS_SECRET, expiresIn = config.JWT_ACCESS_EXPIRES_IN) {
    this.jwtSecret = secret;
    this.accessExpiresIn = expiresIn;
  }

  /**
   * Signs a short-lived access JWT containing minimal non-sensitive claims.
   */
  signAccessToken(payload: AccessTokenPayload): { token: string; expiresInSeconds: number } {
    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessExpiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    });

    // 10 minutes in seconds
    return { token, expiresInSeconds: 600 };
  }

  /**
   * Verifies the authenticity and expiration of an access JWT.
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      }) as AccessTokenPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  /**
   * Generates a cryptographically strong, high-entropy 64-byte opaque refresh token.
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Hashes a refresh token with SHA-256 before persisting in the database.
   * Plaintext refresh tokens are NEVER stored in the database.
   */
  hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const defaultTokenService = new TokenService();
