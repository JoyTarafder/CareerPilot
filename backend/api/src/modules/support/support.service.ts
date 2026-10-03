import {
  GrantSupportAccessRequest,
  GrantSupportAccessRequestSchema,
  SupportAccessGrantResponse,
  SupportAccessVerificationResult,
} from '@careerpilot/contracts';
import { ISupportRepository } from './support.repository.js';
import { ValidationError } from '../../core/errors.js';

export class SupportService {
  constructor(private readonly repo: ISupportRepository) {}

  async grantAccess(
    userId: string,
    candidateEmail: string,
    rawRequest: GrantSupportAccessRequest
  ): Promise<SupportAccessGrantResponse> {
    const parsed = GrantSupportAccessRequestSchema.safeParse(rawRequest);
    if (!parsed.success) {
      throw new ValidationError('Invalid support access grant request', parsed.error.flatten().fieldErrors);
    }

    const { reason, durationHours } = parsed.data;
    return this.repo.grantAccess(userId, candidateEmail, reason, durationHours);
  }

  async revokeAccess(userId: string): Promise<{ success: boolean; message: string }> {
    const revoked = await this.repo.revokeGrant(userId);
    return {
      success: revoked,
      message: revoked ? 'Support access has been revoked.' : 'No active support access grant found to revoke.',
    };
  }

  async getActiveGrant(userId: string): Promise<SupportAccessGrantResponse | null> {
    return this.repo.getActiveGrant(userId);
  }

  async verifyAdminSupportAccess(candidateUserId: string): Promise<SupportAccessVerificationResult> {
    const grant = await this.repo.getActiveGrant(candidateUserId);
    if (!grant) {
      return {
        hasActiveGrant: false,
        grant: null,
        message: 'No active support access grant. Candidate has not approved administrative access.',
      };
    }

    return {
      hasActiveGrant: true,
      grant,
      message: `Active support access granted until ${grant.expiresAt} for reason: "${grant.reason}".`,
    };
  }

  async listActiveGrants(): Promise<SupportAccessGrantResponse[]> {
    return this.repo.listActiveGrants();
  }
}
