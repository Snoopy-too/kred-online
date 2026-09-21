// test/jev-arena/browserWalk.test.js
// Two-browser opponent walk against the kred2.0 dev server (npm run dev):
// two Playwright contexts open the same 3-player skip-draft pass-and-play
// game, each turn the clickables in context A are enumerated, Jev picks
// (keyless classifier.dev, 0.6 gate, uniform fallback — same pattern as
// jevPicker.js), the pick is mirrored into B, and the DESYNC oracle asserts
// both DOM fingerprints still match. Console-error oracle: any pageerror or
// console error fails the walk.
//
// Skips cleanly (passing) when Playwright, its browsers, or the dev server
// are unavailable — never hangs CI. All waits are bounded; the whole test
// has a hard node:test timeout.
//
// Env: SEED (default 1), MAX_TURNS (default 6),
// KRED_DEV_URL (default http://127.0.0.1:3000), KRED_ARENA_OFFLINE=1.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './seededRandom.js';
import { pickIndexWithJev } from './jevPicker.js';

const SEED = Number(process.env.SEED ?? 1);
const MAX_TURNS = Number(process.env.MAX_TURNS ?? 6);
const OFFLINE = process.env.KRED_ARENA_OFFLINE === '1';
const DEV_URL = process.env.KRED_DEV_URL ?? 'http://127.0.0.1:3000';

const seedScript = (seed) => `(() => {
  let a = ${seed >>> 0};
  Math.random = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();`;

const clickablesScript = `() => {
  const els = Array.from(document.querySelectorAll('#root button:not([disabled]), #root [role="button"]')).filter(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    const s = window.getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none';
  });
  return els.map(el => ((el.innerText ?? el.textContent ?? '').replace(/\\s+/g, ' ').trim().slice(0, 120)));
}`;

const clickIndexedScript = `(i) => {
  const els = Array.from(document.querySelectorAll('#root button:not([disabled]), #root [role="button"]')).filter(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    const s = window.getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none';
  });
  const el = els[i];
  if (!el) return '__MISSING:' + i;
  const label = ((el.innerText ?? el.textContent ?? '').replace(/\\s+/g, ' ').trim().slice(0, 120));
  el.scrollIntoView({ block: 'center' });
  el.click();
  return label;
}`;

const fingerprintScript = `() => {
  const root = document.getElementById('root');
  const text = (root?.innerText ?? '').replace(/\\s+/g, ' ').replace(/\\b\\d{1,2}:\\d{2}(:\\d{2})?\\b/g, '<time>').trim();
  const clickables = document.querySelectorAll('#root button:not([disabled]), #root [role="button"]').length;
  return text + '\\n[clickables:' + clickables + ']';
}`;

async function settle(page) {
  let prev = await page.evaluate(fingerprintScript);
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(300);
    const cur = await page.evaluate(fingerprintScript);
    if (cur === prev) return cur;
    prev = cur;
  }
  return prev;
}

async function serverUp(url) {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 3000);
    const res = await fetch(url, { signal: c.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

describe('two-browser opponent walk stays in sync', { timeout: 120000 }, () => {
  it('mirrored clicks keep both contexts in sync', async (t) => {
    let chromium;
    try {
      ({ chromium } = await import('playwright'));
    } catch {
      t.skip('playwright not installed — browser walk skipped (npm test stays green without it)');
      return;
    }
    if (!(await serverUp(DEV_URL))) {
      t.skip(`dev server unreachable at ${DEV_URL} — start it with: npm run dev`);
      return;
    }

    let browser;
    try {
      browser = await chromium.launch({ timeout: 15000 });
    } catch {
      t.skip('Playwright browsers not installed — run: npx playwright install chromium');
      return;
    }

    const rng = mulberry32(SEED * 1000 + 7);
    const steps = [];
    const pageErrors = [];
    const consoleErrors = [];
    const watch = (page, tag) => {
      page.on('pageerror', (err) => pageErrors.push(`[${tag}] pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(`[${tag}] console: ${msg.text().slice(0, 300)}`);
      });
    };

    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    await ctxA.addInitScript(seedScript(SEED));
    await ctxB.addInitScript(seedScript(SEED));
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();
    watch(pageA, 'A');
    watch(pageB, 'B');

    try {
      // Same deterministic game in both contexts: landing -> skip draft -> 3P.
      for (const page of [pageA, pageB]) {
        await page.goto(DEV_URL, { timeout: 15000 });
        await page.getByText('Skip Draft Phase').click({ timeout: 5000 });
        await page.getByRole('button', { name: /Start 3-Player Test Game/ }).click({ timeout: 5000 });
        await settle(page);
      }
      assert.equal(pageErrors.length, 0, `page errors during setup: ${pageErrors.join(' | ')}`);

      let fpA = await settle(pageA);
      let fpB = await settle(pageB);
      assert.equal(fpA, fpB, 'DESYNC right after setup');

      let jevHits = 0;
      let fallbacks = 0;
      let turns = 0;
      for (let turn = 0; turn < MAX_TURNS; turn++) {
        const labels = await pageA.evaluate(clickablesScript);
        if (labels.length === 0) break;
        let pick = Math.floor(rng() * labels.length);
        if (!OFFLINE) {
          const input = `KRED hotseat e2e arena, seed ${SEED}, step ${turn}. Candidates:\n${labels.map((l, i) => `${i}. ${l || `action-${i}`}`).join('\n')}`;
          const res = await pickIndexWithJev(input, labels.map((l, i) => l || `action-${i}`),
            'Pick the numbered button that most plausibly advances the hotseat game (continue, confirm, end turn, select). Prefer progress over opening menus.', rng);
          pick = res.index;
          if (res.source === 'jev') jevHits++;
          else fallbacks++;
        } else {
          fallbacks++;
        }
        const labelA = await pageA.evaluate(`(${clickIndexedScript})(${pick})`);
        const labelB = await pageB.evaluate(`(${clickIndexedScript})(${pick})`);
        steps.push(`t${turn} [#${pick}] ${labelA}`);
        assert.equal(labelB, labelA, `click diverged at t${turn}: A "${labelA}" vs B "${labelB}"`);
        fpA = await settle(pageA);
        fpB = await settle(pageB);
        assert.equal(pageErrors.length, 0, `page errors at t${turn}: ${pageErrors.join(' | ')}`);
        assert.equal(fpA, fpB, `DESYNC at t${turn} after "${labelA}"`);
        turns++;
      }

      assert.deepEqual(consoleErrors, [], `console errors during walk: ${consoleErrors.join(' | ')}`);
      assert.ok(turns > 0, 'walk played zero turns');
      console.log(`arena seed=${SEED}: ${turns} synced turns, jev=${jevHits} fallback=${fallbacks} offline=${OFFLINE}`);
    } finally {
      await ctxA.close().catch(() => {});
      await ctxB.close().catch(() => {});
      await browser.close().catch(() => {});
    }
  });
});
