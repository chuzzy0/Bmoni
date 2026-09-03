import 'dotenv/config';
import axios from 'axios';

async function testProfilePictureApi() {
  const PORT = process.env.PORT || 3001;
  const baseUrl = `http://localhost:${PORT}`;

  console.log('--- Testing WhatsApp Profile API ---');

  // 1. Test GET /api/whatsapp/profile
  try {
    const res = await axios.get(`${baseUrl}/api/whatsapp/profile`);
    console.log('GET /api/whatsapp/profile status:', res.status, res.data);
  } catch (err: any) {
    console.log('GET /api/whatsapp/profile error:', err.response?.data || err.message);
  }

  // 2. Test POST /api/whatsapp/profile-picture with a 1x1 PNG base64 sample
  const samplePngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  try {
    const res = await axios.post(`${baseUrl}/api/whatsapp/profile-picture`, {
      image: samplePngBase64,
      mimeType: 'image/png',
    });
    console.log('POST /api/whatsapp/profile-picture status:', res.status, res.data);
  } catch (err: any) {
    console.log('POST /api/whatsapp/profile-picture error:', err.response?.data || err.message);
  }
}

testProfilePictureApi();
