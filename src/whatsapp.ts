import axios from 'axios';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IncomingMessage {
  phone: string;   // sender E.164
  text: string;    // message body
  messageId: string;
}

export interface ListSection {
  title: string;
  rows: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

// ---------------------------------------------------------------------------
// Parse incoming webhook payload (supports text, interactive buttons, and list replies)
// ---------------------------------------------------------------------------

export function extractIncomingMessage(body: unknown): IncomingMessage | null {
  try {
    const b = body as Record<string, unknown>;
    const entry = (b.entry as unknown[])?.[0] as Record<string, unknown>;
    const change = (entry?.changes as unknown[])?.[0] as Record<string, unknown>;
    const value = change?.value as Record<string, unknown>;
    const messages = value?.messages as unknown[];
    if (!messages?.length) return null;

    const msg = messages[0] as Record<string, unknown>;
    const type = msg.type as string;
    const rawPhone = msg.from as string;
    const messageId = msg.id as string;

    let text = '';
    if (type === 'text') {
      text = (msg.text as Record<string, string>)?.body?.trim() ?? '';
    } else if (type === 'interactive') {
      const interactive = msg.interactive as Record<string, unknown>;
      const buttonReply = interactive?.button_reply as { id?: string; title?: string };
      const listReply = interactive?.list_reply as { id?: string; title?: string };
      text = buttonReply?.id || buttonReply?.title || listReply?.id || listReply?.title || '';
    } else {
      return null;
    }

    if (!rawPhone || !text) return null;
    const phone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
    return { phone, text, messageId };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mark message as read (Triggers Blue Ticks 🔵 in WhatsApp)
// ---------------------------------------------------------------------------

export async function markAsRead(messageId: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId || !token || !messageId) return;

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  try {
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log('[WhatsApp] Mark as read notice:', msg);
  }
}

// ---------------------------------------------------------------------------
// Send Typing Indicator (shows animated "..." bubble in WhatsApp)
// ---------------------------------------------------------------------------

export async function sendTypingIndicator(toPhone: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId || !token) return;

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const recipient = toPhone.replace(/\D/g, '');

  try {
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'action',
        action: { typing: 'on' },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch {
    // Typing indicator is best-effort — silently ignore if unsupported
  }
}

// ---------------------------------------------------------------------------
// Send a plain text message via WhatsApp Cloud API
// ---------------------------------------------------------------------------

export async function sendMessage(toPhone: string, text: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId || !token) {
    console.error('[WhatsApp] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN');
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const recipient = toPhone.replace(/\D/g, '');

  try {
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: unknown } };
    console.error('[WhatsApp] Failed to send message:', JSON.stringify(axiosErr.response?.data ?? err, null, 2));
  }
}

// ---------------------------------------------------------------------------
// Send an image via WhatsApp Cloud API
// ---------------------------------------------------------------------------

export async function sendImage(toPhone: string, imageUrl: string, caption?: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId || !token) {
    console.error('[WhatsApp] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN');
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const recipient = toPhone.replace(/\D/g, '');

  try {
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'image',
        image: {
          link: imageUrl,
          ...(caption ? { caption } : {}),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: unknown } };
    console.error('[WhatsApp] Failed to send image:', JSON.stringify(axiosErr.response?.data ?? err, null, 2));
  }
}

// ---------------------------------------------------------------------------
// Send Interactive Quick Reply Buttons
// ---------------------------------------------------------------------------

export async function sendInteractiveButtons(
  toPhone: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>,
  headerText?: string,
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId || !token) {
    return sendMessage(toPhone, bodyText);
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const recipient = toPhone.replace(/\D/g, '');

  const formattedButtons = buttons.slice(0, 3).map((btn) => ({
    type: 'reply',
    reply: {
      id: btn.id,
      title: btn.title.slice(0, 20),
    },
  }));

  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: { buttons: formattedButtons },
    },
  };

  if (headerText) {
    (payload.interactive as Record<string, unknown>).header = {
      type: 'text',
      text: headerText.slice(0, 60),
    };
  }

  try {
    await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: unknown } };
    console.error('[WhatsApp] Failed to send interactive buttons:', JSON.stringify(axiosErr.response?.data ?? err, null, 2));
    await sendMessage(toPhone, bodyText);
  }
}

// ---------------------------------------------------------------------------
// Send Interactive List Message (Renders a native Modal Bottom Sheet in WhatsApp)
// ---------------------------------------------------------------------------

export async function sendInteractiveList(
  toPhone: string,
  bodyText: string,
  buttonTitle: string,
  sections: ListSection[],
  headerText?: string,
  footerText?: string,
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId || !token) {
    return sendMessage(toPhone, bodyText);
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const recipient = toPhone.replace(/\D/g, '');

  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonTitle.slice(0, 20),
        sections: sections.map((s) => ({
          title: s.title.slice(0, 24),
          rows: s.rows.slice(0, 10).map((r) => ({
            id: r.id,
            title: r.title.slice(0, 24),
            description: r.description ? r.description.slice(0, 72) : undefined,
          })),
        })),
      },
    },
  };

  if (headerText) {
    (payload.interactive as Record<string, unknown>).header = {
      type: 'text',
      text: headerText.slice(0, 60),
    };
  }

  if (footerText) {
    (payload.interactive as Record<string, unknown>).footer = {
      text: footerText.slice(0, 60),
    };
  }

  try {
    await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: unknown } };
    console.error('[WhatsApp] Failed to send interactive list:', JSON.stringify(axiosErr.response?.data ?? err, null, 2));
    await sendMessage(toPhone, bodyText);
  }
}

// ---------------------------------------------------------------------------
// Send multiple messages in sequence
// ---------------------------------------------------------------------------

export async function sendMessages(toPhone: string, texts: string[]): Promise<void> {
  for (const text of texts) {
    await sendMessage(toPhone, text);
    await new Promise((r) => setTimeout(r, 300));
  }
}
