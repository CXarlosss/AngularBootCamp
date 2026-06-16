const baseUrl = 'http://localhost:4000/api/auth';

async function runTests() {
  console.log('1. Registering...');
  let res = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password123', role: 'admin' })
  });
  let data = await res.json();
  console.log('Register Response:', data);

  console.log('\n2. Logging in...');
  res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
  });
  data = await res.json();
  console.log('Login Response:', data);

  const { accessToken, refreshToken } = data.tokens;

  console.log('\n3. GET /me...');
  res = await fetch(`${baseUrl}/me`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  data = await res.json();
  console.log('/me Response:', data);

  console.log('\n4. POST /refresh...');
  res = await fetch(`${baseUrl}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  data = await res.json();
  console.log('/refresh Response:', data.tokens ? 'Tokens received' : data);

  console.log('\n5. GET /admin/dashboard...');
  res = await fetch(`${baseUrl}/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${data.tokens.accessToken}` }
  });
  data = await res.json();
  console.log('/admin/dashboard Response:', data);
}

runTests().catch(console.error);
