import { SocketIO } from 'boardgame.io/dist/esm/multiplayer.js';
import { createKredGame } from '../game.js';
import { createSoloController } from './soloController.js';
import { getBotPersona, pickRandomPersonas, findPersonaByName } from './personas.js';

function isBotMeta(p) {
  return Boolean(p && ((p.data && p.data.isBot) || (p.name && p.name.endsWith('(Bot)'))));
}

export function createKredBotManager({ db, port = 4002 }) {
  const controllers = new Map();
  const baseUrl = `http://127.0.0.1:${port}`;

  function stopMatchBots(matchID) {
    const entry = controllers.get(matchID);
    if (!entry) return;
    clearInterval(entry.watchdog);
    try { entry.controller.stop(); } catch {}
    controllers.delete(matchID);
    console.log(`[KRED-BOTS] Stopped bots for match ${matchID}`);
  }

  async function attachMatchBots(matchID) {
    if (!matchID || !db) return { attached: false, botIds: [] };
    const { metadata, state } = await db.fetch(matchID, { metadata: true, state: true });
    if (!metadata || metadata.gameName !== 'kred') return { attached: false, botIds: [] };
    if (metadata.gameover || state?.G?.winner || state?.ctx?.gameover) {
      stopMatchBots(matchID);
      return { attached: false, botIds: [] };
    }

    const players = Object.values(metadata.players || {});
    const creds = {};
    const personaOverrides = {};
    for (const p of players) {
      if (isBotMeta(p) && p.credentials) {
        const seatId = String(p.id);
        creds[seatId] = p.credentials;
        const matched = p.data?.personaId !== undefined
          ? getBotPersona(p.data.personaId)
          : findPersonaByName(p.name);
        if (matched) personaOverrides[seatId] = matched;
      }
    }
    const botIds = Object.keys(creds);
    if (botIds.length === 0) return { attached: false, botIds: [] };

    const existing = controllers.get(matchID);
    if (existing && existing.botIdsKey === botIds.join(',')) {
      return { attached: true, botIds };
    }
    if (existing) stopMatchBots(matchID);

    const numPlayers = players.length || 3;
    const controller = createSoloController({
      game: createKredGame(numPlayers, false),
      matchID,
      numPlayers,
      botIds,
      credentialsByBot: creds,
      personaOverrides,
      multiplayer: SocketIO({ server: baseUrl, socketOpts: { forceNew: true } }),
      onBotError: (err, id) => console.error(`[KRED-BOTS] Match ${matchID} bot ${id} error:`, err?.message || err)
    });

    const watchdog = setInterval(async () => {
      try {
        const clients = controller.getClients();
        const first = Object.values(clients)[0];
        const st = first?.getState?.();
        if (st && (st.G?.winner || st.ctx?.gameover)) {
          stopMatchBots(matchID);
          return;
        }
        const check = await db.fetch(matchID, { metadata: true });
        if (!check?.metadata || check.metadata.gameover) {
          stopMatchBots(matchID);
        }
      } catch {}
    }, 10000);

    controllers.set(matchID, { controller, watchdog, botIdsKey: botIds.join(',') });
    console.log(`[KRED-BOTS] Attached bots [${botIds.join(', ')}] to match ${matchID}`);
    return { attached: true, botIds };
  }

  async function startBotsForMatch(matchID) {
    if (!matchID || !db) throw new Error('Match ID required');
    const { metadata } = await db.fetch(matchID, { metadata: true });
    if (!metadata || metadata.gameName !== 'kred') {
      throw new Error('KRED match not found');
    }

    const players = Object.values(metadata.players || {});
    const openSeats = players.filter((seat) => seat && !seat.name);
    const chosenPersonas = pickRandomPersonas(openSeats.length);
    for (let i = 0; i < openSeats.length; i++) {
      const seat = openSeats[i];
      const seatId = String(seat.id);
      const persona = chosenPersonas[i];
      try {
        await fetch(`${baseUrl}/games/kred/${matchID}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerID: seatId,
            playerName: `${persona.name} (Bot)`,
            data: { isBot: true, personaId: persona.id }
          })
        });
      } catch {
        // Seat may have been taken concurrently by a human
      }
    }

    return attachMatchBots(matchID);
  }

  async function reattachAllActiveMatches() {
    if (!db) return;
    try {
      const matchIds = await db.listMatches();
      for (const matchID of matchIds) {
        await attachMatchBots(matchID);
      }
    } catch (err) {
      console.error('[KRED-BOTS] Error reattaching active matches:', err.message);
    }
  }

  return {
    attachMatchBots,
    startBotsForMatch,
    reattachAllActiveMatches,
    stopMatchBots
  };
}
