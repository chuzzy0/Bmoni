// ---------------------------------------------------------------------------
// Command types
// ---------------------------------------------------------------------------

export type Command =
  | { type: 'signup' }
  | { type: 'bvn_input'; bvn: string }
  | { type: 'balance' }
  | { type: 'send'; amount: string; recipient: string; note?: string }
  | { type: 'send_info' }
  | { type: 'fund' }
  | { type: 'history' }
  | { type: 'rate'; from: string; to: string }
  | { type: 'withdraw'; amount: string }
  | { type: 'add_bank'; accountNumber: string; bankCode: string }
  | { type: 'list_banks' }
  | { type: 'issue_card' }
  | { type: 'get_card' }
  | { type: 'help' };

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

export function parseCommand(text: string): Command | null {
  const lower = text.toLowerCase().trim();
  const digitsOnly = text.replace(/\D/g, '');

  // Shortcuts: 1 for Bunch Dillon, 2 for Samson Jabo
  if (lower === '1') return { type: 'bvn_input', bvn: '95888168924' };
  if (lower === '2') return { type: 'bvn_input', bvn: '22222222222' };

  // 11-digit BVN input
  if (digitsOnly.length === 11 && !lower.startsWith('add') && !lower.startsWith('send')) {
    return { type: 'bvn_input', bvn: digitsOnly };
  }

  // Signup variants
  if (['signup', 'sign up', 'start', 'hi', 'hello', 'hey', 'register'].includes(lower)) {
    return { type: 'signup' };
  }

  // Balance
  if (['balance', 'bal', 'wallet', 'my balance'].includes(lower)) {
    return { type: 'balance' };
  }

  // Fund / Add Money
  if (['fund', 'add money', 'deposit', 'topup', 'top up', 'fund wallet', 'receive', 'add_money'].includes(lower)) {
    return { type: 'fund' };
  }

  // Send Money Info
  if (['send money', 'transfer', 'transfer funds', 'send cngn', 'send funds', 'send_money'].includes(lower)) {
    return { type: 'send_info' };
  }

  // History
  if (['history', 'transactions', 'txns', 'tx'].includes(lower)) {
    return { type: 'history' };
  }

  // Help / Menu / Options
  if (['help', '?', 'commands', 'menu', 'options', 'main menu', 'view options'].includes(lower)) {
    return { type: 'help' };
  }

  // Virtual card shortcuts
  if (['get card', 'create card', 'issue card', 'new card', 'buy card'].includes(lower)) {
    return { type: 'issue_card' };
  }
  if (['my card', 'cards', 'card', 'view card', 'show card'].includes(lower)) {
    return { type: 'get_card' };
  }

  // Banks listing
  if (['banks', 'list banks', 'supported banks'].includes(lower)) {
    return { type: 'list_banks' };
  }

  // add bank <accountNumber> <bankCode>
  const addBankMatch = lower.match(/^add\s+bank\s+(\d{10})\s+(\d{3,6})$/i);
  if (addBankMatch) {
    return {
      type: 'add_bank',
      accountNumber: addBankMatch[1],
      bankCode: addBankMatch[2],
    };
  }

  // send <amount> to <recipient> [for|note <memo>]
  const sendMatch = lower.match(/^send\s+([\d.]+)\s+to\s+(0x[a-f0-9]{40}|\+?[\d\s-]+)(?:\s+(?:for|note)\s+(.+))?$/i);
  if (sendMatch) {
    const amount = sendMatch[1];
    const rawRecipient = sendMatch[2].trim();
    const note = sendMatch[3]?.trim();

    let recipient = rawRecipient;
    if (!rawRecipient.startsWith('0x')) {
      const rawPhone = rawRecipient.replace(/[\s-]/g, '');
      recipient = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
    }

    return { type: 'send', amount, recipient, note };
  }

  // rate <FROM> <TO>
  const rateMatch = lower.match(/^rate\s+([a-z]+)\s+([a-z]+)$/i);
  if (rateMatch) {
    return { type: 'rate', from: rateMatch[1].toUpperCase(), to: rateMatch[2].toUpperCase() };
  }

  // withdraw <amount> to bank
  const withdrawMatch = lower.match(/^withdraw\s+([\d.]+)\s+to\s+bank$/);
  if (withdrawMatch) {
    return { type: 'withdraw', amount: withdrawMatch[1] };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Help text (Clean corporate typography)
// ---------------------------------------------------------------------------

export const HELP_TEXT = `*BMONI Embedded Banking*

Available Instructions:

• *send <amount> to <phone|address> [memo]* — Transfer funds
• *fund* — View deposit wallet address
• *balance* — Check wallet & CNGN balances
• *get card* — Issue Virtual Dollar Card
• *my card* — View active virtual cards
• *add bank <accountNumber> <bankCode>* — Register bank account
• *banks* — List supported Nigerian banks & CBN codes
• *withdraw <amount> to bank* — Cash out to Nigerian bank
• *history* — View recent transaction history
• *rate USD NGN* — Check live exchange rate
• *help* — Open financial services menu

_Powered by BMONI Embedded_`;
