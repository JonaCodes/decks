import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ENCRYPTION_PREFIX = 'enc:v1:';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// ---------------------------------------------------------------------------
// Key loading
// ---------------------------------------------------------------------------

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  const key = Buffer.from(hex, 'hex');
  if (key.length !== 32) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hex string (32 bytes)'
    );
  }
  return key;
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/** Returns true if the value has already been encrypted by this utility. */
export function isEncrypted(value: string): boolean {
  return value.startsWith(ENCRYPTION_PREFIX);
}

/**
 * Encrypts a plaintext string.
 * Output format: `enc:v1:<iv_b64>:<tag_b64>:<cipher_b64>`
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return (
    ENCRYPTION_PREFIX +
    iv.toString('base64') +
    ':' +
    tag.toString('base64') +
    ':' +
    encrypted.toString('base64')
  );
}

/**
 * Decrypts a value produced by `encrypt()`.
 * If the value is not prefixed, it is returned as-is (supports plaintext
 * rows that haven't been migrated yet or double-decrypt protection).
 */
export function decrypt(value: string): string {
  if (!isEncrypted(value)) {
    return value;
  }

  const payload = value.slice(ENCRYPTION_PREFIX.length);
  const parts = payload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format');
  }

  const [ivB64, tagB64, cipherB64] = parts;
  const key = getKey();
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(cipherB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(tag);

  return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8');
}

// ---------------------------------------------------------------------------
// HMAC blind-index for email lookups
// ---------------------------------------------------------------------------

/** Normalizes an email address for consistent hashing. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Returns a deterministic HMAC-SHA256 hex digest of the value.
 * Used as a blind index so that encrypted emails remain searchable.
 */
export function hmacHash(value: string): string {
  const key = getKey();
  return crypto.createHmac('sha256', key).update(value, 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// Raw-SQL post-processor
// ---------------------------------------------------------------------------

/**
 * Decrypts specified fields in-place on an array of plain objects (e.g. from
 * a raw Sequelize query). Safe to call even if some values are not encrypted.
 *
 * @example
 *   const users = await sequelize.query(sql, { type: QueryTypes.SELECT });
 *   return decryptFields(users, ['email', 'fullName']);
 */
export function decryptFields<T extends Record<string, any>>(
  rows: T[],
  fields: (keyof T)[]
): T[] {
  return rows.map((row) => {
    const copy = { ...row };
    for (const field of fields) {
      const val = copy[field];
      if (typeof val === 'string') {
        (copy as any)[field] = decrypt(val);
      }
    }
    return copy;
  });
}
