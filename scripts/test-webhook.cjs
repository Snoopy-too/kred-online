const crypto = require('crypto');

const secret = '0f0503091e3dfe02fca4ff6a2611cd0c8489d3374ade5be3';
const payload = JSON.stringify({
  ref: 'refs/heads/kred2.0',
  after: 'test-commit-hash',
  sender: { login: 'Snoopy-too' },
  head_commit: { message: 'Test automated webhook deployment' }
});

const hmac = crypto.createHmac('sha256', secret);
const signature = 'sha256=' + hmac.update(payload).digest('hex');

async function test() {
  console.log('--- Testing Ping ---');
  const pingPayload = JSON.stringify({ zen: 'Ping test' });
  const pingHmac = crypto.createHmac('sha256', secret);
  const pingSig = 'sha256=' + pingHmac.update(pingPayload).digest('hex');

  const pingRes = await fetch('http://localhost:4002/api/webhooks/kred', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'ping',
      'X-Hub-Signature-256': pingSig
    },
    body: pingPayload
  });
  console.log('Ping status:', pingRes.status, await pingRes.json());

  console.log('\n--- Testing Invalid Signature (Expect 403) ---');
  const badRes = await fetch('http://localhost:4002/api/webhooks/kred', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'push',
      'X-Hub-Signature-256': 'sha256=badbadbad'
    },
    body: payload
  });
  console.log('Bad signature status:', badRes.status, await badRes.json());

  console.log('\n--- Testing Valid Push Event ---');
  const pushRes = await fetch('http://localhost:4002/api/webhooks/kred', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'push',
      'X-Hub-Signature-256': signature
    },
    body: payload
  });
  console.log('Push response status:', pushRes.status, await pushRes.json());
}

test().catch(console.error);
