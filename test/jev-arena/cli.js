// test/jev-arena/cli.js
// CLI: node test/jev-arena/cli.js --games 5 --seed 1 [--players 3|4|5|all]
//        [--jev-seats 1,3|all|none] [--max-actions 500] [--offline]
//        [--no-coverage] [--verbose]
// `npm run arena -- --games 5 --seed 1` forwards extra args to this file.
//
// Default seats are all random, so a plain run is seeded and reproducible
// with no network. Pass --jev-seats 1 (or all) for live Jev; every Jev
// failure still falls back to the seeded RNG.

import { runArenaGame } from './arenaRunner.js';
import { CoverageTracker, expectedPairs } from './matrix.js';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def;
};
const hasFlag = (name) => args.includes(`--${name}`);

const gameCount = parseInt(getArg('games', '5'), 10);
const playersArg = getArg('players', '3');
const startSeed = parseInt(getArg('seed', '1'), 10);
const jevSeatsArg = getArg('jev-seats', 'none');
const maxActions = parseInt(getArg('max-actions', '500'), 10);
const offline = hasFlag('offline');
const forceCoverage = !hasFlag('no-coverage');
const verbose = hasFlag('verbose');

const playerCounts = playersArg === 'all' ? [3, 4, 5] : [parseInt(playersArg, 10)];

const seatDrivers = (playerCount) => {
  const seats = Array.from({ length: playerCount }, () => 'random');
  if (offline || jevSeatsArg === 'none') return seats;
  if (jevSeatsArg === 'all') return seats.map(() => 'jev');
  for (const n of jevSeatsArg.split(',').map((s) => parseInt(s.trim(), 10))) {
    if (n >= 1 && n <= playerCount) seats[n - 1] = 'jev';
  }
  return seats;
};

const coverage = new CoverageTracker();
const expected = expectedPairs();
let wins = 0;
let draws = 0;
let stalemates = 0;
let stalled = 0;
let illegal = 0;
let desync = 0;
let jevCalls = 0;
let jevHits = 0;
let fallbacks = 0;

for (const playerCount of playerCounts) {
  const seats = seatDrivers(playerCount);
  console.log(`\nKRED Jev Arena (kred2.0): ${gameCount} games, ${playerCount} players, seed ${startSeed} (seats: ${seats.join('/')}${offline ? ', offline' : ''})`);
  console.log('━'.repeat(60));

  for (let i = 0; i < gameCount; i++) {
    const seed = startSeed + i;
    const result = await runArenaGame({ playerCount, seed, seats, maxActions, forceCoverage, offline, coverage, verbose });
    jevCalls += result.jevCalls;
    jevHits += result.jevHits;
    fallbacks += result.fallbacks;

    if (result.illegalAccepts.length > 0) {
      illegal++;
      const bad = result.illegalAccepts[0];
      console.log(`Game ${i + 1}: ✗ ILLEGAL-ACCEPT [${bad.executor}] ${bad.reason} at action ${bad.actionIndex}`);
    } else if (result.desyncs.length > 0) {
      desync++;
      const d = result.desyncs[0];
      console.log(`Game ${i + 1}: ✗ DESYNC [${d.executor}] ${d.label} at action ${d.actionIndex}`);
    } else if (result.outcome === 'STALLED') {
      stalled++;
      console.log(`Game ${i + 1}: ~ STALLED (${result.stallReason}) at ${result.totalActions} actions`);
    } else if (result.outcome === 'STALEMATE') {
      stalemates++;
      if (verbose) console.log(`Game ${i + 1}: ~ Stalemate (${result.stallReason}, ${result.totalActions} actions)`);
    } else {
      if (result.outcome === 'DRAW') draws++;
      else wins++;
      if (verbose) console.log(`Game ${i + 1}: ✓ ${result.outcome} ${result.winnerIds.join(',')} (${result.totalActions} actions)`);
    }
  }
}

const rep = coverage.report(expected);
console.log(`\n${'━'.repeat(60)}`);
console.log(`Results: ${wins} wins, ${draws} draws, ${stalemates} stalemates, ${stalled} stalled, ${illegal} illegal-accept, ${desync} desync`);
console.log(`Jev: ${jevCalls} calls, ${jevHits} picks, ${fallbacks} fallbacks`);
console.log(`Matrix: ${rep.covered}/${rep.total} pairs covered`);
if (rep.uncovered.length > 0) {
  console.log('Uncovered pairs:');
  for (const u of rep.uncovered) console.log(`  - ${u}`);
}

if (illegal > 0 || desync > 0) process.exit(1);
