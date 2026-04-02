// Main server entry point
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import mysql from 'mysql2/promise';
import { RoomManager } from './roomManager';
import { setupSocketHandlers } from './socketHandlers';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kred_multiplayer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Session store
const MySQLStoreSession = MySQLStore(session);
const sessionStore = new MySQLStoreSession({}, pool);

// Session secret — required in production, falls back to dev-only value
const sessionSecret = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === 'production' && !sessionSecret) {
  console.error('FATAL: SESSION_SECRET env var is required in production');
  process.exit(1);
}

// Session middleware
const sessionMiddleware = session({
  key: 'kred_session',
  secret: sessionSecret || 'kred-dev-secret-not-for-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
} as any);

app.use(sessionMiddleware);
app.use(express.json());

// Share session with socket.io
io.engine.use(sessionMiddleware);

// Initialize room manager with database pool
const roomManager = new RoomManager(pool);

// Setup socket.io handlers
setupSocketHandlers(io, roomManager);

// REST API endpoints

/**
 * Get list of active rooms
 */
app.get('/api/rooms', (req, res) => {
  const rooms = roomManager.getActiveRooms();
  res.json({ rooms });
});

/**
 * Get room state
 */
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const state = roomManager.getRoomState(roomId);

  if (!state) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  res.json({ state });
});

/**
 * Get game replay data
 */
app.get('/api/replay/:roomId', (req, res) => {
  const { roomId } = req.params;
  const state = roomManager.getRoomState(roomId);

  if (!state) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  res.json({
    roomId,
    playerCount: state.playerCount,
    players: state.players.map((p) => ({ id: p.id, name: p.id })),
    moveHistory: state.moveHistory,
    createdAt: state.createdAt,
    status: state.status,
  });
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 4001;
httpServer.listen(PORT, () => {
  console.log(`🎮 KRED Multiplayer Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🗄️  Connected to MySQL database`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    pool.end();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    pool.end();
    process.exit(0);
  });
});
