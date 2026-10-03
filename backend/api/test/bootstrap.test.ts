import { describe, it } from 'node:test';
import assert from 'node:assert';
import { bootstrapAdmin } from '../src/bootstrap/bootstrap-admin.js';
import { InMemoryAuthRepository } from '../src/modules/auth/auth.repository.js';
import { Role } from '@prisma/client';

describe('Phase 1 — Admin Bootstrap Lifecycle', () => {
  it('creates initial admin when no admin exists, and is idempotent on repeat', async () => {
    const authRepo = new InMemoryAuthRepository();
    process.env.ADMIN_BOOTSTRAP_EMAIL = 'admin@careerpilot.io';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'AdminUniqueBootstrapSecret123!';

    // First run: Creates admin
    const run1 = await bootstrapAdmin(authRepo);
    assert.strictEqual(run1.created, true);
    assert.strictEqual(run1.email, 'admin@careerpilot.io');

    const admin = await authRepo.findUserByEmail('admin@careerpilot.io');
    assert.ok(admin);
    assert.strictEqual(admin.role, Role.SUPER_ADMIN);
    assert.notStrictEqual(admin.passwordHash, 'AdminUniqueBootstrapSecret123!');
    assert.ok(admin.passwordHash.startsWith('$argon2id$'));

    // Second run: Must be idempotent and do nothing
    const run2 = await bootstrapAdmin(authRepo);
    assert.strictEqual(run2.created, false);
    assert.ok(run2.message.includes('Admin account already exists'));
  });
});
