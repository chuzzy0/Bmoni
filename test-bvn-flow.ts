import { handleMessage } from './src/handler.js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function runBvnFlowTest() {
  // Reset local users store for clean test
  const dbPath = path.join(process.cwd(), 'data', 'users.json');
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  const phone = '+2348000000000';

  console.log('==============================================');
  console.log('1. TEST: User sends "signup"');
  console.log('==============================================');
  const r1 = await handleMessage(phone, 'signup');
  console.log(r1.join('\n\n'));

  console.log('\n==============================================');
  console.log('2. TEST: User replies with invalid BVN ("12345678901")');
  console.log('==============================================');
  const r2 = await handleMessage(phone, '12345678901');
  console.log(r2.join('\n\n'));

  console.log('\n==============================================');
  console.log('3. TEST: User replies with valid BVN ("95888168924" - Bunch Dillon)');
  console.log('==============================================');
  const r3 = await handleMessage(phone, '95888168924');
  console.log(r3.join('\n\n'));
}

runBvnFlowTest().catch(console.error);
