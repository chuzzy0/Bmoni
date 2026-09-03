import { ethers } from 'ethers';

/**
 * Signing module — two explicit functions, never a generic sign() helper.
 *
 * BMONI uses TWO incompatible signing methods:
 *   1. EIP-191 personal_sign  → owner-proof challenges (wallet creation)
 *   2. Raw digest sign        → proposal hashToSign (transfers/withdrawals)
 *
 * Using the wrong method recovers the wrong address and fails silently.
 */

// ---------------------------------------------------------------------------
// Key generation
// ---------------------------------------------------------------------------

export function generateKeypair(): { address: string; privateKey: string } {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,  // 0x-prefixed 32-byte hex
  };
}

// ---------------------------------------------------------------------------
// Signing: EIP-191 personal_sign (owner-proof challenge ONLY)
// ---------------------------------------------------------------------------

/**
 * Signs the wallet-creation owner-proof challenge.
 *
 * Uses wallet.signMessage() which prepends the EIP-191 prefix:
 *   "\x19Ethereum Signed Message:\n<len><message>"
 *
 * DO NOT use this for proposal hashes — that requires signProposalHash().
 */
export async function signOwnerProofChallenge(
  privateKey: string,
  challengeMessage: string,
): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  // signMessage applies EIP-191 prefix — correct for owner-proof challenges
  const signature = await wallet.signMessage(challengeMessage);
  return signature;
}

// ---------------------------------------------------------------------------
// Signing: Raw digest (proposal hashToSign ONLY)
// ---------------------------------------------------------------------------

/**
 * Signs a proposal hashToSign (a raw 32-byte EVM digest).
 *
 * Uses wallet.signingKey.sign() which signs the digest DIRECTLY,
 * with NO EIP-191 prefix. This is the opposite of signOwnerProofChallenge().
 *
 * hashToSign is a 0x-prefixed 32-byte hex string returned by
 * GET /proposals/{proposalId}/sign-payload  or  POST /smart-wallets/account/send
 *
 * DO NOT use wallet.signMessage() here — it would add the EIP-191 prefix,
 * recover the wrong address, and get silently rejected by BMONI.
 */
export function signProposalHash(
  privateKey: string,
  hashToSign: string,
): string {
  const wallet = new ethers.Wallet(privateKey);
  // signingKey.sign() signs the raw digest — no prefix, no hashing
  const sig = wallet.signingKey.sign(hashToSign);
  return sig.serialized;  // 0x-prefixed 130-char hex (r + s + v)
}
