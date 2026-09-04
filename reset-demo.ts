/**
 * reset-demo.ts
 *
 * Demo Day Reset Script
 * ─────────────────────
 * Clears a user's local record, deletes their BMONI account, then runs the
 * FULL onboarding programmatically in one shot — so the live WhatsApp demo
 * starts from a true fresh state and all subsequent features (send, card,
 * balance) work without any "signature mismatch" errors.
 *
 * Usage:
 *   npx tsx reset-demo.ts +2349015991392 95888168924
 *   npx tsx reset-demo.ts +2349015991392 22222222222   (Samson persona)
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as bmoni from './src/bmoni';
import { getUser, saveUser, updateUser, encryptPrivateKey, decryptPrivateKey } from './src/store';
import { generateKeypair, signOwnerProofChallenge } from './src/signing';
import { ethers } from 'ethers';
import { runOnboarding } from './src/onboarding';

const USERS_FILE = path.resolve('./data/users.json');

async function deleteBmoniUser(userId: string): Promise<void> {
  try {
    const deleted = await bmoni.deleteUser(userId);
    console.log(deleted ? `  ✅ BMONI user deleted: ${userId}` : `  ⚠️  BMONI delete returned non-success for: ${userId}`);
  } catch {
    console.log(`  ℹ️  Could not delete BMONI user (may already be gone): ${userId}`);
  }
}

async function resetUser(phone: string, bvn: string): Promise<void> {
  console.log(`\n🔄 Resetting ${phone}...`);

  // 1. Load existing local record if any
  const users: Record<string, unknown> = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const existing = users[phone] as Record<string, unknown> | undefined;

  // 2. Delete old BMONI account
  const bmoniUserId = existing?.bmoniUserId as string | undefined;
  if (bmoniUserId) {
    await deleteBmoniUser(bmoniUserId);
  } else {
    // Try to find by phone on BMONI in case local record was cleared
    const found = await bmoni.getUserByPhone(phone);
    if (found) {
      await deleteBmoniUser(found.id);
    } else {
      console.log(`  ℹ️  No BMONI account found for ${phone}`);
    }
  }

  // 3. Remove local record entirely — generate a fresh keypair
  delete users[phone];
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  console.log(`  ✅ Local record cleared`);

  // 4. Generate fresh keypair and create local stub
  const { address, privateKey } = generateKeypair();
  const newUser = {
    whatsappPhone: phone,
    encryptedPrivateKey: encryptPrivateKey(privateKey),
    onboardingStep: 0,
    awaitingBvn: true,
    createdAt: new Date().toISOString(),
    walletAddress: address,
  };
  const usersNow: Record<string, unknown> = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  usersNow[phone] = newUser;
  fs.writeFileSync(USERS_FILE, JSON.stringify(usersNow, null, 2));
  console.log(`  ✅ Fresh keypair generated: ${address}`);

  // 5. Register on BMONI — try the real phone first, fall back to temp if blocked
  console.log(`\n  📡 Registering on BMONI...`);
  const cleanPhone = phone.replace(/\D/g, '');
  let bmoniNewId: string | null = null;

  for (const phoneToTry of [phone, `+${cleanPhone.slice(0, -2)}${Math.floor(Math.random() * 90 + 10)}`]) {
    try {
      const created = await bmoni.createUser({
        firstName: 'User',
        lastName: '',
        email: `user_${cleanPhone}_${Date.now()}@bmoni-demo.com`,
        phoneNumber: phoneToTry,
      });
      bmoniNewId = created.id;
      console.log(`  ✅ BMONI user created (phone: ${phoneToTry}): ${bmoniNewId}`);
      break;
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: unknown } };
      if (err.response?.status === 409) {
        // Already exists — find and link
        const found = await bmoni.getUserByPhone(phoneToTry);
        if (found) {
          bmoniNewId = found.id;
          console.log(`  ℹ️  Linked existing BMONI user: ${bmoniNewId}`);
          break;
        }
      }
      console.log(`  ⚠️  Phone ${phoneToTry} failed (${err.response?.status}), trying next...`);
    }
  }

  if (!bmoniNewId) {
    console.error(`  ❌ Could not create BMONI user — demo reset failed`);
    process.exit(1);
  }

  // 6. Patch local record with BMONI user ID at step 1
  const usersStep1: Record<string, unknown> = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  usersStep1[phone] = { ...usersStep1[phone] as object, bmoniUserId: bmoniNewId, onboardingStep: 1 };
  fs.writeFileSync(USERS_FILE, JSON.stringify(usersStep1, null, 2));

  // 7. Run the rest of onboarding (BVN → KYC → wallet → Nigeria → activate)
  console.log(`\n  🚀 Running full onboarding (BVN: ${bvn})...`);
  const result = await runOnboarding(phone, bvn);

  if (result.status === 'done') {
    const finalUsers: Record<string, unknown> = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    const finalUser = finalUsers[phone] as Record<string, unknown>;
    console.log(`\n✅ Reset complete!`);
    console.log(`  Phone       : ${phone}`);
    console.log(`  BVN persona : ${bvn}`);
    console.log(`  BMONI user  : ${finalUser.bmoniUserId}`);
    console.log(`  Smart wallet: ${finalUser.smartWalletId}`);
    console.log(`  Wallet addr : ${finalUser.walletAddress}`);
    console.log(`  Step        : ${finalUser.onboardingStep}/7`);
    console.log(`\n📱 WhatsApp is ready. Send "hi" to see the Welcome screen and demo all features!`);
  } else if (result.status === 'pending') {
    console.log(`\n⏳ Onboarding pending — KYC verification may take a moment`);
    console.log(`  Updates: ${result.updates?.join(', ')}`);
  } else {
    console.error(`\n❌ Onboarding failed: ${result.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Usage:
  npx tsx reset-demo.ts <whatsapp_phone> <bvn>

Examples:
  npx tsx reset-demo.ts +2349015991392 95888168924   (Bunch Dillon persona)
  npx tsx reset-demo.ts +2349015991392 22222222222   (Samson Jabo persona)

BVN Test Personas:
  95888168924 — Bunch Dillon
  22222222222 — Samson Jabo
    `);
    process.exit(1);
  }

  const [phone, bvn] = args;
  await resetUser(phone, bvn);
}

main().catch((e) => {
  console.error('Fatal error:', e?.response?.data || e.message);
  process.exit(1);
});
