import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiagnosticsClient, SupabaseLike } from '../../diagnostics/DiagnosticsClient';

function makeMockSupabase(): SupabaseLike & { calls: any[] } {
  const calls: any[] = [];
  return {
    calls,
    from(table: string) {
      return {
        insert: async (rows: any) => {
          calls.push({ op: 'insert', table, rows });
          return { data: null, error: null };
        },
        update: (patch: any) => ({
          eq: async (_col: string, _val: any) => {
            calls.push({ op: 'update', table, patch });
            return { data: null, error: null };
          },
        }),
        select: (_cols: string) => ({
          eq: (_col: string, _val: any) => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      };
    },
    rpc: async (_name: string, _args: any) => ({ data: null, error: null }),
  };
}

describe('DiagnosticsClient (no-op mode)', () => {
  it('log() silently discards events when not enabled', async () => {
    const sb = makeMockSupabase();
    const c = new DiagnosticsClient({ supabase: sb });
    c.log({ category: 'click', event_type: 'BUTTON_CLICK' });
    c.log({ category: 'click', event_type: 'BUTTON_CLICK' });
    await c.flush();
    expect(sb.calls.length).toBe(0);
  });
});

describe('DiagnosticsClient (enabled — sequence counter)', () => {
  it('assigns monotonic sequence numbers', async () => {
    const sb = makeMockSupabase();
    const c = new DiagnosticsClient({ supabase: sb });
    c.enable({
      sessionId: 's-1', playerIndex: 1, playerName: 'Alice',
      isHost: false, getPhase: () => 'Drafting',
    });
    c.log({ category: 'click', event_type: 'A' });
    c.log({ category: 'click', event_type: 'B' });
    c.log({ category: 'click', event_type: 'C' });
    await c.flush();
    const insertCall = sb.calls.find(x => x.op === 'insert' && x.table === 'kred_diagnostic_events');
    expect(insertCall.rows).toHaveLength(3);
    expect(insertCall.rows.map((r: any) => r.sequence_num)).toEqual([1, 2, 3]);
    expect(insertCall.rows.map((r: any) => r.event_type)).toEqual(['A', 'B', 'C']);
  });
});

describe('DiagnosticsClient (buffering)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('auto-flushes every 2 seconds', async () => {
    const sb = makeMockSupabase();
    const c = new DiagnosticsClient({ supabase: sb, flushIntervalMs: 2000 });
    c.enable({ sessionId: 's-1', playerIndex: 0, playerName: 'H', isHost: true, getPhase: () => null });
    c.log({ category: 'click', event_type: 'X' });
    expect(sb.calls.length).toBe(0);
    await vi.advanceTimersByTimeAsync(2000);
    const ins = sb.calls.filter(x => x.op === 'insert' && x.table === 'kred_diagnostic_events');
    expect(ins).toHaveLength(1);
    expect(ins[0].rows).toHaveLength(1);
  });

  it('drops oldest half when buffer exceeds cap', () => {
    const sb = makeMockSupabase();
    const c = new DiagnosticsClient({ supabase: sb, bufferCap: 4 });
    c.enable({ sessionId: 's-1', playerIndex: 0, playerName: 'H', isHost: true, getPhase: () => null });
    for (let i = 0; i < 6; i++) c.log({ category: 'click', event_type: `e${i}` });
    const buf = c._debugBuffer();
    expect(buf).toHaveLength(3);
    expect(buf[0].event_type).toBe('e3');
    expect(buf[2].event_type).toBe('e5');
  });
});

describe('DiagnosticsClient (error isolation)', () => {
  it('failed flush re-buffers events and does not throw', async () => {
    let shouldFail = true;
    const failingSb: SupabaseLike = {
      from() {
        return {
          insert: async () => (shouldFail ? { data: null, error: new Error('net') } : { data: null, error: null }),
          update: () => ({ eq: async () => ({ data: null, error: null }) }),
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
        };
      },
      rpc: async () => ({ data: null, error: null }),
    };
    const c = new DiagnosticsClient({ supabase: failingSb });
    c.enable({ sessionId: 's-1', playerIndex: 0, playerName: 'H', isHost: true, getPhase: () => null });
    c.log({ category: 'click', event_type: 'X' });
    await expect(c.flush()).resolves.toBeUndefined();
    expect(c._debugBuffer()).toHaveLength(1);
    shouldFail = false;
    await c.flush();
    expect(c._debugBuffer()).toHaveLength(0);
  });
});
