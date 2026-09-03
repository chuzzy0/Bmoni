import { handleMessage } from './src/handler.js';
import 'dotenv/config';

async function runFeatureSuite() {
  const phone = '+2348000000000';

  console.log('==============================================');
  console.log('1. TEST: help menu');
  console.log('==============================================');
  console.log((await handleMessage(phone, 'help')).join('\n'));

  console.log('\n==============================================');
  console.log('2. TEST: send 50 to +2348000000001 for lunch (Phone + Memo)');
  console.log('==============================================');
  console.log((await handleMessage(phone, 'send 50 to +2348000000001 for lunch')).join('\n'));

  console.log('\n==============================================');
  console.log('3. TEST: send 10 to 0xe7b1e4c0d790B66360cf66Dd9fbC1e0E3B2dd5d6 for coffee (Raw EVM + Memo)');
  console.log('==============================================');
  console.log((await handleMessage(phone, 'send 10 to 0xe7b1e4c0d790B66360cf66Dd9fbC1e0E3B2dd5d6 for coffee')).join('\n'));

  console.log('\n==============================================');
  console.log('4. TEST: banks (List supported Nigerian banks)');
  console.log('==============================================');
  console.log((await handleMessage(phone, 'banks')).join('\n'));

  console.log('\n==============================================');
  console.log('5. TEST: add bank 0123456789 058 (NUBAN Verification & Registration)');
  console.log('==============================================');
  console.log((await handleMessage(phone, 'add bank 0123456789 058')).join('\n'));

  console.log('\n==============================================');
  console.log('6. TEST: withdraw 10 to bank (Cash out to registered bank)');
  console.log('==============================================');
  console.log((await handleMessage(phone, 'withdraw 10 to bank')).join('\n'));

  console.log('\n==============================================');
  console.log('7. TEST: get card (Issue Virtual Dollar Card)');
  console.log('==============================================');
  console.log((await handleMessage(phone, 'get card')).join('\n'));

  console.log('\n==============================================');
  console.log('8. TEST: my card (View Virtual Cards)');
  console.log('==============================================');
  console.log((await handleMessage(phone, 'my card')).join('\n'));
}

runFeatureSuite().catch(console.error);
