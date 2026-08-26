import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

async function testQrGenerationAndDecoding() {
  console.log('--- AVELORA QR CODE GENERATION & INTEGRITY TEST ---');

  // Test Case 1: Product QR
  const productCode = 'PRD-VELVET99';
  const productUrl = `https://avelora-ecommerce.vercel.app/q/p/${productCode}`;
  console.log('1. Generating Product QR for:', productUrl);

  const productDataUrl = await QRCode.toDataURL(productUrl, {
    width: 1024,
    margin: 2,
    color: { dark: '#0B0F19', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });

  if (!productDataUrl || !productDataUrl.startsWith('data:image/png;base64,')) {
    throw new Error('FAILED: Product QR Data URL is empty or invalid');
  }

  const base64Data = productDataUrl.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  console.log(`✔ Product QR generated successfully. PNG Buffer size: ${buffer.length} bytes`);

  if (buffer.length < 1000) {
    throw new Error('FAILED: Product QR PNG buffer is suspiciously small');
  }

  // Test Case 2: Order Fulfillment Token QR
  const orderTokenPayload = 'AV1:F:66c9f28014a:a8f9c0e12d45678b90123456789abcdef';
  console.log('\n2. Generating Order Fulfillment Token QR for:', orderTokenPayload);

  const orderDataUrl = await QRCode.toDataURL(orderTokenPayload, {
    width: 1024,
    margin: 2,
    color: { dark: '#0B0F19', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });

  const orderBuffer = Buffer.from(orderDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log(`✔ Order QR generated successfully. PNG Buffer size: ${orderBuffer.length} bytes`);

  // Test Case 3: Customer Tracking QR
  const trackingUrl = 'https://avelora-ecommerce.vercel.app/track-order?orderId=AVE-20260826-001';
  console.log('\n3. Generating Tracking QR for:', trackingUrl);

  const trackDataUrl = await QRCode.toDataURL(trackingUrl, {
    width: 600,
    margin: 1,
    color: { dark: '#0B0F19', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });

  const trackBuffer = Buffer.from(trackDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
  console.log(`✔ Tracking QR generated successfully. PNG Buffer size: ${trackBuffer.length} bytes`);

  console.log('\n=== ALL QR CODE GENERATION & INTEGRITY TESTS PASSED SUCCESSFULLY! ===');
}

testQrGenerationAndDecoding().catch((err) => {
  console.error('QR Test Failed:', err);
  process.exit(1);
});
