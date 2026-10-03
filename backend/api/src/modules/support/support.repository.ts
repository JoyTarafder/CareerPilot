import { PrismaClient } from '@prisma/client';
import { SupportAccessGrantResponse } from '@careerpilot/contracts';

export interface ISupportRepository {
  grantAccess(
    userId: string,
    candidateEmail: string,
    reason: string,
    durationHours: number
  ): Promise<SupportAccessGrantResponse>;
  getActiveGrant(userId: string): Promise<SupportAccessGrantResponse | null>;
  revokeGrant(userId: string): Promise<boolean>;
  listActiveGrants(): Promise<SupportAccessGrantResponse[]>;
}

export class PrismaSupportRepository implements ISupportRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async grantAccess(
    userId: string,
    candidateEmail: string,
    reason: string,
    durationHours: number
  ): Promise<SupportAccessGrantResponse> {
    const grantedAt = new Date();
    const expiresAt = new Date(grantedAt.getTime() + durationHours * 60 * 60 * 1000);

    const event = await this.prisma.auditEvent.create({
      data: {
        userId,
        action: 'SUPPORT_ACCESS_GRANTED',
        targetType: 'SUPPORT_ACCESS',
        metadata: {
          candidateEmail,
          reason,
          durationHours,
          grantedAt: grantedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      },
    });

    return {
      id: event.id,
      userId,
      candidateEmail,
      reason,
      grantedAt: grantedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      revokedAt: null,
      isActive: true,
    };
  }

  async getActiveGrant(userId: string): Promise<SupportAccessGrantResponse | null> {
    const now = new Date();

    const [latestGrant, latestRevocation] = await Promise.all([
      this.prisma.auditEvent.findFirst({
        where: {
          userId,
          action: 'SUPPORT_ACCESS_GRANTED',
          targetType: 'SUPPORT_ACCESS',
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditEvent.findFirst({
        where: {
          userId,
          action: 'SUPPORT_ACCESS_REVOKED',
          targetType: 'SUPPORT_ACCESS',
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!latestGrant || !latestGrant.metadata) return null;

    // Check if revoked after granted
    if (latestRevocation && latestRevocation.createdAt > latestGrant.createdAt) {
      return null;
    }

    const meta = latestGrant.metadata as any;
    const expiresAt = new Date(meta.expiresAt);
    if (expiresAt <= now) {
      return null;
    }

    return {
      id: latestGrant.id,
      userId,
      candidateEmail: meta.candidateEmail || 'candidate@careerpilot.dev',
      reason: meta.reason || 'Support assistance',
      grantedAt: meta.grantedAt || latestGrant.createdAt.toISOString(),
      expiresAt: meta.expiresAt,
      revokedAt: null,
      isActive: true,
    };
  }

  async revokeGrant(userId: string): Promise<boolean> {
    const active = await this.getActiveGrant(userId);
    if (!active) return false;

    await this.prisma.auditEvent.create({
      data: {
        userId,
        action: 'SUPPORT_ACCESS_REVOKED',
        targetType: 'SUPPORT_ACCESS',
        metadata: { revokedGrantId: active.id },
      },
    });

    return true;
  }

  async listActiveGrants(): Promise<SupportAccessGrantResponse[]> {
    const grants = await this.prisma.auditEvent.findMany({
      where: {
        action: 'SUPPORT_ACCESS_GRANTED',
        targetType: 'SUPPORT_ACCESS',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const activeList: SupportAccessGrantResponse[] = [];
    for (const g of grants) {
      if (!g.userId) continue;
      const active = await this.getActiveGrant(g.userId);
      if (active && active.id === g.id) {
        activeList.push(active);
      }
    }

    return activeList;
  }
}

export class InMemorySupportRepository implements ISupportRepository {
  private grants = new Map<string, SupportAccessGrantResponse>();

  async grantAccess(
    userId: string,
    candidateEmail: string,
    reason: string,
    durationHours: number
  ): Promise<SupportAccessGrantResponse> {
    const grantedAt = new Date();
    const expiresAt = new Date(grantedAt.getTime() + durationHours * 60 * 60 * 1000);
    const id = `grant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const grant: SupportAccessGrantResponse = {
      id,
      userId,
      candidateEmail,
      reason,
      grantedAt: grantedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      revokedAt: null,
      isActive: true,
    };

    this.grants.set(userId, grant);
    return grant;
  }

  async getActiveGrant(userId: string): Promise<SupportAccessGrantResponse | null> {
    const grant = this.grants.get(userId);
    if (!grant) return null;

    const now = new Date();
    if (grant.revokedAt || new Date(grant.expiresAt) <= now) {
      return null;
    }

    return { ...grant, isActive: true };
  }

  async revokeGrant(userId: string): Promise<boolean> {
    const grant = this.grants.get(userId);
    if (!grant || grant.revokedAt) return false;

    grant.revokedAt = new Date().toISOString();
    grant.isActive = false;
    this.grants.set(userId, grant);
    return true;
  }

  async listActiveGrants(): Promise<SupportAccessGrantResponse[]> {
    const now = new Date();
    const results: SupportAccessGrantResponse[] = [];
    for (const g of this.grants.values()) {
      if (!g.revokedAt && new Date(g.expiresAt) > now) {
        results.push({ ...g, isActive: true });
      }
    }
    return results;
  }
}
