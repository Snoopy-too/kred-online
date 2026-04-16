export const EVENT_CATEGORIES = [
  'lobby', 'phase', 'click', 'dialog', 'selection',
  'drag', 'move', 'challenge', 'bureaucracy', 'system', 'error',
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];

export interface DiagnosticEventInput {
  category: EventCategory;
  event_type: string;
  payload?: Record<string, unknown>;
}

export interface DiagnosticEventContext {
  sessionId: string;
  playerIndex: number | null;
  playerName: string | null;
  phase: string | null;
  sequenceNum: number;
}

export interface DiagnosticEventRow {
  session_id: string;
  occurred_at: string;
  player_index: number | null;
  player_name: string | null;
  category: EventCategory;
  event_type: string;
  phase: string | null;
  payload: Record<string, unknown>;
  sequence_num: number;
}

export function buildEvent(
  input: DiagnosticEventInput,
  ctx: DiagnosticEventContext,
): DiagnosticEventRow {
  return {
    session_id: ctx.sessionId,
    occurred_at: new Date().toISOString(),
    player_index: ctx.playerIndex,
    player_name: ctx.playerName,
    category: input.category,
    event_type: input.event_type,
    phase: ctx.phase,
    payload: input.payload ?? {},
    sequence_num: ctx.sequenceNum,
  };
}
