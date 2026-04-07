// src/scripts/playtest.ts
import { runGame } from '../engine/gameRunner';
import { generateTestFileContent, getTestFilePath } from '../engine/testExporter';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
function getArg(name: string, defaultValue: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}
const hasFlag = (name: string) => args.includes(`--${name}`);

const gameCount = parseInt(getArg('games', '100'));
const playersArg = getArg('players', 'all');
const startSeed = parseInt(getArg('seed', String(Date.now())));
const verbose = hasFlag('verbose');

const playerCounts: (3 | 4 | 5)[] = playersArg === 'all'
  ? [3, 4, 5]
  : [parseInt(playersArg) as 3 | 4 | 5];

let totalPassed = 0;
let totalFailed = 0;
let totalStalemate = 0;
let totalExported = 0;

for (const playerCount of playerCounts) {
  console.log(`\nKRED Playtest: ${gameCount} games, ${playerCount} players, seed ${startSeed}`);
  console.log('━'.repeat(60));

  for (let i = 0; i < gameCount; i++) {
    const seed = startSeed + i;
    const result = runGame({ playerCount, seed, verbose });

    if (result.violations.length > 0) {
      totalFailed++;
      const v = result.violations[0];
      console.log(`Game ${i + 1}: ✗ INVARIANT ${v.invariantName} at action ${v.actionIndex}`);

      const content = generateTestFileContent(result, v);
      const filePath = getTestFilePath(v, seed);
      const fullPath = path.resolve(filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
      console.log(`  -> Exported: ${filePath}`);
      totalExported++;
    } else if (result.outcome === 'STALEMATE') {
      totalStalemate++;
      if (verbose) console.log(`Game ${i + 1}: ~ Stalemate (${result.stats.totalActions} actions)`);
    } else {
      totalPassed++;
      if (verbose) {
        const winners = result.winnerIds.map(id => `P${id}`).join(', ');
        console.log(`Game ${i + 1}: ✓ ${result.outcome === 'DRAW' ? 'Draw' : `${winners} wins`} (Campaign ${result.stats.campaignCount}, ${result.stats.totalActions} actions)`);
      }
    }
  }
}

console.log('\n' + '━'.repeat(60));
console.log(`Results: ${totalPassed} passed, ${totalFailed} failed, ${totalStalemate} stalemate`);
if (totalExported > 0) {
  console.log(`Tests exported: ${totalExported} files in src/__tests__/generated/`);
}
