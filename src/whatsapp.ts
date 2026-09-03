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

// ---------------------------------------------------------------------------
// Meta Resumable Upload API & WhatsApp Business Profile Picture
// ---------------------------------------------------------------------------

export interface ProfilePictureUpdateResult {
  success: boolean;
  handle?: string;
  message?: string;
  error?: string;
}

export interface WhatsAppBusinessProfile {
  messaging_product?: string;
  profile_picture_url?: string;
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  vertical?: string;
  websites?: string[];
}

export async function getWhatsAppBusinessProfile(): Promise<WhatsAppBusinessProfile | null> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId || !token) return null;

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_profile?fields=profile_picture_url,about,address,description,email,vertical,websites`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profile = res.data?.data?.[0] || res.data;
    return profile || null;
  } catch (err: unknown) {
    const axErr = err as { response?: { data?: unknown } };
    console.error('[WhatsApp] Get business profile error:', axErr.response?.data || err);
    return null;
  }
}

export async function updateWhatsAppProfilePicture(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<ProfilePictureUpdateResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId || !token) {
    return {
      success: false,
      error: 'Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN environment variable.',
    };
  }

  // 1. Validate MIME type
  const allowedMimeTypes: Record<string, string> = {
    'image/jpeg': 'image/jpeg',
    'image/png': 'image/png',
    'image/jpg': 'image/jpeg',
  };
  const normalizedMime = allowedMimeTypes[mimeType.toLowerCase()];
  if (!normalizedMime) {
    return {
      success: false,
      error: `Invalid image MIME type '${mimeType}'. Allowed formats: image/png, image/jpeg, image/jpg`,
    };
  }

  // 2. Validate Image Size (Max 5MB = 5 * 1024 * 1024 bytes)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (imageBuffer.length > MAX_SIZE) {
    const sizeMb = (imageBuffer.length / (1024 * 1024)).toFixed(2);
    return {
      success: false,
      error: `Image size (${sizeMb} MB) exceeds maximum allowed limit of 5.00 MB.`,
    };
  }

  if (imageBuffer.length === 0) {
    return {
      success: false,
      error: 'Image file buffer is empty.',
    };
  }

  try {
    // -----------------------------------------------------------------------
    // Step 1: Create Resumable Upload Session on Meta Graph API
    // Endpoint: POST https://graph.facebook.com/v21.0/app/uploads
    // -----------------------------------------------------------------------
    let uploadSessionId: string | undefined;

    try {
      const sessionRes = await axios.post(
        `https://graph.facebook.com/v21.0/app/uploads`,
        null,
        {
          params: {
            file_length: imageBuffer.length,
            file_type: normalizedMime,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      uploadSessionId = sessionRes.data?.id;
    } catch (err: unknown) {
      // Fallback: If app/uploads requires explicit App ID, fetch app ID via /me
      const meRes = await axios.get(`https://graph.facebook.com/v21.0/me?fields=id`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appId = meRes.data?.id;
      if (appId) {
        const sessionRes = await axios.post(
          `https://graph.facebook.com/v21.0/${appId}/uploads`,
          null,
          {
            params: {
              file_length: imageBuffer.length,
              file_type: normalizedMime,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        uploadSessionId = sessionRes.data?.id;
      } else {
        throw err;
      }
    }

    if (!uploadSessionId) {
      return {
        success: false,
        error: 'Failed to initialize Meta resumable upload session.',
      };
    }

    // -----------------------------------------------------------------------
    // Step 2: Upload File Content to Resumable Session
    // Endpoint: POST https://graph.facebook.com/v21.0/{upload_session_id}
    // Returns: { h: "profile_picture_handle_string" }
    // -----------------------------------------------------------------------
    const binaryUploadRes = await axios.post(
      `https://graph.facebook.com/v21.0/${uploadSessionId}`,
      imageBuffer,
      {
        headers: {
          Authorization: `OAuth ${token}`,
          file_offset: 0,
          'Content-Type': 'application/octet-stream',
        },
      },
    );

    const profilePictureHandle = binaryUploadRes.data?.h;
    if (!profilePictureHandle) {
      return {
        success: false,
        error: 'Meta file upload completed but no profile_picture_handle was returned.',
      };
    }

    // -----------------------------------------------------------------------
    // Step 3: Update WhatsApp Business Profile Picture
    // Endpoint: POST https://graph.facebook.com/v21.0/{phone_number_id}/whatsapp_business_profile
    // Body: { messaging_product: "whatsapp", profile_picture_handle: handle }
    // -----------------------------------------------------------------------
    const profileRes = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_profile`,
      {
        messaging_product: 'whatsapp',
        profile_picture_handle: profilePictureHandle,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (profileRes.data?.success) {
      return {
        success: true,
        handle: profilePictureHandle,
        message: 'WhatsApp Business Profile picture updated successfully.',
      };
    }

    return {
      success: false,
      error: 'WhatsApp Business Profile API did not return success=true.',
    };
  } catch (err: unknown) {
    const axErr = err as {
      response?: {
        data?: {
          error?: {
            message?: string;
            type?: string;
            code?: number;
            error_subcode?: number;
          };
        };
      };
    };

    const metaErr = axErr.response?.data?.error;
    let errorMessage = err instanceof Error ? err.message : String(err);

    if (metaErr?.message) {
      if (metaErr.code === 190 || metaErr.error_subcode === 463) {
        errorMessage = 'Meta access token has expired. Please refresh WHATSAPP_ACCESS_TOKEN in .env file.';
      } else {
        errorMessage = `Meta Graph API Error: ${metaErr.message} (Code ${metaErr.code})`;
      }
    }

    console.error('[WhatsApp] Profile picture upload error details:', axErr.response?.data || err);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

