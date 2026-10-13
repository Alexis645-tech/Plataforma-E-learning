import bcrypt from 'bcryptjs';

export const BCRYPT_SALT_ROUNDS = 10;

/**
 * Checks if a string is a standard bcrypt hash
 */
export function isBcryptHash(value?: string | null): boolean {
  if (!value || typeof value !== 'string') return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value.trim());
}

/**
 * Client-side safe bcrypt password hashing
 */
export function hashPasswordClient(plain: string, saltRounds = BCRYPT_SALT_ROUNDS): string {
  if (!plain || typeof plain !== 'string') return '';
  const trimmed = plain.trim();
  if (isBcryptHash(trimmed)) return trimmed;
  return bcrypt.hashSync(trimmed, saltRounds);
}

/**
 * Client-side verification against bcrypt hash or fallback
 */
export function verifyPasswordClient(candidate: string, storedHashOrPlain?: string | null): boolean {
  if (!candidate || !storedHashOrPlain) return false;
  const trimmedCandidate = candidate.trim();
  const trimmedStored = storedHashOrPlain.trim();

  if (isBcryptHash(trimmedStored)) {
    try {
      return bcrypt.compareSync(trimmedCandidate, trimmedStored);
    } catch {
      return false;
    }
  }

  // Fallback plain-text equality
  return trimmedCandidate === trimmedStored;
}
