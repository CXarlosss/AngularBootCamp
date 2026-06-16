const authUrl = 'http://localhost:4000/api/auth';
const fluxUrl = 'http://localhost:3001/api/workflow';

async function testIntegration() {
  console.log('1. Trying to execute workflow WITHOUT token...');
  let res = await fetch(`${fluxUrl}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes: [], edges: [] })
  });
  console.log('No token response:', res.status, await res.json());

  console.log('\n2. Logging in to AuthForge...');
  res = await fetch(`${authUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
  });
  let data = await res.json();
  const token = data.tokens?.accessToken;
  if (!token) {
     console.log("Login failed!", data);
     return;
  }
  console.log('Logged in, got token.');

  console.log('\n3. Executing workflow WITH token...');
  res = await fetch(`${fluxUrl}/execute`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nodes: [], edges: [] })
  });
  console.log('With token response:', res.status, await res.json());
}

testIntegration().catch(console.error);
