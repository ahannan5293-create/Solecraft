const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) {
    acc[key.trim()] = val.join('=').trim().replace(/\r$/, '').replace(/^"|"$/g, '');
  }
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function run() {
  console.log('Logging in via REST API...');
  
  const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      email: '2025CE40@student.uet.edu.pk',
      password: '3LNEQERL'
    })
  });
  
  if (!loginRes.ok) {
    console.log('Login failed:', await loginRes.text());
    return;
  }
  
  const loginData = await loginRes.json();
  const projectId = new URL(supabaseUrl).hostname.split('.')[0];
  const cookieName = `sb-${projectId}-auth-token`;
  const cookieValue = Buffer.from(JSON.stringify([loginData.access_token, loginData.refresh_token, null, null, null])).toString('base64');
  
  console.log('--- Testing CUSTOMER Chat API ---');
  try {
    const res = await fetch('http://localhost:3000/api/chat/customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `${cookieName}=${cookieValue}`
      },
      body: JSON.stringify({ message: 'What are my recent orders?', history: [] })
    });
    
    console.log('Customer API Response Status:', res.status);
    const json = await res.json();
    console.log('Customer API Response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
run();
