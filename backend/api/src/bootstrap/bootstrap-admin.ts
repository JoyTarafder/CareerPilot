import dotenv from 'dotenv';
import { IAuthRepository, PrismaAuthRepository } from '../modules/auth/auth.repository.js';
import { PasswordService, defaultPasswordService } from '../modules/auth/password.service.js';
import { Role } from '@prisma/client';

dotenv.config();

export async function bootstrapAdmin(
  authRepo: IAuthRepository = new PrismaAuthRepository(),
  passwordService: PasswordService = defaultPasswordService
): Promise<{ created: boolean; email?: string; message: string }> {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    return {
      created: false,
      message: 'ADMIN_BOOTSTRAP_EMAIL or ADMIN_BOOTSTRAP_PASSWORD is not set in environment.',
    };
  }

  const existingAdminsCount = await authRepo.countAdmins();
  if (existingAdminsCount > 0) {
    return {
      created: false,
      message: `Admin account already exists (${existingAdminsCount} admin(s) found). Skipping bootstrap.`,
    };
  }

  const existingUser = await authRepo.findUserByEmail(email);
  if (existingUser) {
    return {
      created: false,
      message: `User with email ${email} already exists. Skipping bootstrap.`,
    };
  }

  const passwordHash = await passwordService.hash(password);
  await authRepo.createUser({
    email,
    passwordHash,
    fullName: 'System Administrator',
    role: Role.SUPER_ADMIN,
    isEmailVerified: true,
  });

  await authRepo.createAuditEvent({
    action: 'ADMIN_BOOTSTRAPPED',
    targetType: 'User',
    metadata: { email },
  });

  return {
    created: true,
    email,
    message: `Initial administrator account created for ${email}.`,
  };
}

// CLI execution check
if (process.argv[1]?.includes('bootstrap-admin')) {
  bootstrapAdmin()
    .then((result) => {
      console.log(`[bootstrap-admin] ${result.message}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[bootstrap-admin] Error during admin bootstrap:', err);
      process.exit(1);
    });
}
