import { handleMessage } from './src/handler.js';
import 'dotenv/config';

async function testOnboardSamson() {
  console.log('--- Onboarding Persona 2 (Samson Jabo: +2348000000001) ---');
  const samsonPhone = '+2348000000001';
  const replies = await handleMessage(samsonPhone, '2');
  console.log('\nSAMSON ONBOARDING REPLIES:\n');
  replies.forEach((r, i) => console.log(`[Msg ${i + 1}]\n${r}\n`));
}

testOnboardSamson().catch(console.error);
