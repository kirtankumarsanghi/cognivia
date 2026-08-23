const fetch = require('node-fetch') || global.fetch;

async function test() {
  const res = await fetch('http://localhost:5000/api/confusion/signal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer fake_offline_token_student`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      concept_id: '4b360e5d-d93e-48a8-a182-c344486d42a8', // You might need a valid concept ID from the DB
      signal: 'Confused'
    })
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

test().catch(console.error);
