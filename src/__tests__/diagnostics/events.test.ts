import { describe, it, expect } from 'vitest';
import { buildEvent, EVENT_CATEGORIES, DiagnosticEventInput } from '../../diagnostics/events';

describe('diagnostics events', () => {
  it('exposes all expected categories', () => {
    expect(EVENT_CATEGORIES).toEqual([
      'lobby', 'phase', 'click', 'dialog', 'selection',
      'drag', 'move', 'challenge', 'bureaucracy', 'system', 'error',
    ]);
  });

  it('buildEvent fills defaults and preserves caller fields', () => {
    const input: DiagnosticEventInput = {
      category: 'click',
      event_type: 'BUTTON_CLICK',
      payload: { label: 'OK' },
    };
    const ev = buildEvent(input, {
      sessionId: 's-1',
      playerIndex: 2,
      playerName: 'Bob',
      phase: 'Campaign',
      sequenceNum: 42,
    });
    expect(ev.session_id).toBe('s-1');
    expect(ev.player_index).toBe(2);
    expect(ev.player_name).toBe('Bob');
    expect(ev.phase).toBe('Campaign');
    expect(ev.category).toBe('click');
    expect(ev.event_type).toBe('BUTTON_CLICK');
    expect(ev.payload).toEqual({ label: 'OK' });
    expect(ev.sequence_num).toBe(42);
    expect(typeof ev.occurred_at).toBe('string');
    expect(new Date(ev.occurred_at).getTime()).toBeGreaterThan(0);
  });

  it('buildEvent allows null player for system events', () => {
    const ev = buildEvent(
      { category: 'system', event_type: 'RECONNECT_ATTEMPT' },
      { sessionId: 's-1', playerIndex: null, playerName: null, phase: null, sequenceNum: 1 },
    );
    expect(ev.player_index).toBeNull();
    expect(ev.player_name).toBeNull();
    expect(ev.payload).toEqual({});
  });
});
