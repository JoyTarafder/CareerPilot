import { z } from 'zod';

export const GrantSupportAccessRequestSchema = z.object({
  reason: z.string().min(3).max(500).default('Troubleshooting assistance request'),
  durationHours: z.number().int().min(1).max(72).default(24),
});

export type GrantSupportAccessRequest = z.infer<typeof GrantSupportAccessRequestSchema>;

export interface SupportAccessGrantResponse {
  id: string;
  userId: string;
  candidateEmail: string;
  reason: string;
  grantedAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  isActive: boolean;
}

export interface SupportAccessVerificationResult {
  hasActiveGrant: boolean;
  grant?: SupportAccessGrantResponse | null;
  message: string;
}
