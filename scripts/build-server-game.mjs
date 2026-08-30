import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kredDir = path.resolve(__dirname, '..');

const entryContent = `
import { createKredGame } from './src/srcGame.js';
const kredGame = createKredGame();
module.exports = kredGame;
module.exports.default = kredGame;
module.exports.KredGame = kredGame;
module.exports.createKredGame = createKredGame;
`;

const tempEntry = path.join(kredDir, '.temp-server-entry.js');
fs.writeFileSync(tempEntry, entryContent, 'utf8');

try {
  await esbuild.build({
    entryPoints: [tempEntry],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(kredDir, 'game.cjs'),
    logLevel: 'info',
  });
  console.log('[BUILD] Successfully generated game_modules/KRED/game.cjs');
} finally {
  if (fs.existsSync(tempEntry)) {
    fs.unlinkSync(tempEntry);
  }
}
