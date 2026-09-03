import { handleMessage } from './src/handler.js';
import 'dotenv/config';

async function runUxTest() {
  const phone = '+2347047148774';

  console.log('==============================================');
  console.log('1. TEST: Unrecognized message (shows interactive buttons)');
  console.log('==============================================');
  console.log(JSON.stringify(await handleMessage(phone, 'hello bot'), null, 2));

  console.log('\n==============================================');
  console.log('2. TEST: Invalid BVN (shows rich professional error + buttons)');
  console.log('==============================================');
  console.log(JSON.stringify(await handleMessage(phone, '12345678901'), null, 2));

  console.log('\n==============================================');
  console.log('3. TEST: Help menu (shows header + buttons)');
  console.log('==============================================');
  console.log(JSON.stringify(await handleMessage(phone, 'help'), null, 2));
}

runUxTest().catch(console.error);
