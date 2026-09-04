import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// ---------------------------------------------------------------------------
// Client setup
// ---------------------------------------------------------------------------

function getClient(): AxiosInstance {
  const baseURL = process.env.BMONI_BASE_URL || 'https://embedded-dev.bmoni.com';
  const apiKey = process.env.BMONI_API_KEY;
  if (!apiKey) throw new Error('BMONI_API_KEY is not set');

  return axios.create({
    baseURL,
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Type definitions (minimal — only fields we use)
// ---------------------------------------------------------------------------

export interface BmoniUser {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface BvnLookupResult {
  bvn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
}

export interface OwnerProofChallenge {
  challengeId: string;
  message: string;
  groupId: string;
  expiresAt: string;
}

export interface SmartWallet {
  id: string;
  walletAddress: string;
  currency: string;
  status: string;
}

export interface OnboardingStatus {
  nigeria?: { status: string };
  sumsub?: { status: string };
  [key: string]: { status: string } | undefined;
}

export interface WalletBalance {
  smartWalletId: string;
  currency: string;
  balance: string | null;
  error?: string;
}

export interface ByPhoneResult {
  bmoniUserId: string;
  wallets: SmartWallet[];
}

export interface SignatureRequest {
  method?: string;
  workflowId?: string;
  hashToSign?: string;
  signingPayloadHash?: string;
  payload?: string;
  deadline?: string;
  proposalId?: string | null;
}

export interface SendResult {
  proposal?: { id: string; status: string; nextAction: string };
  data?: {
    signatureRequest?: SignatureRequest;
    proposalId?: string;
    proposal?: { id: string };
  };
  signatureRequest?: SignatureRequest;
  proposalId?: string;
}

export interface WithdrawalResult {
  proposalId: string;
  signPayload?: {
    hashToSign: string;
    workflowId?: string;
  };
  signPayloadPending?: boolean;
  signPayloadHint?: string;
}

export interface Transaction {
  id: string;
  type: string;
  direction: 'credit' | 'debit';
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  narration?: string;
  counterpartyName?: string;
}

export interface ExchangeRate {
  exchangeRate?: string;
  displayRate?: string;
  displayLabel?: string;
  inverseRate?: string;
  inverseLabel?: string;
  rateSource?: string;
  from?: string;
  to?: string;
  rate?: string;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function createUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}): Promise<BmoniUser> {
  const client = getClient();
  const res = await client.post('/v1/users', input);
  const raw = res.data.user ?? res.data;
  return {
    id: raw.bmoniUserId || raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    phoneNumber: raw.phoneNumber,
    email: raw.email,
  };
}

export async function getUserProfile(userId: string): Promise<BmoniUser> {
  const client = getClient();
  const res = await client.get(`/v1/users/${userId}/kyc`);
  const raw = res.data.user ?? res.data;
  return {
    id: raw.bmoniUserId || raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName || '',
    phoneNumber: raw.phoneNumber || '',
    email: raw.email,
  };
}

export async function getUserByPhone(phoneNumber: string): Promise<BmoniUser | null> {
  const client = getClient();
  try {
    for (let page = 1; page <= 5; page++) {
      const res = await client.get('/v1/users', { params: { page, limit: 100 } });
      const users: Array<{ id: string; bmoniUserId?: string; phoneNumber?: string; firstName: string; lastName: string; email: string }> =
        res.data.users ?? res.data ?? [];
      if (!users.length) break;
      const found = users.find((u) => u.phoneNumber === phoneNumber);
      if (found) {
        return {
          id: found.bmoniUserId || found.id,
          firstName: found.firstName,
          lastName: found.lastName,
          phoneNumber: found.phoneNumber || phoneNumber,
          email: found.email,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  const client = getClient();
  try {
    const res = await client.delete(`/v1/users/${userId}`);
    return res.data?.success === true || res.status === 200;
  } catch {
    return false;
  }
}


// ---------------------------------------------------------------------------
// KYC
// ---------------------------------------------------------------------------

export async function bvnLookup(userId: string, bvn: string): Promise<BvnLookupResult> {
  const client = getClient();
  const res = await client.get(`/v1/users/${userId}/kyc/bvn-lookup/${bvn}`);
  return res.data;
}

export async function patchKyc(
  userId: string,
  input: {
    personalInfo?: Record<string, string>;
    address?: Record<string, string>;
  },
): Promise<void> {
  const client = getClient();
  await client.patch(`/v1/users/${userId}/kyc`, input);
}

/**
 * Activate KYC for Nigeria.
 *
 * CONFIRMED: Nigeria omits sumsubLevelName entirely.
 * Do NOT send sumsubLevelName for the Nigeria activation call — it is only
 * required for USD/EUR/Mexico. Sending an empty string would also be wrong.
 */
export async function activateKyc(userId: string, level = 'id-and-liveness'): Promise<void> {
  const client = getClient();
  await client.post(`/v1/users/${userId}/kyc/activate`, { sumsubLevelName: level });
}

// ---------------------------------------------------------------------------
// Document uploads
// ---------------------------------------------------------------------------

async function uploadDocument(
  userId: string,
  endpoint: string,
  filePath: string,
  extra: Record<string, string>,
  fileField = 'files',
): Promise<void> {
  const client = getClient();
  const form = new FormData();
  form.append(fileField, fs.createReadStream(filePath), {
    filename: `${fileField}.jpg`,
    contentType: 'image/jpeg',
  });
  for (const [k, v] of Object.entries(extra)) {
    form.append(k, v);
  }
  await client.post(endpoint, form, {
    headers: {
      ...form.getHeaders(),
      'x-api-key': process.env.BMONI_API_KEY!,
      'Content-Type': undefined, // let form-data set it with boundary
    },
  });
}

export async function uploadIdentification(userId: string, filePath: string): Promise<void> {
  await uploadDocument(
    userId,
    `/v1/users/${userId}/kyc/documents/identification`,
    filePath,
    {
      type: 'passport',
      documentNumber: 'A10000001',
      issuingCountry: 'NGA',
      expirationDate: '2030-01-01',
      issueDate: '2020-01-01',
    },
  );
}

export async function uploadProofOfAddress(userId: string, filePath: string): Promise<void> {
  await uploadDocument(
    userId,
    `/v1/users/${userId}/kyc/documents/proof-of-address`,
    filePath,
    { type: 'utility_bill' },
  );
}

export async function uploadBiometric(userId: string, filePath: string): Promise<void> {
  await uploadDocument(
    userId,
    `/v1/users/${userId}/kyc/documents/biometric`,
    filePath,
    { type: 'selfie' },
    'selfie',
  );
}

// ---------------------------------------------------------------------------
// Smart Wallets
// ---------------------------------------------------------------------------

export async function createOwnerProofChallenge(
  userId: string,
  currency: string,
  userOwnerAddress: string,
): Promise<OwnerProofChallenge> {
  const client = getClient();
  const res = await client.post(`/v1/users/${userId}/smart-wallets/owner-proof-challenges`, {
    currency,
    userOwnerAddress,
  });
  return res.data;
}

export async function createManagedWallet(
  userId: string,
  input: {
    currency: string;
    userOwnerAddress: string;
    ownerProofChallengeId: string;
    ownerProofSignature: string;
  },
): Promise<SmartWallet> {
  const client = getClient();
  const res = await client.post(`/v1/users/${userId}/smart-wallets/create-managed`, input);
  return res.data;
}

export async function listSmartWallets(userId: string): Promise<SmartWallet[]> {
  const client = getClient();
  const res = await client.get(`/v1/users/${userId}/smart-wallets/account/wallets`);
  const raw = res.data;
  return raw.wallets ?? raw ?? [];
}

export async function getBalances(userId: string): Promise<WalletBalance[]> {
  const client = getClient();
  const res = await client.get(`/v1/users/${userId}/smart-wallets/account/balances`);
  // Response shape: { balances: [...] } or array directly
  const raw = res.data;
  return raw.balances ?? raw ?? [];
}

export async function getByPhone(phoneNumber: string): Promise<ByPhoneResult> {
  const client = getClient();
  const res = await client.get('/v1/smart-wallets/by-phone', {
    params: { phoneNumber },
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export async function startNigeriaOnboarding(
  userId: string,
  input: { bvn: string; ngnWalletAddress: string; ngnWalletIndex: number },
): Promise<void> {
  const client = getClient();
  await client.post(`/v1/users/${userId}/onboarding/start-nigeria`, input);
}

export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const client = getClient();
  const res = await client.get(`/v1/users/${userId}/onboarding/status`);
  return res.data;
}

// ---------------------------------------------------------------------------
// Transfers (account/send)
//
// IMPORTANT: account/send returns the hashToSign directly in the response.
// There is NO separate approve step for this flow.
// Sign hashToSign with signProposalHash() (raw digest, no EIP-191 prefix).
// ---------------------------------------------------------------------------

export async function accountSend(
  userId: string,
  input: {
    toUserId: string;
    amount: string;
    currency?: string;
    note?: string;
  },
): Promise<SendResult> {
  const client = getClient();
  const res = await client.post(`/v1/users/${userId}/smart-wallets/account/send`, input);
  return res.data;
}

export async function approveProposal(userId: string, proposalId: string): Promise<void> {
  const client = getClient();
  await client.post(`/v1/users/${userId}/smart-wallets/proposals/${proposalId}/approve`, {});
}

export async function signProposal(
  userId: string,
  proposalId: string,
  signature: string,
): Promise<void> {
  const client = getClient();
  await client.post(`/v1/users/${userId}/smart-wallets/proposals/${proposalId}/sign`, {
    signature,
  });
}

export async function getProposalSignPayload(
  userId: string,
  proposalId: string,
): Promise<SignatureRequest> {
  const client = getClient();
  const res = await client.get(
    `/v1/users/${userId}/smart-wallets/proposals/${proposalId}/sign-payload`,
  );
  return res.data?.data ?? res.data;
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export async function getTransactions(
  userId: string,
  smartWalletId: string,
  limit = 8,
): Promise<Transaction[]> {
  const client = getClient();
  const res = await client.get(`/v1/users/${userId}/transactions/${smartWalletId}`, {
    params: { limit },
  });
  const raw = res.data;
  return raw.transactions ?? raw ?? [];
}

// ---------------------------------------------------------------------------
// Exchange rates
// ---------------------------------------------------------------------------

export async function getExchangeRate(
  userId: string,
  from: string,
  to: string,
): Promise<ExchangeRate> {
  const client = getClient();
  const res = await client.get(`/v1/users/${userId}/exchange/rate/${from}/${to}`);
  return res.data;
}

// ---------------------------------------------------------------------------
// Withdrawal to Nigerian bank
//
// IMPORTANT: withdrawal/wallet/nigeria returns the sign payload directly.
// Sign signPayload.hashToSign with signProposalHash() (raw digest, no EIP-191).
// ---------------------------------------------------------------------------

export async function withdrawWalletNigeria(
  userId: string,
  input: {
    sourceSmartWalletId: string;
    bankAccountId: string;
    fromAmount: string;
  },
): Promise<WithdrawalResult> {
  const client = getClient();
  const res = await client.post(`/v1/users/${userId}/withdrawal/wallet/nigeria`, input);
  return res.data;
}

export async function getNigerianBankAccounts(userId: string): Promise<
  Array<{ id: string; accountName: string; accountNumber: string; bankName: string }>
> {
  const client = getClient();
  try {
    const res = await client.get(`/v1/users/${userId}/bank-accounts/withdrawal-accounts/nigeria`);
    const raw = res.data;
    return raw.accounts ?? raw ?? [];
  } catch {
    return [];
  }
}

export async function createProposal(
  userId: string,
  smartWalletId: string,
  proposal: {
    type: string;
    toAddress?: string;
    toUserId?: string;
    amount: string;
    currency: string;
    description?: string;
  },
): Promise<{ proposal?: { id: string }; id?: string }> {
  const client = getClient();
  const res = await client.post(`/v1/users/${userId}/smart-wallets/${smartWalletId}/proposals`, {
    proposal,
  });
  return res.data;
}

export async function listNigerianBanks(
  userId: string,
): Promise<Array<{ bankName: string; bankCode: string }>> {
  const client = getClient();
  const res = await client.get(`/v1/users/${userId}/bank-accounts/nigerian-banks`);
  const raw = res.data;
  return raw.banks ?? raw ?? [];
}

export async function verifyNigerianAccount(
  userId: string,
  accountNumber: string,
  bankCode: string,
): Promise<{ accountNumber: string; accountName: string; bankName: string; bankCode: string }> {
  const client = getClient();
  const res = await client.post(`/v1/users/${userId}/bank-accounts/verify-nigerian-account`, {
    accountNumber,
    bankCode,
  });
  return res.data;
}

export async function createNigerianWithdrawalAccount(
  userId: string,
  input: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountHolderName: string;
  },
): Promise<{ id: string; accountNumber: string; bankName: string; accountName: string }> {
  const client = getClient();
  const res = await client.post(`/v1/users/${userId}/bank-accounts/withdrawal-accounts/nigeria`, input);
  return res.data;
}

export async function createCard(
  userId: string,
  input: {
    cardName: string;
    cardColor: string;
    currency: string;
    type: 'virtual' | 'physical';
    smartWalletId: string;
    nin?: string;
    bvn?: string;
  },
): Promise<{
  flow: string;
  proposalId?: string;
  workflowId?: string;
  signPayload?: { hashToSign?: string };
}> {
  const client = getClient();
  const res = await client.post(`/v1/users/${userId}/cards`, input);
  return res.data;
}

export async function listSmartWalletCards(
  userId: string,
  smartWalletId: string,
): Promise<
  Array<{
    id: string;
    cardName?: string;
    cardColor?: string;
    currency: string;
    status: string;
    type?: string;
    last4?: string;
    expiry?: string;
  }>
> {
  const client = getClient();
  const res = await client.get(`/v1/users/${userId}/smart-wallets/${smartWalletId}/cards`);
  const raw = res.data;
  return raw.cards ?? raw ?? [];
}
