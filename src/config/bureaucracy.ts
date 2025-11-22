/**
 * Bureaucracy Configuration
 *
 * Purpose: Defines bureaucracy phase menus for different player counts
 * Dependencies: Bureaucracy types from src/types (via game.ts until types are extracted)
 *
 * @module config/bureaucracy
 */

import type {
  BureaucracyMenuItem,
  BureaucracyItemType,
  BureaucracyMoveType,
  PromotionLocationType,
} from "../../game";

/**
 * BUREAUCRACY MENU - 3 and 4 Player Modes
 *
 * Menu of items that players can purchase during the Bureaucracy phase.
 * Prices are balanced for 3-4 player games.
 *
 * Item categories:
 * - PROMOTION items: Upgrade pieces at different locations (Office, Rostrum, Seat)
 * - MOVE items: Purchase specific move types
 * - CREDIBILITY: Restore credibility notches
 *
 * Menu is sorted by price from highest (18) to lowest (3).
 */
export const THREE_FOUR_PLAYER_BUREAUCRACY_MENU: BureaucracyMenuItem[] = [
  {
    id: "promote_office",
    type: "PROMOTION",
    promotionLocation: "OFFICE",
    price: 18,
    description:
      "Promote a piece in the Office from Mark to Heel OR Heel to Pawn",
  },
  {
    id: "move_assist",
    type: "MOVE",
    moveType: "ASSIST",
    price: 15,
    description: "",
  },
  {
    id: "move_remove",
    type: "MOVE",
    moveType: "REMOVE",
    price: 15,
    description: "",
  },
  {
    id: "move_influence",
    type: "MOVE",
    moveType: "INFLUENCE",
    price: 15,
    description: "",
  },
  {
    id: "promote_rostrum",
    type: "PROMOTION",
    promotionLocation: "ROSTRUM",
    price: 12,
    description:
      "Promote a piece in a Rostrum from Mark to Heel OR Heel to Pawn",
  },
  {
    id: "move_advance",
    type: "MOVE",
    moveType: "ADVANCE",
    price: 9,
    description: "",
  },
  {
    id: "move_withdraw",
    type: "MOVE",
    moveType: "WITHDRAW",
    price: 9,
    description: "",
  },
  {
    id: "move_organize",
    type: "MOVE",
    moveType: "ORGANIZE",
    price: 9,
    description: "",
  },
  {
    id: "promote_seat",
    type: "PROMOTION",
    promotionLocation: "SEAT",
    price: 6,
    description: "Promote a piece in a Seat from Mark to Heel OR Heel to Pawn",
  },
  {
    id: "credibility",
    type: "CREDIBILITY",
    price: 3,
    description: "Restore one notch to your Credibility",
  },
];

/**
 * BUREAUCRACY MENU - 5 Player Mode
 *
 * Menu of items that players can purchase during the Bureaucracy phase.
 * Prices are balanced for 5 player games (approximately 2/3 of 3-4 player prices).
 *
 * Same structure and item types as 3-4 player menu, but with adjusted pricing
 * to account for the additional player and different economic balance.
 *
 * Menu is sorted by price from highest (12) to lowest (2).
 */
export const FIVE_PLAYER_BUREAUCRACY_MENU: BureaucracyMenuItem[] = [
  {
    id: "promote_office",
    type: "PROMOTION",
    promotionLocation: "OFFICE",
    price: 12,
    description:
      "Promote a piece in the Office from Mark to Heel OR Heel to Pawn",
  },
  {
    id: "move_assist",
    type: "MOVE",
    moveType: "ASSIST",
    price: 10,
    description: "",
  },
  {
    id: "move_remove",
    type: "MOVE",
    moveType: "REMOVE",
    price: 10,
    description: "",
  },
  {
    id: "move_influence",
    type: "MOVE",
    moveType: "INFLUENCE",
    price: 10,
    description: "",
  },
  {
    id: "promote_rostrum",
    type: "PROMOTION",
    promotionLocation: "ROSTRUM",
    price: 8,
    description:
      "Promote a piece in a Rostrum from Mark to Heel OR Heel to Pawn",
  },
  {
    id: "move_advance",
    type: "MOVE",
    moveType: "ADVANCE",
    price: 6,
    description: "",
  },
  {
    id: "move_withdraw",
    type: "MOVE",
    moveType: "WITHDRAW",
    price: 6,
    description: "",
  },
  {
    id: "move_organize",
    type: "MOVE",
    moveType: "ORGANIZE",
    price: 6,
    description: "",
  },
  {
    id: "promote_seat",
    type: "PROMOTION",
    promotionLocation: "SEAT",
    price: 4,
    description: "Promote a piece in a Seat from Mark to Heel OR Heel to Pawn",
  },
  {
    id: "credibility",
    type: "CREDIBILITY",
    price: 2,
    description: "Restore one notch to your Credibility",
  },
];
