import 'dotenv/config';
import express, { Request, Response } from 'express';
import axios from 'axios';
import {
  extractIncomingMessage,
  sendMessage,
  sendImage,
  sendMessages,
  markAsRead,
  sendTypingIndicator,
  sendInteractiveButtons,
  sendInteractiveList,
  updateWhatsAppProfilePicture,
  getWhatsAppBusinessProfile,
} from './whatsapp.js';
import { handleMessage, HandlerReply } from './handler.js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: ['image/png', 'image/jpeg', 'image/jpg'], limit: '10mb' }));
app.use('/public', express.static('public'));

const PORT = parseInt(process.env.PORT || '3000', 10);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// WhatsApp Profile & Logo API
// ---------------------------------------------------------------------------

app.get('/api/whatsapp/profile', async (_req: Request, res: Response) => {
  const profile = await getWhatsAppBusinessProfile();
  if (!profile) {
    return res.status(400).json({
      success: false,
      error: 'Failed to fetch WhatsApp Business Profile. Ensure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are valid.',
    });
  }
  return res.json({ success: true, profile });
});

app.post('/api/whatsapp/profile-picture', async (req: Request, res: Response) => {
  try {
    let imageBuffer: Buffer | null = null;
    let mimeType = 'image/png';

    // Option A: Raw Binary Upload (Content-Type: image/png or image/jpeg)
    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      imageBuffer = req.body;
      mimeType = (req.headers['content-type'] as string) || 'image/png';
    }
    // Option B: JSON payload ({ image: "<base64>" } or { imageUrl: "https://..." })
    else if (req.body && typeof req.body === 'object') {
      const { image, imageUrl, mimeType: userMime } = req.body as {
        image?: string;
        imageUrl?: string;
        mimeType?: string;
      };

      if (imageUrl) {
        const downloadRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        imageBuffer = Buffer.from(downloadRes.data);
        mimeType = userMime || (downloadRes.headers['content-type'] as string) || 'image/png';
      } else if (image) {
        let base64Data = image;
        if (image.startsWith('data:')) {
          const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (matches) {
            mimeType = userMime || matches[1];
            base64Data = matches[2];
          }
        }
        if (userMime) mimeType = userMime;
        imageBuffer = Buffer.from(base64Data, 'base64');
      }
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          'No image data provided. Please send a JSON body with { image: "<base64_string>" } or { imageUrl: "https://..." }, or upload a raw binary image (image/png or image/jpeg).',
      });
    }

    const result = await updateWhatsAppProfilePicture(imageBuffer, mimeType);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (err: unknown) {
    console.error('[API] Profile picture endpoint error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({
      success: false,
      error: `Failed to process profile picture update: ${msg}`,
    });
  }
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
