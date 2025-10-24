// Test the adjacency logic
const playerCount = 4;

function parseLocationId(locationId) {
  if (locationId.startsWith('community')) {
    return { playerId: null, locationType: 'community' };
  }

  const match = locationId.match(/^p(\d+)_(seat|rostrum|office)(\d+)?$/);
  if (!match) {
    return { playerId: null, locationType: null };
  }

  const playerId = parseInt(match[1], 10);
  const locationType = match[2];
  const number = match[3] ? parseInt(match[3], 10) : undefined;

  if (locationType === 'seat') {
    return { playerId, locationType, seatNumber: number };
  } else if (locationType === 'rostrum') {
    return { playerId, locationType, rostrumNumber: number };
  } else {
    return { playerId, locationType };
  }
}

function areSeatsAdjacent(fromLocationId, toLocationId, playerCount) {
  const from = parseLocationId(fromLocationId);
  const to = parseLocationId(toLocationId);

  console.log('From:', fromLocationId, from);
  console.log('To:', toLocationId, to);

  if (!from.playerId || !to.playerId || from.locationType !== 'seat' || to.locationType !== 'seat') {
    console.log('Failed: not both seats');
    return false;
  }

  // Same domain adjacency (seat n to seat n+1 or n-1)
  if (from.playerId === to.playerId) {
    const diff = Math.abs((from.seatNumber || 0) - (to.seatNumber || 0));
    console.log('Same domain, diff:', diff);
    return diff === 1;
  }

  // Cross-domain adjacency
  if (from.seatNumber === 6 && to.seatNumber === 1) {
    const expectedNextPlayer = (from.playerId % playerCount) + 1;
    console.log('Cross-domain check (6->1), expected:', expectedNextPlayer, 'actual:', to.playerId);
    return to.playerId === expectedNextPlayer;
  }

  if (to.seatNumber === 6 && from.seatNumber === 1) {
    const expectedPrevPlayer = from.playerId === 1 ? playerCount : from.playerId - 1;
    console.log('Cross-domain check (1->6), expected:', expectedPrevPlayer, 'actual:', to.playerId);
    return to.playerId === expectedPrevPlayer;
  }

  console.log('Failed: not adjacent');
  return false;
}

// Test p2_seat5 to p2_seat6
console.log('\n=== Test: p2_seat5 to p2_seat6 ===');
const result = areSeatsAdjacent('p2_seat5', 'p2_seat6', 4);
console.log('Result:', result);
