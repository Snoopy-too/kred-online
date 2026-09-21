// test/jev-arena/jevPicker.test.js
// Jev picker fallback contract: Jev-or-seeded-random, never throws.
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  pickIndexWithJev,
  uniquifyLabels,
  DEFAULT_JEV_ENDPOINT,
  USER_AGENT,
} from './jevPicker.js';
import { SeededRandom } from './seededRandom.js';

const INPUT = 'test input';
const LABELS = ['alpha', 'beta', 'gamma'];
const INSTRUCTIONS = 'win the game for the current seat';
const rng = () => new SeededRandom(7).next;
const okFetch = (body) => async () => new Response(JSON.stringify(body), { status: 200 });

afterEach(() => {
  delete process.env.TYPESAFE_API_KEY;
  delete process.env.JEV_ENDPOINT;
});

describe('pickIndexWithJev fallback paths', () => {
  it('returns the Jev label on high-confidence success', async () => {
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push([url, init]);
      return new Response(JSON.stringify({ label: 'beta', confidence: 0.95 }), { status: 200 });
    };
    const res = await pickIndexWithJev(INPUT, LABELS, INSTRUCTIONS, rng(), { fetchImpl });
    assert.equal(res.source, 'jev');
    assert.equal(res.index, 1);
    assert.equal(res.confidence, 0.95);
    assert.equal(calls[0][0], DEFAULT_JEV_ENDPOINT);
    assert.equal(calls[0][1].method, 'POST');
    assert.equal(calls[0][1].headers['User-Agent'], USER_AGENT);
    const body = JSON.parse(calls[0][1].body);
    assert.deepEqual(body.labels, LABELS);
    assert.equal(body.instructions, INSTRUCTIONS);
  });

  it('keeps the pick at confidence 0.6, falls back below it', async () => {
    const keep = await pickIndexWithJev(INPUT, LABELS, INSTRUCTIONS, rng(), { fetchImpl: okFetch({ label: 'gamma', confidence: 0.6 }) });
    assert.equal(keep.source, 'jev');
    assert.equal(keep.index, 2);
    const drop = await pickIndexWithJev(INPUT, LABELS, INSTRUCTIONS, rng(), { fetchImpl: okFetch({ label: 'beta', confidence: 0.2 }) });
    assert.equal(drop.source, 'fallback-random');
    assert.equal(drop.reason, 'low-confidence');
    assert.ok(drop.index >= 0 && drop.index < LABELS.length);
  });

  it('falls back on null confidence, unknown labels, and non-200', async () => {
    const r1 = await pickIndexWithJev(INPUT, LABELS, INSTRUCTIONS, rng(), { fetchImpl: okFetch({ label: 'beta', confidence: null }) });
    assert.equal(r1.reason, 'null-confidence');
    const r2 = await pickIndexWithJev(INPUT, LABELS, INSTRUCTIONS, rng(), { fetchImpl: okFetch({ label: 'nope', confidence: 0.99 }) });
    assert.equal(r2.reason, 'unknown-label');
    const r3 = await pickIndexWithJev(INPUT, LABELS, INSTRUCTIONS, rng(), { fetchImpl: async () => new Response('nope', { status: 500 }) });
    assert.equal(r3.source, 'fallback-random');
    for (const r of [r1, r2, r3]) assert.equal(r.source, 'fallback-random');
  });

  it('falls back (never throws) on network error and timeout', async () => {
    const boom = async () => { throw new TypeError('fetch failed'); };
    const r1 = await pickIndexWithJev(INPUT, LABELS, INSTRUCTIONS, rng(), { fetchImpl: boom });
    assert.equal(r1.reason, 'network-error');
    const hanging = (_url, init) => new Promise((_, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    });
    const r2 = await pickIndexWithJev(INPUT, LABELS, INSTRUCTIONS, rng(), { fetchImpl: hanging, timeoutMs: 30 });
    assert.equal(r2.reason, 'network-error');
  });

  it('parses the batch results shape and uniquifies duplicate labels', async () => {
    const res = await pickIndexWithJev(INPUT, LABELS, INSTRUCTIONS, rng(), {
      fetchImpl: okFetch({ results: [{ label: 'gamma', confidence: 0.88 }] }),
    });
    assert.equal(res.source, 'jev');
    assert.equal(res.index, 2);
    assert.deepEqual(uniquifyLabels(['dup', 'dup', 'x']), ['dup', 'dup [2]', 'x']);
  });

  it('skips the network for empty and single-option turns', async () => {
    let called = 0;
    const fetchImpl = async () => { called++; return new Response('{}', { status: 200 }); };
    const r0 = await pickIndexWithJev(INPUT, [], INSTRUCTIONS, rng(), { fetchImpl });
    const r1 = await pickIndexWithJev(INPUT, ['only'], INSTRUCTIONS, rng(), { fetchImpl });
    assert.equal(r0.reason, 'no-labels');
    assert.equal(r1.reason, 'single-option');
    assert.equal(called, 0);
  });

  it('uses the TypeSafe endpoint when TYPESAFE_API_KEY is set', async () => {
    process.env.TYPESAFE_API_KEY = 'test-key';
    let sentUrl;
    let sentBody;
    const fetchImpl = async (url, init) => {
      sentUrl = url;
      sentBody = JSON.parse(init.body);
      return new Response(JSON.stringify({ answers: { action: { choice: 'opt_1', confidence: 0.9 } } }), { status: 200 });
    };
    const res = await pickIndexWithJev(INPUT, LABELS, INSTRUCTIONS, rng(), { fetchImpl });
    assert.match(sentUrl, /typesafe/);
    assert.equal(sentBody.model, 'jev-latest');
    assert.equal(res.source, 'jev');
    assert.equal(res.index, 1);
  });
});
