/**
 * Asset URL helper: resolves asset paths with correct base URL across
 * standalone dev/preview, lobby subpath hosting, and static deployments.
 */
export function getAssetUrl(path) {
  if (!path) return '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${cleanPath}`;
}

export function getTileImageUrl(tileId) {
  if (!tileId) return getAssetUrl('images/tile_back.svg');
  if (tileId === 'BLANK') return getAssetUrl('images/BLANK.svg');
  const padded = String(tileId).padStart(2, '0');
  return getAssetUrl(`images/${padded}.svg`);
}

export function getBoardImageUrl(numPlayers) {
  const map = {
    3: getAssetUrl('images/KREDonline_3P.png'),
    4: getAssetUrl('images/4player_board.png'),
    5: getAssetUrl('images/KREDonline_5P.png')
  };
  return map[numPlayers] || map[3];
}

export function getPieceIconUrl(type, isPawn = false) {
  if (isPawn || type === 'Pawn') return getAssetUrl('images/pawn-transparent_bg.png');
  if (type === 'Heel') return getAssetUrl('images/heel-transparent_bg.png');
  return getAssetUrl('images/mark-transparent_bg.png');
}

export function getCredibilityIconUrl(credScore) {
  return getAssetUrl(`images/${credScore}_credibility.svg`);
}
