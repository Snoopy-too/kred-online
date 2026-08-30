const crypto = require('crypto');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

class WebhookHandler {
  constructor(options = {}) {
    this.secret = options.secret || process.env.GITHUB_WEBHOOK_SECRET || process.env.KRED_WEBHOOK_SECRET || '';
    this.kredDir = options.kredDir || path.resolve(__dirname, '..');
    this.scriptPath = path.join(__dirname, 'webhook-pull.sh');
  }

  /**
   * Verify HMAC SHA-256 signature from GitHub
   */
  verifySignature(rawBody, signatureHeader) {
    if (!this.secret) {
      console.warn('[WEBHOOK] Warning: No GITHUB_WEBHOOK_SECRET configured. Skipping signature verification.');
      return true;
    }

    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
      return false;
    }

    try {
      const hmac = crypto.createHmac('sha256', this.secret);
      const expectedDigest = 'sha256=' + hmac.update(rawBody || '').digest('hex');
      const sigBuffer = Buffer.from(signatureHeader);
      const expectedBuffer = Buffer.from(expectedDigest);

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch (err) {
      console.error('[WEBHOOK] Error verifying signature:', err.message);
      return false;
    }
  }

  /**
   * Handle incoming webhook request
   */
  async handleRequest(ctx) {
    const event = ctx.get('x-github-event') || 'push';
    const signature = ctx.get('x-hub-signature-256');
    const rawBody = ctx.request.rawBody || JSON.stringify(ctx.request.body || {});

    // Verify signature
    if (this.secret && !this.verifySignature(rawBody, signature)) {
      console.warn('[WEBHOOK] Unauthorized webhook request: Invalid signature');
      ctx.status = 403;
      ctx.body = { error: 'Invalid webhook signature' };
      return;
    }

    // Handle Ping event from GitHub
    if (event === 'ping') {
      console.log('[WEBHOOK] GitHub ping event received successfully.');
      ctx.body = { status: 'ok', event: 'ping', message: 'Webhook connection established!' };
      return;
    }

    const payload = ctx.request.body || {};
    const ref = payload.ref || 'refs/heads/kred2.0';
    const branch = ref.replace('refs/heads/', '');
    const sender = payload.sender ? payload.sender.login : 'unknown';
    const commitMsg = payload.head_commit ? payload.head_commit.message : '';

    console.log(`[WEBHOOK] Push received for KRED branch [${branch}] by [${sender}]: "${commitMsg}"`);

    // Verify sync script exists
    if (!fs.existsSync(this.scriptPath)) {
      ctx.status = 500;
      ctx.body = { error: `Sync script not found at ${this.scriptPath}` };
      return;
    }

    // Trigger update asynchronously so GitHub gets an immediate 200 response
    const child = spawn('/bin/bash', [this.scriptPath, branch], {
      cwd: this.kredDir,
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    ctx.body = {
      status: 'queued',
      message: `Update triggered for branch: ${branch}`,
      commit: payload.after || 'latest',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get latest webhook sync logs
   */
  getLogs(ctx) {
    const logPath = path.join(this.kredDir, 'webhook.log');
    if (!fs.existsSync(logPath)) {
      ctx.body = { logs: 'No webhook logs found yet.' };
      return;
    }
    try {
      const logs = fs.readFileSync(logPath, 'utf8');
      const lines = logs.split('\n').slice(-100).join('\n');
      ctx.body = { logs: lines };
    } catch (err) {
      ctx.status = 500;
      ctx.body = { error: err.message };
    }
  }
}

module.exports = WebhookHandler;
