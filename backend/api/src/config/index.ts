import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('4000'),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/careerpilot_dev?schema=public'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters').default('development-access-secret-min-16-chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('10m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  PASSWORD_PEPPER_V1: z.string().min(8, 'PASSWORD_PEPPER_V1 is required').default('dev-pepper-secret'),
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3001'),
});

export const config = EnvironmentSchema.parse(process.env);
