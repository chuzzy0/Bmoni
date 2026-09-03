import 'dotenv/config';
import express, { Request, Response } from 'express';
import {
  extractIncomingMessage,
  sendMessage,
  sendImage,
  sendMessages,
  markAsRead,
  sendTypingIndicator,
  sendInteractiveButtons,
  sendInteractiveList,
} from './whatsapp.js';
import { handleMessage, HandlerReply } from './handler.js';

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT || '3000', 10);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// WhatsApp Webhook Verification (GET)
// Meta sends this when you register the webhook URL in the developer portal.
// We must echo back hub.challenge when hub.verify_token matches.
// ---------------------------------------------------------------------------

app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Webhook] Verification successful');
    res.status(200).send(challenge as string);
  } else {
    console.warn('[Webhook] Verification failed — token mismatch:', token);
    res.sendStatus(403);
  }
});

// ---------------------------------------------------------------------------
// WhatsApp Webhook (POST)
// Meta sends incoming messages here. We MUST respond 200 immediately —
// Meta retries if we don't respond within ~5s. Processing happens async.
// ---------------------------------------------------------------------------

app.post('/webhook', (req: Request, res: Response) => {
  // Always acknowledge immediately so Meta doesn't retry
  res.sendStatus(200);

  // Process asynchronously
  processWebhook(req.body).catch((err) => {
    console.error('[Webhook] Unhandled error:', err);
  });
});

async function processWebhook(body: unknown): Promise<void> {
  const incoming = extractIncomingMessage(body);
  if (!incoming) {
    // Status update or non-text message — silently ignore
    return;
  }

  const { phone, text, messageId } = incoming;
  console.log(`[Webhook] Message from ${phone}: "${text}" (id: ${messageId})`);

  // Trigger Blue Double Ticks immediately
  markAsRead(messageId).catch(() => {});

  // Show typing animation while processing
  sendTypingIndicator(phone).catch(() => {});
  await new Promise((r) => setTimeout(r, 500));

  try {
    const replies: HandlerReply[] = await handleMessage(phone, text);
    for (const reply of replies) {
      if (typeof reply === 'string') {
        await sendMessage(phone, reply);
      } else if (reply.type === 'image') {
        await sendImage(phone, reply.url, reply.caption);
      } else if (reply.type === 'interactive_buttons') {
        await sendInteractiveButtons(phone, reply.text, reply.buttons, reply.header);
      } else if (reply.type === 'interactive_list') {
        await sendInteractiveList(
          phone,
          reply.text,
          reply.buttonTitle,
          reply.sections,
          reply.header,
          reply.footer,
        );
      }
      await new Promise((r) => setTimeout(r, 350));
    }
  } catch (err) {
    console.error(`[Webhook] Error handling message from ${phone}:`, err);
    try {
      await sendMessage(phone, `[Error] Something went wrong on our end. Please try again.`);
    } catch {
      // Swallow secondary error
    }
  }
}

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`\n🚀 BMONI WhatsApp Bot running on port ${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   Webhook: http://localhost:${PORT}/webhook`);
  console.log(`\n   ngrok tunnel: ngrok http ${PORT}\n`);
});
