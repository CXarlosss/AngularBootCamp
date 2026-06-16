const baseUrl = 'http://localhost:4000/api/auth';

async function test2FA() {
  console.log('1. Logging in as admin@test.com...');
  let res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
  });
  let data = await res.json();
  const accessToken = data.tokens.accessToken;

  console.log('\n2. POST /2fa/setup...');
  res = await fetch(`${baseUrl}/2fa/setup`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  data = await res.json();
  console.log('2FA Setup Response:', {
    secret: data.secret,
    qrCode: data.qrCode?.substring(0, 50) + '...', // truncate for logging
    manualEntryKey: data.manualEntryKey
  });
}

test2FA().catch(console.error);
