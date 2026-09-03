/**
 * generate-fixtures.mjs
 * Creates the three placeholder JPEG files needed for KYC document uploads.
 * Run once: node generate-fixtures.mjs
 *
 * These are the minimum valid JPEG bytes (a 1x1 pixel white JPEG).
 * They satisfy multipart/form-data upload requirements in the BMONI sandbox.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

// Minimum valid JPEG padded to 20KB to pass file size validation (>2KB requirement)
const baseJpeg = Buffer.from(
  'ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707' +
  '07090a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c' +
  '2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100' +
  'ffc4001f0000010501010101010100000000000000000102030405060708090a0b' +
  'ffc400b51000020103030204030505040400000001' +
  '7d0102030004110512212431410613516107227114328191a1082342b1c11552d1' +
  'f02433627282090a161718191a25262728292a3435363738393a43444546474849' +
  '4a535455565758595a636465666768696a737475767778797a838485868788898a' +
  '929394959697989990a2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6' +
  'c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9' +
  'faffda00080101000000010a3fffffffd9',
  'hex',
);

// Add trailing zero padding before EOF marker or JPEG comment block so it's a valid 20KB image file
const padding = Buffer.alloc(20000, 0x00);
const MINIMAL_JPEG = Buffer.concat([baseJpeg, padding]);

if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

const files = ['id-front.jpg', 'proof-of-address.jpg', 'selfie.jpg'];
for (const file of files) {
  const dest = path.join(FIXTURES_DIR, file);
  fs.writeFileSync(dest, MINIMAL_JPEG);
  console.log(`✓ Created ${dest} (${MINIMAL_JPEG.length} bytes)`);
}

console.log('\nFixtures ready in fixtures/');
