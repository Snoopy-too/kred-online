import type { Server, Socket } from 'socket.io';
import type { GameRoomState } from './types';
import type { Player } from '@kred/shared';

// Helper: shuffle array in-place
function shuffle<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

// Helper: deal tiles to players
function dealTilesAndStartGame(state: GameRoomState): GameRoomState {
	// 24 tiles for 3-4p, 25 for 5p
	const playerCount = state.players.length;
	const tileCount = playerCount === 5 ? 25 : 24;
	const handSize = playerCount === 3 ? 8 : playerCount === 4 ? 6 : 5;
	const allTiles = Array.from({ length: tileCount }, (_, i) => ({ id: i + 1, url: `./images/${String(i + 1).padStart(2, '0')}.svg` }));
	shuffle(allTiles);
	const players: Player[] = state.players.map((p, idx) => {
		const hand = allTiles.slice(idx * handSize, (idx + 1) * handSize);
		return {
			...p,
			hand,
			keptTiles: [],
			bureaucracyTiles: [],
		};
	});
	return {
		...state,
		status: 'in_progress',
		gameState: 'DRAFTING',
		players,
		currentPlayerIndex: 0,
	};
}

export function setupSocketHandlers(io: Server, roomManager: any) {
	io.on('connection', (socket: Socket) => {
		// Handle KRED game initialization (client requests current state)
		socket.on('kred:initialize', async (data, callback) => {
			const { roomId, playerId } = data;
			const engine = roomManager.rooms.get(roomId);
			if (!engine) {
				callback?.({ success: false, error: 'Room not found' });
				return;
			}
			const state: GameRoomState = engine.getState();
			callback?.({ success: true, state });
			console.log('[SERVER] Emitting kred:stateUpdate:', { gameState: state });
			socket.emit('kred:stateUpdate', { gameState: state });
		});

		// Handle KRED game start (host triggers start)
		socket.on('kred:start', async (data, callback) => {
			const { roomId, playerId } = data;
			const engine = roomManager.rooms.get(roomId);
			if (!engine) {
				callback?.({ success: false, error: 'Room not found' });
				return;
			}
			// Validate playerId to prevent duplicates
			const existingPlayer = engine.state.players.find((p: { id: string }) => p.id === playerId);
			if (existingPlayer) {
				callback?.({ success: false, error: 'Duplicate playerId detected' });
				return;
			}
			// Shuffle, deal, and update state
			const oldState: GameRoomState = engine.getState();
			const newState = dealTilesAndStartGame(oldState);
			engine['state'] = newState; // Directly update for now (should use dispatch in future)

			// Broadcast to each socket in the room with their playerIndex
			const room = io.sockets.adapter.rooms.get(roomId);
			if (room) {
				for (const clientId of room) {
					const clientSocket = io.sockets.sockets.get(clientId);
					if (clientSocket) {
						// Find playerIndex by matching playerId (if available via handshake or session)
						// For now, try to match by order (assumes join order matches players array)
						let playerIndex = -1;
						if (clientSocket.handshake.auth && clientSocket.handshake.auth.playerId) {
							playerIndex = newState.players.findIndex(p => p.id === clientSocket.handshake.auth.playerId);
							console.log('[SERVER] Received playerId in handshake.auth:', clientSocket.handshake.auth.playerId);
						}
						if (playerIndex === -1) playerIndex = 0; // fallback
						clientSocket.emit('kred:stateUpdate', { gameState: newState, playerIndex, players: newState.players });
						console.log('[SERVER] kred:stateUpdate event data:', { gameState: newState, playerIndex, players: newState.players });
					}
				}
			} else {
				// Fallback: broadcast to all
				io.to(roomId).emit('kred:stateUpdate', { gameState: newState, players: newState.players });
				console.log('[SERVER] Broadcasting kred:stateUpdate:', { gameState: newState, players: newState.players });
			}
			console.log('[SERVER] Players in newState:', newState.players);
			callback?.({ success: true });
		});
	});
}
