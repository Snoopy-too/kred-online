// Minimal test server to validate infrastructure

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import session from 'express-session';

const app = express();

// Add session middleware
const sessionMiddleware = session({
  secret: 'kred-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
  },
});
app.use(sessionMiddleware);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

app.use(express.json());
// Share session with socket.io
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Simple in-memory storage for testing
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on('game:create', (data, callback) => {
    const { playerName, playerCount } = data;
    const roomId = `room_${Date.now()}`;
    
    rooms.set(roomId, {
      id: roomId,
      players: [{
        name: playerName,
        socketId: socket.id,
        hand: [],
        keptTiles: [],
        bureaucracyTiles: [],
        credibility: 3
      }],
      playerCount,
      status: 'waiting',
    });

    socket.join(roomId);
    
    console.log(`🎮 Room created: ${roomId} by ${playerName}`);
    
    callback({
      success: true,
      roomId,
      playerId: socket.id,
      playerIndex: 0,
      gameState: rooms.get(roomId),
    });
  });

  socket.on('game:join', (data, callback) => {
    const { roomId, playerName } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.players.length >= room.playerCount) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    room.players.push({
      name: playerName,
      socketId: socket.id,
      hand: [],
      keptTiles: [],
      bureaucracyTiles: [],
      credibility: 3
    });
    socket.join(roomId);
    
    console.log(`👤 ${playerName} joined room: ${roomId}`);
    
    callback({
      success: true,
      roomId,
      playerId: socket.id,
      playerIndex: room.players.length - 1,
      gameState: room,
    });

    // Notify other players
    socket.to(roomId).emit('player:joined', {
      playerId: socket.id,
      playerIndex: room.players.length - 1,
      playerName,
    });
  });

  socket.on('game:start', (callback) => {
    console.log(`🚀 Game start requested`);
    callback({ success: true });
    
    // Find room this socket is in
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.some(p => p.socketId === socket.id)) {
        room.status = 'in_progress';
        // Ensure all players have required properties
        room.players = room.players.map(p => ({
          ...p,
          hand: Array.isArray(p.hand) ? p.hand : [],
          keptTiles: Array.isArray(p.keptTiles) ? p.keptTiles : [],
          bureaucracyTiles: Array.isArray(p.bureaucracyTiles) ? p.bureaucracyTiles : [],
          credibility: typeof p.credibility === 'number' ? p.credibility : 3
        }));
        io.to(roomId).emit('game:stateUpdate', { gameState: room });
        io.to(roomId).emit('game:phaseChange', { newPhase: 'DRAFTING', currentPlayer: 0 });
        break;
      }
    }
  });

  socket.on('tile:accept', (callback) => {
    console.log(`✓ Tile accepted`);
    callback({ success: true });
  });

  socket.on('tile:reject', (callback) => {
    console.log(`✗ Tile rejected`);
    callback({ success: true });
  });

  socket.on('challenge:initiate', (callback) => {
    console.log(`⚔️  Challenge initiated`);
    callback({ success: true });
  });

  socket.on('challenge:pass', (callback) => {
    console.log(`➡️  Challenge passed`);
    callback({ success: true });
  });

  socket.on('campaign:endTurn', (callback) => {
    console.log(`⏭️  Turn ended`);
    callback({ success: true });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    timestamp: new Date() 
  });
});

// Get active rooms
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(r => ({
    id: r.id,
    playerCount: r.playerCount,
    currentPlayers: r.players.length,
    status: r.status,
  }));
  res.json({ rooms: roomList });
});

const PORT = 4001;
httpServer.listen(PORT, () => {
  console.log(`🎮 KRED Test Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🧪 Testing infrastructure only (no game logic)`);
  console.log(``);
  console.log(`Open test-client.html in multiple browser windows to test:`);
  console.log(`  file://${process.cwd()}/../../test-client.html`);
});
