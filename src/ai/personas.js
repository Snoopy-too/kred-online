/**
 * AI bot personality profiles for Solo Mode and 3-bot headless simulation.
 */
export const BOT_PERSONAS = Object.freeze({
  '0': {
    id: '0',
    name: 'Zero',
    title: 'The Pragmatist',
    archetype: 'Balanced Strategist',
    bluffThreshold: 0.58,
    bribeGenerosity: 1.0,
    greedWeight: 1.0,
    integrityWeight: 1.1,
    challengeThreshold: 52,
    aggressionWeight: 1.1,
    draftFundingWeight: 1.0,
    firstPlayerBonus: 12,
    paranoiaWeight: 1.0,
    memoryRecall: 0.85,
    thinkingDelayMs: [600, 1200]
  },
  '1': {
    id: '1',
    name: 'Vance',
    title: 'The Corrupt Baron',
    archetype: 'Opportunistic Deceiver',
    bluffThreshold: 0.35,
    bribeGenerosity: 1.5,
    greedWeight: 1.6,
    integrityWeight: 0.7,
    challengeThreshold: 72,
    aggressionWeight: 1.4,
    draftFundingWeight: 1.15,
    firstPlayerBonus: 12,
    paranoiaWeight: 0.6,
    memoryRecall: 0.45,
    thinkingDelayMs: [1000, 2200]
  },
  '2': {
    id: '2',
    name: 'Vale',
    title: 'The Watchdog',
    archetype: 'Rule-Enforcing Watchdog',
    bluffThreshold: 0.72,
    bribeGenerosity: 0.75,
    greedWeight: 0.7,
    integrityWeight: 1.5,
    challengeThreshold: 44,
    aggressionWeight: 1.15,
    draftFundingWeight: 1.0,
    firstPlayerBonus: 14,
    paranoiaWeight: 1.3,
    memoryRecall: 0.95,
    thinkingDelayMs: [700, 1400]
  },
  '3': {
    id: '3',
    name: 'Thorne',
    title: 'The Strategist',
    archetype: 'Calculated Tactician',
    bluffThreshold: 0.55,
    bribeGenerosity: 1.1,
    greedWeight: 1.15,
    integrityWeight: 1.2,
    challengeThreshold: 48,
    aggressionWeight: 1.25,
    draftFundingWeight: 1.05,
    firstPlayerBonus: 13,
    paranoiaWeight: 1.1,
    memoryRecall: 0.90,
    thinkingDelayMs: [800, 1700]
  },
  '4': {
    id: '4',
    name: 'Mire',
    title: 'The Schemer',
    archetype: 'High-Risk Bluffer',
    bluffThreshold: 0.30,
    bribeGenerosity: 1.35,
    greedWeight: 1.45,
    integrityWeight: 0.8,
    challengeThreshold: 64,
    aggressionWeight: 1.35,
    draftFundingWeight: 1.1,
    firstPlayerBonus: 11,
    paranoiaWeight: 0.75,
    memoryRecall: 0.65,
    thinkingDelayMs: [900, 1900]
  }
});

/**
 * Returns the persona configuration for botId, merged with optional overrides.
 */
export function getBotPersona(botId, overrides = {}) {
  const base = BOT_PERSONAS[String(botId)] || BOT_PERSONAS['0'];
  if (!overrides || typeof overrides !== 'object') return { ...base };
  return { ...base, ...overrides };
}

/**
 * Picks `count` distinct personas at random using Fisher-Yates shuffle.
 */
export function pickRandomPersonas(count, rng = Math.random) {
  const pool = Object.values(BOT_PERSONAS).map((p) => ({ ...p }));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = [];
  for (let i = 0; i < count; i++) {
    picked.push({ ...pool[i % pool.length] });
  }
  return picked;
}

/**
 * Finds a persona by display name (with or without trailing "(Bot)").
 */
export function findPersonaByName(name) {
  if (!name || typeof name !== 'string') return null;
  const clean = name.replace(/\s*\(Bot\)$/i, '').trim().toLowerCase();
  const match = Object.values(BOT_PERSONAS).find((p) => p.name.toLowerCase() === clean);
  return match ? { ...match } : null;
}
