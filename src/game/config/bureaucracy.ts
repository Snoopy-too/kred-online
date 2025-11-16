/**
 * Bureaucracy Configuration
 * Defines bureaucracy menu items for different player counts
 */

import { BureaucracyMenuItem } from '../types';

/**
 * Bureaucracy menu for 3 and 4 player modes
 * Prices are higher in lower player count games
 */
export const THREE_FOUR_PLAYER_BUREAUCRACY_MENU: BureaucracyMenuItem[] = [
  {
    id: 'promote_office',
    type: 'PROMOTION',
    promotionLocation: 'OFFICE',
    price: 18,
    description:
      'Promote a piece in the Office from Mark to Heel OR Heel to Pawn',
  },
  {
    id: 'move_assist',
    type: 'MOVE',
    moveType: 'ASSIST',
    price: 15,
    description: '',
  },
  {
    id: 'move_remove',
    type: 'MOVE',
    moveType: 'REMOVE',
    price: 15,
    description: '',
  },
  {
    id: 'move_influence',
    type: 'MOVE',
    moveType: 'INFLUENCE',
    price: 15,
    description: '',
  },
  {
    id: 'promote_rostrum',
    type: 'PROMOTION',
    promotionLocation: 'ROSTRUM',
    price: 12,
    description:
      'Promote a piece in a Rostrum from Mark to Heel OR Heel to Pawn',
  },
  {
    id: 'move_advance',
    type: 'MOVE',
    moveType: 'ADVANCE',
    price: 9,
    description: '',
  },
  {
    id: 'move_withdraw',
    type: 'MOVE',
    moveType: 'WITHDRAW',
    price: 9,
    description: '',
  },
  {
    id: 'move_organize',
    type: 'MOVE',
    moveType: 'ORGANIZE',
    price: 9,
    description: '',
  },
  {
    id: 'promote_seat',
    type: 'PROMOTION',
    promotionLocation: 'SEAT',
    price: 6,
    description: 'Promote a piece in a Seat from Mark to Heel OR Heel to Pawn',
  },
  {
    id: 'credibility',
    type: 'CREDIBILITY',
    price: 3,
    description: 'Restore one notch to your Credibility',
  },
];

/**
 * Bureaucracy menu for 5 player mode
 * Prices are lower in 5-player games
 */
export const FIVE_PLAYER_BUREAUCRACY_MENU: BureaucracyMenuItem[] = [
  {
    id: 'promote_office',
    type: 'PROMOTION',
    promotionLocation: 'OFFICE',
    price: 12,
    description:
      'Promote a piece in the Office from Mark to Heel OR Heel to Pawn',
  },
  {
    id: 'move_assist',
    type: 'MOVE',
    moveType: 'ASSIST',
    price: 10,
    description: '',
  },
  {
    id: 'move_remove',
    type: 'MOVE',
    moveType: 'REMOVE',
    price: 10,
    description: '',
  },
  {
    id: 'move_influence',
    type: 'MOVE',
    moveType: 'INFLUENCE',
    price: 10,
    description: '',
  },
  {
    id: 'promote_rostrum',
    type: 'PROMOTION',
    promotionLocation: 'ROSTRUM',
    price: 8,
    description:
      'Promote a piece in a Rostrum from Mark to Heel OR Heel to Pawn',
  },
  {
    id: 'move_advance',
    type: 'MOVE',
    moveType: 'ADVANCE',
    price: 6,
    description: '',
  },
  {
    id: 'move_withdraw',
    type: 'MOVE',
    moveType: 'WITHDRAW',
    price: 6,
    description: '',
  },
  {
    id: 'move_organize',
    type: 'MOVE',
    moveType: 'ORGANIZE',
    price: 6,
    description: '',
  },
  {
    id: 'promote_seat',
    type: 'PROMOTION',
    promotionLocation: 'SEAT',
    price: 4,
    description: 'Promote a piece in a Seat from Mark to Heel OR Heel to Pawn',
  },
  {
    id: 'credibility',
    type: 'CREDIBILITY',
    price: 2,
    description: 'Restore one notch to your Credibility',
  },
];

/**
 * Get bureaucracy menu for a specific player count
 */
export function getBureaucracyMenuByPlayerCount(
  playerCount: number
): BureaucracyMenuItem[] {
  return playerCount === 5
    ? FIVE_PLAYER_BUREAUCRACY_MENU
    : THREE_FOUR_PLAYER_BUREAUCRACY_MENU;
}
