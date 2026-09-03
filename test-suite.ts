import { handleMessage } from './src/handler.js';
import 'dotenv/config';

async function runFullCommandSuite() {
  const phone = '+2348000000000';

  console.log('====================================');
  console.log('1. TEST: help');
  console.log('====================================');
  console.log((await handleMessage(phone, 'help')).join('\n'));

  console.log('\n====================================');
  console.log('2. TEST: balance');
  console.log('====================================');
  console.log((await handleMessage(phone, 'balance')).join('\n'));

  console.log('\n====================================');
  console.log('3. TEST: rate USD NGN');
  console.log('====================================');
  console.log((await handleMessage(phone, 'rate USD NGN')).join('\n'));

  console.log('\n====================================');
  console.log('4. TEST: history');
  console.log('====================================');
  console.log((await handleMessage(phone, 'history')).join('\n'));

  console.log('\n====================================');
  console.log('5. TEST: send 50 to +2348000000001 (Samson Jabo)');
  console.log('====================================');
  console.log((await handleMessage(phone, 'send 50 to +2348000000001')).join('\n'));

  console.log('\n====================================');
  console.log('6. TEST: withdraw 10 to bank');
  console.log('====================================');
  console.log((await handleMessage(phone, 'withdraw 10 to bank')).join('\n'));
}

runFullCommandSuite().catch(console.error);
