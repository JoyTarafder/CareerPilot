import { z } from 'zod';

export const CandidatePasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(30, 'Password must be at most 30 characters');

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: CandidatePasswordSchema,
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(100),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    role: z.enum(['CANDIDATE', 'ADMIN', 'SUPER_ADMIN']),
    isEmailVerified: z.boolean(),
  }),
  accessToken: z.string(),
  expiresIn: z.number(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
