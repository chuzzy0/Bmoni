import path from 'path';
import { getUser, saveUser, updateUser, encryptPrivateKey, decryptPrivateKey } from './store.js';
import { generateKeypair, signOwnerProofChallenge } from './signing.js';
import * as bmoni from './bmoni.js';

// ---------------------------------------------------------------------------
// Fixture paths
// ---------------------------------------------------------------------------

const FIXTURES_DIR = path.join(process.cwd(), 'fixtures');
const ID_FIXTURE = path.join(FIXTURES_DIR, 'id-front.jpg');
const POA_FIXTURE = path.join(FIXTURES_DIR, 'proof-of-address.jpg');
const SELFIE_FIXTURE = path.join(FIXTURES_DIR, 'selfie.jpg');

// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pollOnboardingActive(userId: string, maxRetries = 10): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const status = await bmoni.getOnboardingStatus(userId);
      const vals = Object.values(status as Record<string, unknown>);
      const anyActive = vals.some(
        (v) =>
          v === 'active' ||
          v === 'ACTIVE' ||
          (typeof v === 'object' && v !== null && ((v as { status?: string }).status === 'active' || (v as { status?: string }).status === 'ACTIVE')),
      );
      if (anyActive) {
        console.log(`[Onboarding] Rail active! Status:`, JSON.stringify(status));
        return true;
      }
      console.log(`[Onboarding] Polling ${i + 1}/${maxRetries}:`, JSON.stringify(status));
    } catch (err) {
      console.error('[Onboarding] Poll error:', err);
    }
    await sleep(3000);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Main onboarding runner — resumable from last successful step
// ---------------------------------------------------------------------------

export interface OnboardingProgress {
  /** Step completed, or 'done' | 'pending' | 'failed' */
  status: 'done' | 'pending' | 'failed';
  message:
    | string
    | {
        type: 'interactive_buttons';
        text: string;
        buttons: Array<{ id: string; title: string }>;
        header?: string;
      };
  /** Messages to send to the user as progress updates */
  updates: string[];
}

export async function runOnboarding(
  whatsappPhone: string,
  inputBvn: string,
): Promise<OnboardingProgress> {
  const updates: string[] = [];

  // Load or init user record
  let user = getUser(whatsappPhone);
  if (!user) {
    // First time — generate keypair and create record
    const { address, privateKey } = generateKeypair();
    user = {
      whatsappPhone,
      encryptedPrivateKey: encryptPrivateKey(privateKey),
      onboardingStep: 0,
      awaitingBvn: true,
      createdAt: new Date().toISOString(),
      walletAddress: address,
    };
    saveUser(user);
  }

  // -------------------------------------------------------------------------
  // Step 0 → 1: Create BMONI user with placeholder fields
  // Required in CreateUserInput: firstName, email, phoneNumber
  // -------------------------------------------------------------------------
  if (user.onboardingStep < 1) {
    updates.push('Creating your account...');
    try {
      const cleanPhone = whatsappPhone.replace(/\D/g, '');
      const created = await bmoni.createUser({
        firstName: 'User',
        lastName: '',
        email: `user_${cleanPhone}@bmoni-demo.com`,
        phoneNumber: whatsappPhone,
      });
      user = updateUser(whatsappPhone, { bmoniUserId: created.id, onboardingStep: 1 });
      console.log('[Onboarding] Step 1 done — user created:', created.id);
    } catch (err: unknown) {
      const axErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axErr.response?.status === 409) {
        // User already exists — look them up and continue
        const existing = await bmoni.getUserByPhone(whatsappPhone);
        if (existing) {
          user = updateUser(whatsappPhone, { bmoniUserId: existing.id, onboardingStep: 1 });
          console.log('[Onboarding] Step 1 done (existing user):', existing.id);
        } else {
          return { status: 'failed', message: '❌ Failed to find existing account. Please try sending your BVN again.', updates };
        }
      } else {
        console.error('[Onboarding] Step 1 failed:', axErr.response?.data);
        return { status: 'failed', message: '❌ Account creation failed. Please try sending your BVN again.', updates };
      }
    }
  }

  const userId = user.bmoniUserId!;

  // -------------------------------------------------------------------------
  // Step 1 → 2: BVN lookup to verify identity & fetch real name
  // -------------------------------------------------------------------------
  if (user.onboardingStep < 2) {
    updates.push('Verifying BVN identity...');
    try {
      const bvnData = await bmoni.bvnLookup(userId, inputBvn);
      if (!bvnData || !bvnData.firstName) {
        throw new Error('BVN lookup returned empty record');
      }

      user = updateUser(whatsappPhone, {
        bvn: inputBvn,
        firstName: bvnData.firstName,
        lastName: bvnData.lastName,
        kycDateOfBirth: bvnData.dateOfBirth,
        kycGender: bvnData.gender,
        awaitingBvn: false,
        onboardingStep: 2,
      });
      updates.push(`Thanks! We found ${bvnData.firstName} ${bvnData.lastName}. Setting up your account now...`);
      console.log('[Onboarding] Step 2 done — BVN lookup:', bvnData.firstName, bvnData.lastName);
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: unknown } };
      console.error('[Onboarding] Step 2 BVN lookup failed:', axErr.response?.data || err);
      // BVN invalid / not found — return friendly error and let them retry without breaking step machine
      return {
        status: 'failed',
        message: `⚠️ *BVN Identity Check Unsuccessful*\n\nWe couldn't verify BVN *${inputBvn}* on the NIBSS identity database.\n\n💡 *Demo Note:* For this sandbox test environment, please use one of our verified test personas below:\n\n• *95888168924* — Bunch Dillon\n• *22222222222* — Samson Jabo\n\nReply with one of these numbers to set up your account instantly! 🚀`,
        updates,
      };
    }
  }

  const firstName = user.firstName || 'User';
  const lastName = user.lastName || '';
  const bvn = user.bvn || inputBvn;

  // -------------------------------------------------------------------------
  // Step 2 → 3: PATCH KYC profile with real name & address
  // -------------------------------------------------------------------------
  if (user.onboardingStep < 3) {
    updates.push('📋 Submitting KYC profile...');
    try {
      await bmoni.patchKyc(userId, {
        personalInfo: {
          firstName,
          lastName,
          dateOfBirth: user.kycDateOfBirth || '1990-01-15',
          gender: user.kycGender || 'male',
        },
        address: {
          streetLine1: '15 Admiralty Way',
          city: 'Lagos',
          state: 'Lagos',
          postalCode: '101241',
          countryCode: 'NGA',
        },
      });
      user = updateUser(whatsappPhone, { onboardingStep: 3 });
      console.log('[Onboarding] Step 3 done — KYC profile patched with real name');
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: unknown } };
      console.error('[Onboarding] Step 3 KYC patch failed:', axErr.response?.data);
      return { status: 'failed', message: '❌ KYC profile update failed. Please try sending your BVN again.', updates };
    }
  }

  // -------------------------------------------------------------------------
  // Step 3 → 4: Create smart wallet
  // EIP-191 signing for owner-proof challenge
  // -------------------------------------------------------------------------
  if (user.onboardingStep < 4) {
    updates.push('💳 Creating your smart wallet...');
    try {
      const walletAddress = user.walletAddress!;
      const privateKey = decryptPrivateKey(user.encryptedPrivateKey);

      // Get challenge (expires in 10 minutes — sign immediately)
      const challenge = await bmoni.createOwnerProofChallenge(userId, 'CNGN', walletAddress);

      // EIP-191 personal_sign — correct for owner-proof challenges
      const signature = await signOwnerProofChallenge(privateKey, challenge.message);

      // Create managed wallet — handles prepare + deploy + register in one call
      const wallet = await bmoni.createManagedWallet(userId, {
        currency: 'CNGN',
        userOwnerAddress: walletAddress,
        ownerProofChallengeId: challenge.challengeId,
        ownerProofSignature: signature,
      });

      user = updateUser(whatsappPhone, {
        smartWalletId: wallet.id,
        onboardingStep: 4,
      });
      console.log('[Onboarding] Step 4 done — wallet created:', wallet.id);
    } catch (err: unknown) {
      const axErr = err as { response?: { status?: number; data?: unknown } };
      if (axErr.response?.status === 409) {
        updates.push('ℹ️ Wallet already exists — linking your existing wallet...');
        const wallets = await bmoni.listSmartWallets(userId);
        if (wallets.length) {
          const w = wallets[0];
          user = updateUser(whatsappPhone, {
            smartWalletId: w.id,
            walletAddress: (w.walletAddress as unknown as string) || user.walletAddress,
            onboardingStep: 4,
          });
          console.log('[Onboarding] Step 4 done (linked existing wallet):', w.id);
        } else {
          console.error('[Onboarding] Step 4 409 but no wallets found');
          return { status: 'failed', message: '❌ Wallet creation failed. Please try `signup` again.', updates };
        }
      } else {
        console.error('[Onboarding] Step 4 wallet creation failed:', axErr.response?.data);
        return { status: 'failed', message: '❌ Wallet creation failed. Please try `signup` again.', updates };
      }
    }
  }

  const smartWalletId = user.smartWalletId!;
  const walletAddress = user.walletAddress!;

  // -------------------------------------------------------------------------
  // Step 4 → 5: Start Nigeria onboarding
  // -------------------------------------------------------------------------
  if (user.onboardingStep < 5) {
    updates.push('Starting onboarding...');
    try {
      await bmoni.startNigeriaOnboarding(userId, {
        bvn,
        ngnWalletAddress: walletAddress,
        ngnWalletIndex: 0,
      });
      user = updateUser(whatsappPhone, { onboardingStep: 5 });
      console.log('[Onboarding] Step 5 done — Nigeria onboarding started');
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: unknown } };
      console.error('[Onboarding] Step 5 Nigeria onboarding failed:', axErr.response?.data);
      return { status: 'failed', message: '❌ Nigeria onboarding failed. Please try sending your BVN again.', updates };
    }
  }

  // -------------------------------------------------------------------------
  // Step 5 → 6: Upload 3 KYC document fixtures
  // -------------------------------------------------------------------------
  if (user.onboardingStep < 6) {
    updates.push('📄 Uploading verification documents...');
    try {
      await bmoni.uploadIdentification(userId, ID_FIXTURE);
      await bmoni.uploadProofOfAddress(userId, POA_FIXTURE);
      await bmoni.uploadBiometric(userId, SELFIE_FIXTURE);
      user = updateUser(whatsappPhone, { onboardingStep: 6 });
      console.log('[Onboarding] Step 6 done — documents uploaded');
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: unknown } };
      console.error('[Onboarding] Step 6 document upload failed:', axErr.response?.data);
      return { status: 'failed', message: '❌ Document upload failed. Please try sending your BVN again.', updates };
    }
  }

  // -------------------------------------------------------------------------
  // Step 6 → 7: Activate KYC (Nigeria — level 'id-and-liveness')
  // -------------------------------------------------------------------------
  if (user.onboardingStep < 7) {
    updates.push('✅ Activating account...');
    try {
      await bmoni.activateKyc(userId);
      user = updateUser(whatsappPhone, { onboardingStep: 7 });
      console.log('[Onboarding] Step 7 done — KYC activated');
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: unknown } };
      console.error('[Onboarding] Step 7 KYC activation failed:', axErr.response?.data);
      return { status: 'failed', message: '❌ KYC activation failed. Please try sending your BVN again.', updates };
    }
  }

  // -------------------------------------------------------------------------
  // Poll for active status
  // -------------------------------------------------------------------------
  updates.push('⏳ Verifying identity — please wait a moment...');
  const active = await pollOnboardingActive(userId);
  if (!active) {
    updates.push('Verification is still processing. Try *balance* in a minute.');
  }

  return {
    status: 'done',
    message: {
      type: 'interactive_buttons',
      header: 'Welcome to BMONI',
      text: `✅ *Welcome to BMONI, ${firstName}!*\n\nYour stablecoin wallet is ready.\n\n• *Smart Wallet:* \`${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}\``,
      buttons: [
        { id: 'balance', title: 'Check Balance' },
        { id: 'get card', title: 'Virtual Card' },
        { id: 'help', title: 'Main Menu' },
      ],
    },
    updates,
  };
}
