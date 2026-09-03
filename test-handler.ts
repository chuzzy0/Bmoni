import { handleMessage } from './src/handler.js';
import 'dotenv/config';

async function test() {
  console.log('--- TEST 1: help ---');
  const helpReply = await handleMessage('+2348000000000', 'help');
  console.log('HELP REPLY:\n', helpReply.join('\n---\n'));

  console.log('\n--- TEST 2: signup ---');
  const signupReply = await handleMessage('+2348000000000', 'signup');
  console.log('SIGNUP REPLY:\n', signupReply.join('\n---\n'));

  console.log('\n--- TEST 3: rate USD NGN ---');
  // Need a temporary user for rate check or test as onboarded user
  // Let's test command parser directly first
}

test().catch(console.error);
