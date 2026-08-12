import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const LogPayloadSchema = z.object({
  matchID: z.string(),
  numPlayers: z.number().int().positive(),
  startTime: z.string(),
  endTime: z.string().optional().nullable(),
  winner: z.string().optional().nullable(),
  events: z.array(z.object({
    seq: z.number(),
    timestamp: z.string(),
    phase: z.string().optional(),
    turn: z.number().optional(),
    playerID: z.string().optional(),
    actionType: z.string(),
    details: z.record(z.unknown()).optional(),
    boardState: z.record(z.unknown()).optional()
  }))
});

export function diagnosticsPlugin() {
  const diagnosticsDir = path.resolve(process.cwd(), 'diagnostics');

  return {
    name: 'vite-plugin-diagnostics',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        if (req.method === 'POST' && url.pathname === '/api/diagnostics/save') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const rawData = JSON.parse(body);
              const validatedData = LogPayloadSchema.parse(rawData);
              
              if (!fs.existsSync(diagnosticsDir)) {
                fs.mkdirSync(diagnosticsDir, { recursive: true });
              }

              const safeMatchId = validatedData.matchID.replace(/[^a-zA-Z0-9_-]/g, '_');
              const filename = `game_log_${Date.now()}_${safeMatchId}.json`;
              const filePath = path.join(diagnosticsDir, filename);

              fs.writeFileSync(filePath, JSON.stringify(validatedData, null, 2), 'utf-8');

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, filename, filePath }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'GET' && url.pathname === '/api/diagnostics/list') {
          try {
            if (!fs.existsSync(diagnosticsDir)) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ files: [] }));
              return;
            }

            const files = fs.readdirSync(diagnosticsDir)
              .filter(f => f.startsWith('game_log_') && f.endsWith('.json'))
              .map(f => {
                const stat = fs.statSync(path.join(diagnosticsDir, f));
                return {
                  filename: f,
                  size: stat.size,
                  createdAt: stat.birthtime || stat.mtime
                };
              })
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ files }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        if (req.method === 'GET' && url.pathname === '/api/diagnostics/read') {
          try {
            const requestedFile = url.searchParams.get('file');
            if (!requestedFile || !requestedFile.startsWith('game_log_') || !requestedFile.endsWith('.json')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid filename' }));
              return;
            }

            const safeFilename = path.basename(requestedFile);
            const filePath = path.join(diagnosticsDir, safeFilename);

            if (!fs.existsSync(filePath)) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'File not found' }));
              return;
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        next();
      });
    }
  };
}
