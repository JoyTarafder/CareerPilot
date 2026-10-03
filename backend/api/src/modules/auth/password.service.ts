import argon2 from 'argon2';
import { config } from '../../config/index.js';

/**
 * PasswordService
 * Implements Argon2id with unique salt and server-side pepper per SECURITY.md §4.
 */
export class PasswordService {
  private readonly pepper: string;

  constructor(pepper = config.PASSWORD_PEPPER_V1) {
    this.pepper = pepper;
  }

  /**
   * Hashes a password using Argon2id with unique salt and pepper.
   */
  async hash(password: string): Promise<string> {
    // Combine password with server-side versioned pepper
    const peppered = `${password}${this.pepper}`;
    return argon2.hash(peppered, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  /**
   * Verifies a candidate password against the stored Argon2id hash in constant time.
   */
  async verify(password: string, hash: string): Promise<boolean> {
    try {
      const peppered = `${password}${this.pepper}`;
      return await argon2.verify(hash, peppered);
    } catch {
      return false;
    }
  }
}

export const defaultPasswordService = new PasswordService();
