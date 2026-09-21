// test/jev-arena/jevPicker.js
// Jev action picker: one POST per turn. Same pattern as the reference arena:
// default keyless classifier.dev; TYPESAFE_API_KEY switches to the TypeSafe
// direct endpoint. Confidence < 0.6 -> uniform random. Every network failure
// -> uniform random, never throws. 5s timeout, real User-Agent.

export const DEFAULT_JEV_ENDPOINT = 'https://classifier.dev/v1/classify';
export const TYPESAFE_ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
export const DEFAULT_TIMEOUT_MS = 5000;
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.6;
export const USER_AGENT = 'kred-arena-kred2/1.0 (+https://github.com/Snoopy-too/kred-online)';

const uniformPick = (n, rng) => Math.floor(rng() * n);
const env = (name) => (typeof process !== 'undefined' ? process.env?.[name] : undefined);

// classifier.dev 400s on duplicate labels — keep index alignment.
export function uniquifyLabels(labels) {
  const seen = new Map();
  return labels.map((label) => {
    const n = (seen.get(label) ?? 0) + 1;
    seen.set(label, n);
    return n === 1 ? label : `${label} [${n}]`;
  });
}

const parseClassifierBody = (data) => {
  const first = Array.isArray(data.results) ? data.results[0] : undefined;
  const rawLabel = data.label ?? first?.label;
  const rawConf = data.confidence ?? first?.confidence;
  return {
    label: typeof rawLabel === 'string' ? rawLabel : null,
    confidence: typeof rawConf === 'number' ? rawConf : null,
  };
};

const parseTypesafeBody = (data) => {
  const ans = data.answers?.action;
  return {
    label: typeof ans?.choice === 'string' ? ans.choice : null,
    confidence: typeof ans?.confidence === 'number' ? ans.confidence : null,
  };
};

export async function pickIndexWithJev(input, labels, instructions, rng, opts = {}) {
  if (labels.length === 0) return { index: 0, source: 'fallback-random', reason: 'no-labels' };
  if (labels.length === 1) return { index: 0, source: 'fallback-random', reason: 'single-option' };

  const uniqueLabels = uniquifyLabels(labels);
  const apiKey = env('TYPESAFE_API_KEY');
  const useTypesafe = Boolean(apiKey);
  const endpoint = opts.endpoint ?? env('JEV_ENDPOINT') ?? (useTypesafe ? TYPESAFE_ENDPOINT : DEFAULT_JEV_ENDPOINT);
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const threshold = opts.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
  const fetchImpl = opts.fetchImpl ?? fetch;

  const headers = { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const body = useTypesafe
    ? JSON.stringify({
        model: 'jev-latest',
        state: input,
        questions: {
          action: {
            type: 'choice',
            instructions,
            criteria: Object.fromEntries(uniqueLabels.map((label, i) => [`opt_${i}`, label])),
          },
        },
      })
    : JSON.stringify({ input, labels: uniqueLabels, instructions });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(endpoint, { method: 'POST', headers, body, signal: controller.signal });
    if (!res.ok) {
      return { index: uniformPick(labels.length, rng), source: 'fallback-random', reason: `http-${res.status}` };
    }
    const data = await res.json();
    const parsed = useTypesafe ? parseTypesafeBody(data) : parseClassifierBody(data);

    let index = -1;
    if (parsed.label !== null) {
      if (useTypesafe) {
        const m = /^opt_(\d+)$/.exec(parsed.label);
        index = m ? Number(m[1]) : uniqueLabels.indexOf(parsed.label);
      } else {
        index = uniqueLabels.indexOf(parsed.label);
      }
    }
    if (index < 0 || index >= labels.length) {
      return { index: uniformPick(labels.length, rng), source: 'fallback-random', reason: 'unknown-label' };
    }
    if (parsed.confidence === null) {
      return { index: uniformPick(labels.length, rng), source: 'fallback-random', label: parsed.label, reason: 'null-confidence' };
    }
    if (parsed.confidence < threshold) {
      return { index: uniformPick(labels.length, rng), source: 'fallback-random', confidence: parsed.confidence, label: parsed.label, reason: 'low-confidence' };
    }
    return { index, source: 'jev', confidence: parsed.confidence, label: uniqueLabels[index] };
  } catch {
    return { index: uniformPick(labels.length, rng), source: 'fallback-random', reason: 'network-error' };
  } finally {
    clearTimeout(timer);
  }
}
