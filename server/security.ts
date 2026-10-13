import bcrypt from 'bcryptjs';
import { User } from '../src/types';

// Default salt rounds (industry standard for balancing security vs computation latency)
export const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Checks whether a given string is already formatted as a standard bcrypt hash
 * ($2a$, $2b$, or $2y$ prefix with 60 characters)
 */
export function isBcryptHash(value?: string | null): boolean {
  if (!value || typeof value !== 'string') return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value.trim());
}

/**
 * Asynchronously hashes a plain text password using bcrypt.
 * If the string is already a valid bcrypt hash, it returns it unchanged to prevent double-hashing.
 */
export async function hashPassword(plainPassword: string, saltRounds = BCRYPT_SALT_ROUNDS): Promise<string> {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  const trimmed = plainPassword.trim();
  if (isBcryptHash(trimmed)) {
    return trimmed;
  }

  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(trimmed, salt);
}

/**
 * Synchronous version of hashPassword for initialization and fallback scripts.
 */
export function hashPasswordSync(plainPassword: string, saltRounds = BCRYPT_SALT_ROUNDS): string {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  const trimmed = plainPassword.trim();
  if (isBcryptHash(trimmed)) {
    return trimmed;
  }

  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(trimmed, salt);
}

/**
 * Verifies a candidate password against a stored bcrypt hash.
 * If the stored value is an older unhashed plain-text string, it performs a fallback
 * comparison and flags that the user needs migration.
 */
export async function verifyPassword(
  candidatePlain: string,
  storedHashOrPlain?: string | null
): Promise<{ isValid: boolean; needsRehash: boolean }> {
  if (!candidatePlain || !storedHashOrPlain) {
    return { isValid: false, needsRehash: false };
  }

  const trimmedCandidate = candidatePlain.trim();
  const trimmedStored = storedHashOrPlain.trim();

  if (isBcryptHash(trimmedStored)) {
    const isValid = await bcrypt.compare(trimmedCandidate, trimmedStored);
    return { isValid, needsRehash: false };
  }

  // Legacy plain-text fallback comparison
  const isValid = trimmedCandidate === trimmedStored;
  return { isValid, needsRehash: isValid };
}

/**
 * Ensures a User object has its password safely converted into a bcrypt hash
 * before being committed into MongoDB or persistence.
 */
export async function secureUserForDb(user: User): Promise<User> {
  const cloned = { ...user };
  const rawPassword = cloned.password || (cloned as any).rawPassword;

  if (rawPassword) {
    if (isBcryptHash(rawPassword)) {
      cloned.password = rawPassword;
      cloned.passwordHash = rawPassword;
      cloned.isPasswordHashed = true;
    } else {
      const hashed = await hashPassword(rawPassword);
      cloned.password = hashed;
      cloned.passwordHash = hashed;
      cloned.isPasswordHashed = true;
    }
  } else if (!cloned.password) {
    // Assign role-based default hashed password if completely empty
    const defaultPlain =
      cloned.role === 'admin'
        ? 'AdminEdu2026!'
        : cloned.role === 'teacher'
        ? 'DocenteEdu2026!'
        : 'EstudianteEdu2026!';
    const hashed = await hashPassword(defaultPlain);
    cloned.password = hashed;
    cloned.passwordHash = hashed;
    cloned.isPasswordHashed = true;
  }

  return cloned;
}

/**
 * Ensures an array of User objects all have bcrypt hashed passwords before DB insertion.
 */
export async function secureUsersForDb(users: User[]): Promise<User[]> {
  return Promise.all(users.map((u) => secureUserForDb(u)));
}
