import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kredDir = path.resolve(__dirname, '..');
const distClient = path.join(kredDir, 'dist-client');

execSync('npx vite build --mode client', { stdio: 'inherit', cwd: kredDir });

for (const file of ['client.js', 'style.css']) {
  const src = path.join(distClient, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(kredDir, file));
    console.log(`[BUILD] Generated game_modules/KRED/${file}`);
  }
}

fs.rmSync(distClient, { recursive: true, force: true });

execSync('npx vite build', { stdio: 'inherit', cwd: kredDir });
