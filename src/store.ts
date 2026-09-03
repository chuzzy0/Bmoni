import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserRecord {
  whatsappPhone: string;       // E.164, primary key
  bmoniUserId?: string;
  smartWalletId?: string;
  walletAddress?: string;
  encryptedPrivateKey: string; // AES-256-GCM ciphertext:iv:authTag (hex)
  persona?: 1 | 2;
  bvn?: string;
  firstName?: string;
  lastName?: string;
  /** 0 = not started, 1 = bmoni user created, 2 = bvn verified & profile patched, 3 = kyc patched, 4 = wallet created, 5 = nigeria onboarding started, 6 = docs uploaded, 7 = kyc activated */
  onboardingStep: number;
  /** Pending state when user is asked for BVN */
  awaitingBvn?: boolean;
  awaitingPersonaChoice?: boolean;
  kycDateOfBirth?: string;
  kycGender?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Encryption helpers
// ---------------------------------------------------------------------------

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte (64-char) hex string');
  }
  return Buffer.from(raw, 'hex');
}

export function encryptPrivateKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: ciphertext:iv:authTag — all hex
  return `${encrypted.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}`;
}

export function decryptPrivateKey(ciphertext: string): string {
  const key = getEncryptionKey();
  const [enc, ivHex, tagHex] = ciphertext.split(':');
  if (!enc || !ivHex || !tagHex) throw new Error('Invalid encrypted key format');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(Buffer.from(enc, 'hex')).toString('utf8') + decipher.final('utf8');
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readAll(): Record<string, UserRecord> {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) as Record<string, UserRecord>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, UserRecord>) {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getUser(whatsappPhone: string): UserRecord | null {
  const db = readAll();
  return db[whatsappPhone] ?? null;
}

export function saveUser(record: UserRecord): void {
  const db = readAll();
  db[record.whatsappPhone] = record;
  writeAll(db);
}

export function updateUser(whatsappPhone: string, updates: Partial<UserRecord>): UserRecord {
  const db = readAll();
  const existing = db[whatsappPhone];
  if (!existing) throw new Error(`No user found for ${whatsappPhone}`);
  const updated = { ...existing, ...updates };
  db[whatsappPhone] = updated;
  writeAll(db);
  return updated;
}

export function userExists(whatsappPhone: string): boolean {
  return !!readAll()[whatsappPhone];
}
