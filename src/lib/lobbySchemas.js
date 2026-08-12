import { z } from 'zod';

/**
 * Zod schema for validating 6-digit room PINs.
 */
export const PinSchema = z
  .string()
  .trim()
  .length(6, { message: 'Room PIN must be exactly 6 digits.' })
  .regex(/^\d{6}$/, { message: 'Room PIN must contain numbers only.' });

/**
 * Zod schema for creating a new online lobby.
 */
export const CreateLobbySchema = z.object({
  playerCount: z
    .number()
    .int()
    .min(3, { message: 'Minimum 3 players required.' })
    .max(5, { message: 'Maximum 5 players supported.' }),
  hostName: z
    .string()
    .trim()
    .min(1, { message: 'Host name cannot be empty.' })
    .max(20, { message: 'Host name max 20 characters.' })
});

/**
 * Zod schema for joining an online lobby.
 */
export const JoinLobbySchema = z.object({
  pin: PinSchema,
  playerName: z
    .string()
    .trim()
    .min(1, { message: 'Player name cannot be empty.' })
    .max(20, { message: 'Player name max 20 characters.' })
});

/**
 * Zod schema for game state update verification.
 */
export const GameStatePayloadSchema = z.object({
  lobby_id: z.string().uuid(),
  phase: z.string(),
  state_json: z.record(z.any()),
  version: z.number().int().nonnegative()
});

/**
 * Zod schema for game board calibration verification.
 */
export const CalibrationDataSchema = z.object({
  num_players: z.number().int().min(3).max(5),
  hotspots: z.record(z.any()),
  perspective_offsets: z.record(z.any()).optional().nullable(),
  updated_at: z.string().optional()
});

