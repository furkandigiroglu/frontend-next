
const BASE_URL = 'http://185.96.163.183:8000/api/v1';

async function testAuth() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';
  const fullName = 'Test User';

  console.log('1. Registering user:', email);
  try {
    // Try registering
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName, is_active: true, is_superuser: false })
    });
    
    if (!registerRes.ok) {
        const text = await registerRes.text();
        console.log('Registration response:', registerRes.status, text);
    } else {
        const regData = await registerRes.json();
        console.log('Registration success:', regData);
    }

    console.log('\n2. Logging in...');
    // Try JSON login first (common in custom auth)
    let loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    // If JSON fails, try OAuth2 standard form data
    if (!loginRes.ok) {
        console.log('JSON login failed (' + loginRes.status + '), trying x-www-form-urlencoded...');
        const params = new URLSearchParams();
        params.append('username', email); 
        params.append('password', password);
        
        loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });
    }

    if (!loginRes.ok) {
        const text = await loginRes.text();
        throw new Error(`Login failed: ${loginRes.status} ${text}`);
    }

    const loginData = await loginRes.json();
    console.log('Login success:', loginData);
    const token = loginData.access_token;

    if (!token) throw new Error('No access_token in login response');

    console.log('\n3. Getting profile...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!meRes.ok) {
        const text = await meRes.text();
        throw new Error(`Get profile failed: ${meRes.status} ${text}`);
    }

    const meData = await meRes.json();
    console.log('Profile:', meData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth();
