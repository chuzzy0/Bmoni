import { handleMessage } from './src/handler.js';
import 'dotenv/config';

async function testOnboarding() {
  console.log('--- TEST ONBOARDING: Selecting Persona 1 (Bunch Dillon) ---');
  const testPhone = '+2348000000000';
  const replies = await handleMessage(testPhone, '1');
  console.log('\nONBOARDING REPLIES:\n');
  replies.forEach((r, i) => console.log(`[Msg ${i + 1}]\n${r}\n`));
}

testOnboarding().catch(console.error);
