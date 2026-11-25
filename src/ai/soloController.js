import { Client } from 'boardgame.io/dist/esm/client.js';
import { Local } from 'boardgame.io/dist/esm/multiplayer.js';
import { buildBotObservation } from './observation.js';
import { pickRandomPersonas } from './personas.js';
import { decideAction } from './decisions.js';

export function formatBotStatus(obs, persona) {
  const name = persona?.name || `Bot ${obs.botId}`;
  if (obs.pendingSupport) {
    return `${name} is moving an unsupported piece...`;
  }
  if (obs.pendingPlay) {
    switch (obs.pendingPlay.step) {
      case 'receipt':
        return `${name} is inspecting the tile...`;
      case 'challenge':
        return `${name} is deciding whether to challenge...`;
      case 'reexecute':
        return `${name} is re-executing honestly...`;
      case 'penaltyWithdraw':
        return `${name} is choosing a penalty withdraw...`;
      case 'receiverReward':
        return `${name} is selecting a whistleblower reward...`;
      case 'freeAdvance':
        return `${name} is taking a free Advance...`;
      case 'challengerReward':
        return `${name} is claiming a challenge reward...`;
      default:
        return `${name} is responding...`;
    }
  }
  if (obs.phase === 'draft') return `${name} is drafting a tile...`;
  if (obs.phase === 'bureaucracy') return `${name} is spending Bureaucracy funding...`;
  return `${name} is planning a turn...`;
}

function computeDelayMs(obs, persona, delayOverrideMs, rng) {
  if (typeof delayOverrideMs === 'number') return Math.max(0, delayOverrideMs);
  const [minMs, maxMs] = persona?.thinkingDelayMs || [800, 1600];
  let delay = minMs + Math.floor(rng() * Math.max(1, maxMs - minMs));
  if (obs.phase === 'draft') {
    return delay;
  }
  if (obs.phase === 'bureaucracy') {
    return Math.max(1800, Math.round(delay * 1.6));
  }
  if (obs.pendingPlay && (obs.pendingPlay.step === 'receipt' || obs.pendingPlay.step === 'challenge')) {
    return Math.max(2600, Math.round(delay * 2.0));
  }
  return Math.max(2200, Math.round(delay * 1.9));
}

function computeActionKey(matchID, state, obs, botId) {
  if (obs.pendingSupport) {
    return `${matchID}:support:${obs.pendingSupport.from}:${obs.pendingSupport.ownerId}:${state._stateID}`;
  }
  if (obs.phase === 'draft') {
    return `${matchID}:draft:${obs.draftPack.length}:${obs.hasDraftedThisRound}:${botId}`;
  }
  const step = obs.pendingPlay ? `${obs.pendingPlay.step}_${obs.pendingPlay.challengesPassed.length}` : 'turn';
  return `${matchID}:${obs.phase}:${obs.turn}:${step}:${botId}:${state._stateID}`;
}

/**
 * Coordinates headless boardgame.io bot Clients ('1' and '2') sharing a Local()
 * transport with the human React Client ('0').
 */
export function createSoloController({
  game,
  matchID,
  numPlayers = 3,
  multiplayer = Local(),
  botIds = ['1', '2'],
  credentialsByBot = {},
  personaOverrides = {},
  onStatusChange = null,
  onBotError = null,
  delayOverrideMs = null,
  rng = Math.random
}) {
  let destroyed = false;
  const timers = new Map();
  const scheduledKeys = new Map();
  const lastDispatched = new Map();
  const activeStatuses = new Map();
  const personas = {};
  const clients = {};
  const unsubs = [];

  const randomPersonas = pickRandomPersonas(botIds.length, rng);
  botIds.forEach((botId, idx) => {
    const override = personaOverrides[botId];
    personas[botId] = override && typeof override === 'object'
      ? { ...randomPersonas[idx], ...override }
      : randomPersonas[idx];
  });

  const emitStatus = () => {
    if (typeof onStatusChange !== 'function') return;
    const first = activeStatuses.values().next().value || null;
    onStatusChange(first);
  };

  const clearBotTimer = (botId) => {
    const t = timers.get(botId);
    if (t !== undefined) {
      clearTimeout(t);
      timers.delete(botId);
    }
    if (activeStatuses.delete(botId)) {
      emitStatus();
    }
  };

  const evaluateBot = (botId) => {
    if (destroyed) return;
    const client = clients[botId];
    if (!client) return;

    const state = client.getState();
    if (!state || !state.G || !state.ctx) return;

    if (state.G.winner || state.ctx.gameover) {
      clearBotTimer(botId);
      return;
    }

    const obs = buildBotObservation(state.G, state.ctx, botId);
    const previewDecision = decideAction(obs, personas[botId], rng);

    if (!previewDecision) {
      if (obs.phase !== 'draft' || obs.hasDraftedThisRound) {
        clearBotTimer(botId);
        scheduledKeys.delete(botId);
      }
      return;
    }

    const key = computeActionKey(matchID, state, obs, botId);
    if (scheduledKeys.get(botId) === key && timers.has(botId)) return;
    const prev = lastDispatched.get(botId);
    if (prev && prev.stateID === state._stateID && (prev.count >= 3 || Date.now() - prev.at < 4000)) {
      return;
    }

    clearBotTimer(botId);
    scheduledKeys.set(botId, key);

    const statusText = formatBotStatus(obs, personas[botId]);
    activeStatuses.set(botId, { botId, name: personas[botId].name, text: statusText });
    emitStatus();

    const delayMs = computeDelayMs(obs, personas[botId], delayOverrideMs, rng);
    const timerId = setTimeout(() => {
      timers.delete(botId);
      activeStatuses.delete(botId);
      emitStatus();
      if (destroyed) return;

      try {
        const freshState = client.getState();
        if (!freshState || !freshState.G || !freshState.ctx) return;
        if (freshState.G.winner || freshState.ctx.gameover) return;
        if (freshState.isConnected === false) return;

        const freshObs = buildBotObservation(freshState.G, freshState.ctx, botId);
        const decision = decideAction(freshObs, personas[botId], rng);
        if (!decision) return;

        const moveFn = client.moves?.[decision.move];
        if (typeof moveFn === 'function') {
          const cur = lastDispatched.get(botId);
          const count = cur && cur.stateID === freshState._stateID ? cur.count + 1 : 1;
          lastDispatched.set(botId, { stateID: freshState._stateID, at: Date.now(), count });
          moveFn(...(decision.args || []));
        }
      } catch (err) {
        if (typeof onBotError === 'function') onBotError(err, botId);
      }
    }, delayMs);

    timers.set(botId, timerId);
  };

  for (const botId of botIds) {
    const botKey = String(botId);
    const clientOpts = {
      game,
      numPlayers,
      matchID,
      playerID: botKey,
      multiplayer
    };
    if (credentialsByBot && credentialsByBot[botKey]) {
      clientOpts.credentials = credentialsByBot[botKey];
    }
    const client = Client(clientOpts);
    clients[botId] = client;
    const unsub = client.subscribe(() => evaluateBot(botId));
    unsubs.push(unsub);
    client.start();
  }

  return {
    stop() {
      if (destroyed) return;
      destroyed = true;
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
      scheduledKeys.clear();
      activeStatuses.clear();
      if (typeof onStatusChange === 'function') onStatusChange(null);
      unsubs.forEach((fn) => fn());
      Object.values(clients).forEach((c) => c.stop());
    },
    getClients() {
      return { ...clients };
    }
  };
}
