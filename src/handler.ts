import { getUser, updateUser, decryptPrivateKey } from './store.js';
import { parseCommand, HELP_TEXT } from './commands.js';
import { runOnboarding } from './onboarding.js';
import { signProposalHash } from './signing.js';
import * as bmoni from './bmoni.js';

export type HandlerReply =
  | string
  | {
      type: 'image';
      url: string;
      caption?: string;
    }
  | {
      type: 'interactive_buttons';
      text: string;
      buttons: Array<{ id: string; title: string }>;
      header?: string;
    }
  | {
      type: 'interactive_list';
      text: string;
      buttonTitle: string;
      sections: Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
      }>;
      header?: string;
      footer?: string;
    };

// ---------------------------------------------------------------------------
// Helper: Financial Services Modal Bottom Sheet (10 Comprehensive Options)
// ---------------------------------------------------------------------------

function getFinancialServicesMenu(): HandlerReply {
  return {
    type: 'interactive_list',
    header: 'BMONI Financial Services',
    text: 'Select a service or transaction from the menu options below:',
    buttonTitle: 'View Options',
    footer: 'BMONI Embedded Banking Platform',
    sections: [
      {
        title: 'Payments & Money',
        rows: [
          { id: 'send_money', title: 'Send Money', description: 'Transfer CNGN by phone number or EVM address' },
          { id: 'fund', title: 'Add Funds / Deposit', description: 'View deposit address for CNGN/USDC' },
          { id: 'balance', title: 'Check Balance', description: 'View CNGN and wallet balances' },
          { id: 'withdraw 100 to bank', title: 'Cash Out to Bank', description: 'Withdraw CNGN to registered bank account' },
        ],
      },
      {
        title: 'Cards & Banking Setup',
        rows: [
          { id: 'get card', title: 'Virtual Dollar Card', description: 'Issue or view Virtual Visa/Mastercard' },
          { id: 'add bank 0123456789 058', title: 'Add Bank Account', description: 'Register NUBAN account for payouts' },
          { id: 'banks', title: 'Supported Banks', description: 'List CBN bank codes for withdrawal' },
        ],
      },
      {
        title: 'Insights & Rates',
        rows: [
          { id: 'history', title: 'Transaction History', description: 'View recent account activity' },
          { id: 'rate USD NGN', title: 'Exchange Rate', description: 'Live USD/NGN conversion rates' },
          { id: 'signup', title: 'Account Verification', description: 'Check identity & KYC status' },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Main message handler
// Returns array of HandlerReply items (sent sequentially by caller)
// ---------------------------------------------------------------------------

export async function handleMessage(phone: string, text: string): Promise<HandlerReply[]> {
  const command = parseCommand(text);

  // -------------------------------------------------------------------------
  // No recognized command — open native Modal Bottom Sheet
  // -------------------------------------------------------------------------
  if (!command) {
    return [getFinancialServicesMenu()];
  }

  // -------------------------------------------------------------------------
  // help — opens native Modal Bottom Sheet
  // -------------------------------------------------------------------------
  if (command.type === 'help') {
    return [getFinancialServicesMenu()];
  }

  // -------------------------------------------------------------------------
  // signup
  // -------------------------------------------------------------------------
  if (command.type === 'signup') {
    const user = getUser(phone);
    if (user && user.onboardingStep >= 7) {
      return [
        {
          type: 'interactive_buttons',
          header: 'BMONI Banking',
          text: `✅ Account active for *${user.firstName || 'User'}*.\n\nSelect a quick action below:`,
          buttons: [
            { id: 'balance', title: 'Check Balance' },
            { id: 'get card', title: 'Virtual Card' },
            { id: 'help', title: 'Main Menu' },
          ],
        },
      ];
    }
    if (user && user.onboardingStep > 0) {
      updateUser(phone, { awaitingBvn: true });
      return [
        {
          type: 'interactive_buttons',
          header: 'Identity Verification',
          text: `Resuming account verification. Select a test persona or reply with your 11-digit BVN:`,
          buttons: [
            { id: '95888168924', title: 'Bunch Dillon' },
            { id: '22222222222', title: 'Samson Jabo' },
          ],
        },
      ];
    }

    return [
      {
        type: 'interactive_buttons',
        header: 'Welcome to BMONI',
        text: `Bank with stablecoins directly via WhatsApp.\n\nTo verify your identity, select a test persona below or reply with your 11-digit BVN:`,
        buttons: [
          { id: '95888168924', title: 'Bunch Dillon' },
          { id: '22222222222', title: 'Samson Jabo' },
        ],
      },
    ];
  }

  // -------------------------------------------------------------------------
  // bvn_input — handles BVN submission during onboarding
  // -------------------------------------------------------------------------
  if (command.type === 'bvn_input') {
    const existingUser = getUser(phone);

    if (existingUser && existingUser.onboardingStep >= 7) {
      return [getFinancialServicesMenu()];
    }

    const bvn = command.bvn;
    const result = await runOnboarding(phone, bvn);

    // BVN lookup failed — result.message is a string containing the error text
    const isBvnFailure =
      result.status === 'failed' &&
      typeof result.message === 'string' &&
      result.message.includes('BVN Identity Check Unsuccessful');

    if (isBvnFailure) {
      return [
        ...result.updates,
        {
          type: 'interactive_buttons',
          header: 'Identity Verification',
          text: result.message as string,
          buttons: [
            { id: '95888168924', title: 'Bunch Dillon' },
            { id: '22222222222', title: 'Samson Jabo' },
          ],
        },
      ];
    }

    // For all other cases (success or non-BVN failures), spread updates then append message
    return [...result.updates, result.message] as HandlerReply[];
  }

  // -------------------------------------------------------------------------
  // Commands below require completed onboarding
  // -------------------------------------------------------------------------
  const user = getUser(phone);
  if (!user || user.onboardingStep < 7) {
    return [
      {
        type: 'interactive_buttons',
        header: 'Verification Required',
        text: `Your BMONI account setup is incomplete.\n\nSelect a demo persona below to activate your wallet:`,
        buttons: [
          { id: '95888168924', title: 'Bunch Dillon' },
          { id: '22222222222', title: 'Samson Jabo' },
        ],
      },
    ];
  }

  const { bmoniUserId, smartWalletId } = user;
  if (!bmoniUserId || !smartWalletId) {
    return [`❌ [Error] Account data incomplete. Please select *signup* to configure.`];
  }

  // -------------------------------------------------------------------------
  // fund (Add Funds / Deposit)
  // -------------------------------------------------------------------------
  if (command.type === 'fund') {
    return [
      {
        type: 'interactive_buttons',
        header: 'Deposit & Add Funds',
        text: `*Add Funds to BMONI Wallet*\n\nTo deposit stablecoins (CNGN, USDC, USDB), send tokens to your Base Smart Wallet address:\n\n• *Network:* Base (Layer 2)\n• *Smart Wallet Address:*\n\`${smartWalletId}\`\n\nFunds will reflect instantly in your wallet balance.`,
        buttons: [
          { id: 'balance', title: 'Check Balance' },
          { id: 'get card', title: 'Virtual Card' },
          { id: 'help', title: 'View Options' },
        ],
      },
    ];
  }

  // -------------------------------------------------------------------------
  // send_info (Send Money Instructions)
  // -------------------------------------------------------------------------
  if (command.type === 'send_info') {
    return [
      {
        type: 'interactive_buttons',
        header: 'Send Money Instructions',
        text: `*Send Funds via WhatsApp*\n\nTo transfer CNGN to any contact or EVM address, send a message in any of these formats:\n\n• *By Phone:* \`send 500 to +2348000000001\`\n• *With Memo:* \`send 500 to +2348000000001 for lunch\`\n• *By EVM Address:* \`send 50 to 0x123... for coffee\``,
        buttons: [
          { id: 'balance', title: 'Check Balance' },
          { id: 'help', title: 'View Options' },
        ],
      },
    ];
  }

  // -------------------------------------------------------------------------
  // balance
  // -------------------------------------------------------------------------
  if (command.type === 'balance') {
    try {
      const balances = await bmoni.getBalances(bmoniUserId);
      if (!balances.length) {
        return [`*Account Balance*\n\nNo active wallets found. Please try again in a moment.`];
      }

      const lines = balances.map((b) => {
        if (b.error || b.balance === null) {
          return `• ${b.currency}: unavailable`;
        }
        const formatted = formatAmount(b.balance, b.currency);
        return `• *${b.currency}*: ${formatted}`;
      });

      const balanceImageUrl =
        process.env.BALANCE_IMAGE_URL ||
        `${process.env.PUBLIC_BASE_URL || ''}/public/balance.png.jpg`;

      return [
        {
          type: 'image',
          url: balanceImageUrl,
          caption: `*Current Balances*\n\n${lines.join('\n')}`,
        },
        {
          type: 'interactive_buttons',
          header: 'Wallet Balance',
          text: 'What would you like to do next?',
          buttons: [
            { id: 'get card', title: 'Virtual Card' },
            { id: 'history', title: 'History' },
            { id: 'help', title: 'View Options' },
          ],
        },
      ];
    } catch (err) {
      console.error('[Handler] Balance error:', err);
      return [`❌ [Error] Unable to retrieve account balances.`];
    }
  }

  // -------------------------------------------------------------------------
  // history
  // -------------------------------------------------------------------------
  if (command.type === 'history') {
    try {
      const txns = await bmoni.getTransactions(bmoniUserId, smartWalletId, 8);
      if (!txns.length) {
        return [`*Transaction History*\n\nNo transaction activity recorded.`];
      }

      const lines = txns.map((t) => {
        const sign = t.direction === 'credit' ? '+' : '-';
        const date = new Date(t.createdAt).toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'short',
        });
        const desc = t.narration || t.counterpartyName || t.type;
        return `• ${sign}${t.amount} ${t.currency} — ${desc} (${date})`;
      });

      return [`*Recent Transactions*\n\n${lines.join('\n')}`];
    } catch (err) {
      console.error('[Handler] History error:', err);
      return [`❌ [Error] Unable to retrieve transaction history.`];
    }
  }

  // -------------------------------------------------------------------------
  // rate
  // -------------------------------------------------------------------------
  if (command.type === 'rate') {
    try {
      const rate = await bmoni.getExchangeRate(bmoniUserId, command.from, command.to);
      const label = rate.displayLabel || `1 ${command.from} = ${rate.displayRate || rate.exchangeRate} ${command.to}`;
      return [`*Exchange Rate*\n\n*${label}*\n\n1 ${command.from} → ${command.to}`];
    } catch (err) {
      console.error('[Handler] Rate error:', err);
      return [`❌ [Error] Rate quote unavailable for ${command.from}/${command.to}.`];
    }
  }

  // -------------------------------------------------------------------------
  // send <amount> to <recipient> [for|note <memo>]
  // -------------------------------------------------------------------------
  if (command.type === 'send') {
    try {
      const isEvmAddress = command.recipient.startsWith('0x');
      let proposalId: string | undefined;
      let targetDesc = command.recipient;

      if (isEvmAddress) {
        targetDesc = `\`${command.recipient.slice(0, 8)}...${command.recipient.slice(-6)}\``;
        const sendRes = await bmoni.createProposal(bmoniUserId, smartWalletId, {
          type: 'TRANSFER',
          toAddress: command.recipient,
          amount: command.amount,
          currency: 'CNGN',
          description: command.note || 'Sent via BMONI WhatsApp',
        });
        proposalId = sendRes.proposal?.id || sendRes.id;
      } else {
        let recipientUserId: string;
        let recipientWallets: bmoni.SmartWallet[];

        try {
          const byPhone = await bmoni.getByPhone(command.recipient);
          recipientUserId = byPhone.bmoniUserId;
          recipientWallets = byPhone.wallets;
        } catch (err: unknown) {
          const axErr = err as { response?: { status?: number } };
          if (axErr.response?.status === 404) {
            return [`❌ [Error] Account not found for *${command.recipient}*.`];
          }
          throw err;
        }

        const recipientWallet = recipientWallets.find((w) => w.currency === 'CNGN' || w.currency === 'NGN');
        if (!recipientWallet) {
          return [`❌ [Error] Recipient lacks a valid CNGN wallet.`];
        }

        const sendCurrency = (recipientWallet.currency === 'NGN' || !recipientWallet.currency) ? 'CNGN' : recipientWallet.currency;

        const sendResult = (await bmoni.accountSend(bmoniUserId, {
          toUserId: recipientUserId,
          amount: command.amount,
          currency: sendCurrency,
          note: command.note || 'Sent via BMONI WhatsApp',
        })) as bmoni.SendResult & { proposal?: { id: string } };

        proposalId =
          sendResult.proposal?.id ||
          sendResult.data?.proposal?.id ||
          sendResult.data?.proposalId ||
          sendResult.proposalId;
      }

      if (!proposalId) {
        return [`❌ [Error] Transfer proposal creation failed.`];
      }

      try {
        await bmoni.approveProposal(bmoniUserId, proposalId);
      } catch (err: unknown) {
        console.log('[Handler] Proposal approve notice:', (err as Error).message);
      }

      let hashToSign: string | undefined;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const payload = await bmoni.getProposalSignPayload(bmoniUserId, proposalId);
          hashToSign = payload.signingPayloadHash || payload.hashToSign;
          if (hashToSign) break;
        } catch {
          // Wait 1.5s before retry
        }
        await new Promise((r) => setTimeout(r, 1500));
      }

      if (!hashToSign) {
        return [`❌ [Error] Unable to obtain authorization hash.`];
      }

      const privateKey = decryptPrivateKey(user.encryptedPrivateKey);
      const signature = signProposalHash(privateKey, hashToSign);
      await bmoni.signProposal(bmoniUserId, proposalId, signature);

      const memoText = command.note ? `\n• *Memo:* "${command.note}"` : '';
      return [
        `✅ *Transfer Authorized*\n\n• *Amount:* ${command.amount} CNGN\n• *Recipient:* ${targetDesc}${memoText}\n• *Status:* ✅ Submitted on-chain`,
      ];
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      console.error('[Handler] Send error:', axErr.response?.data || err);
      const msg = axErr.response?.data?.message || 'Transaction failed.';
      return [`❌ [Error] ${msg}`];
    }
  }

  // -------------------------------------------------------------------------
  // add bank <accountNumber> <bankCode>
  // -------------------------------------------------------------------------
  if (command.type === 'add_bank') {
    try {
      const verified = await bmoni.verifyNigerianAccount(
        bmoniUserId,
        command.accountNumber,
        command.bankCode,
      );

      const added = await bmoni.createNigerianWithdrawalAccount(bmoniUserId, {
        accountNumber: verified.accountNumber,
        bankCode: verified.bankCode,
        bankName: verified.bankName,
        accountHolderName: verified.accountName,
      });

      return [
        `✅ *Bank Account Registered*\n\n• *Account Holder:* ${added.accountName || verified.accountName}\n• *Bank:* ${added.bankName || verified.bankName}\n• *Account Number:* \`${verified.accountNumber}\`\n\nYou can now use *withdraw <amount> to bank* to execute payouts.`,
      ];
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      console.error('[Handler] Add bank error:', axErr.response?.data || err);
      const msg = axErr.response?.data?.message || 'Verification failed. Select *banks* to view valid bank codes.';
      return [`❌ [Error] ${msg}`];
    }
  }

  // -------------------------------------------------------------------------
  // list_banks (banks)
  // -------------------------------------------------------------------------
  if (command.type === 'list_banks') {
    try {
      const banks = await bmoni.listNigerianBanks(bmoniUserId);
      if (!banks.length) return [`[Info] No supported banks available.`];
      const list = banks
        .slice(0, 10)
        .map((b) => `• *${b.bankName}*: \`${b.bankCode}\``)
        .join('\n');
      return [
        `*Supported Nigerian Banks (CBN Codes)*\n\n${list}\n\nTo register an account, send:\n*add bank <accountNumber> <bankCode>*`,
      ];
    } catch (err) {
      console.error('[Handler] List banks error:', err);
      return [`❌ [Error] Failed to fetch bank directory.`];
    }
  }

  // -------------------------------------------------------------------------
  // issue_card (get card)
  // -------------------------------------------------------------------------
  if (command.type === 'issue_card') {
    try {
      const res = await bmoni.createCard(bmoniUserId, {
        cardName: 'WhatsApp Card',
        cardColor: '#00E676',
        currency: 'NGN',
        type: 'virtual',
        smartWalletId,
        nin: '63184876213',
      });

      const proposalId = res.proposalId;
      if (proposalId) {
        try {
          await bmoni.approveProposal(bmoniUserId, proposalId);
          const payload = await bmoni.getProposalSignPayload(bmoniUserId, proposalId);
          if (payload.signingPayloadHash) {
            const privateKey = decryptPrivateKey(user.encryptedPrivateKey);
            const signature = signProposalHash(privateKey, payload.signingPayloadHash);
            await bmoni.signProposal(bmoniUserId, proposalId, signature);
          }
        } catch (err) {
          console.log('[Handler] Card proposal sign notice:', err);
        }
      }

      return [
        `✅ *Virtual Card Created*\n\n• *Name:* WhatsApp Card\n• *Type:* Virtual Visa/Mastercard\n• *Currency:* NGN\n• *Status:* ✅ Active\n\nFunded by Base Smart Wallet. Select *my card* to manage.`,
      ];
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      console.error('[Handler] Issue card error:', axErr.response?.data || err);
      const msg = axErr.response?.data?.message || 'Card creation failed.';
      return [`❌ [Error] ${msg}`];
    }
  }

  // -------------------------------------------------------------------------
  // get_card (my card)
  // -------------------------------------------------------------------------
  if (command.type === 'get_card') {
    try {
      const cards = await bmoni.listSmartWalletCards(bmoniUserId, smartWalletId);
      if (!cards.length) {
        return [
        `*Virtual Cards*\n\nNo active cards on file.\n\nType *get card* to issue a Virtual Dollar Card.`,
      ];
      }

      const list = cards
        .map(
          (c) =>
            `• *${c.cardName || 'Virtual Card'}* (${c.currency})\n  Status: ${c.status} | Type: ${c.type || 'virtual'}`,
        )
        .join('\n\n');

      return [`*Active Virtual Cards*\n\n${list}`];
    } catch (err) {
      console.error('[Handler] Get card error:', err);
      return [`❌ [Error] Failed to fetch cards.`];
    }
  }

  // -------------------------------------------------------------------------
  // withdraw <amount> to bank
  // -------------------------------------------------------------------------
  if (command.type === 'withdraw') {
    try {
      const bankAccounts = await bmoni.getNigerianBankAccounts(bmoniUserId);
      if (!bankAccounts.length) {
        return [
          `*Withdrawal Required Action*\n\nNo registered bank account found.\n\nSend: *add bank <accountNumber> <bankCode>*\ne.g. \`add bank 0123456789 058\``,
        ];
      }

      const bankAccount = bankAccounts[0];

      const result = await bmoni.withdrawWalletNigeria(bmoniUserId, {
        sourceSmartWalletId: smartWalletId,
        bankAccountId: bankAccount.id,
        fromAmount: command.amount,
      });

      let hashToSign: string | undefined;
      const proposalId = result.proposalId;

      if (result.signPayload?.hashToSign) {
        hashToSign = result.signPayload.hashToSign;
      } else if (result.signPayloadPending) {
        await new Promise((r) => setTimeout(r, 3000));
        const payload = await bmoni.getProposalSignPayload(bmoniUserId, proposalId);
        hashToSign = payload.hashToSign;
      }

      if (!hashToSign) {
        return [`❌ [Error] Signing payload unavailable.`];
      }

      const privateKey = decryptPrivateKey(user.encryptedPrivateKey);
      const signature = signProposalHash(privateKey, hashToSign);
      await bmoni.signProposal(bmoniUserId, proposalId, signature);

      return [
        `✅ *Withdrawal Initiated*\n\n• *Amount:* ${command.amount} CNGN\n• *Bank:* ${bankAccount.bankName}\n• *Account:* \`${bankAccount.accountNumber}\`\n• *Account Holder:* ${bankAccount.accountName || 'Holder'}\n• *Status:* ✅ Payout processing`,
      ];
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      console.error('[Handler] Withdraw error:', axErr.response?.data || err);
      const msg = axErr.response?.data?.message || 'Withdrawal failed.';
      return [`❌ [Error] ${msg}`];
    }
  }

  return [getFinancialServicesMenu()];
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${amount} ${currency}`;

  const symbols: Record<string, string> = {
    CNGN: '₦',
    USDB: '$',
    USD: '$',
    NGN: '₦',
    EURe: '€',
    GBPe: '£',
  };
  const symbol = symbols[currency] || '';
  return `${symbol}${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
