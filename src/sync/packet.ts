/**
 * Wire packet types for host → guest sync.
 *
 * DB persistence always stores the FULL state (kred_game_states.state_json).
 * Only the broadcast payload uses this discriminated union.
 *
 * Delta semantics: shallow per top-level field. If `prev[k] !== next[k]`
 * (reference inequality) the key is included in the patch. Providers use
 * immutable updates, so this is both cheap and accurate.
 */

export type FullState = Record<string, unknown>;

export type StatePacket =
  | {
      kind: "full";
      v: number;
      ts: number;
      state: FullState;
    }
  | {
      kind: "delta";
      v: number;
      ts: number;
      baseV: number;
      patch: Partial<FullState>;
    };

export interface BuildDeltaInput {
  prev: FullState | null;
  next: FullState;
  prevVersion: number;
  nextVersion: number;
  ts: number;
  /** Force full on phase change / heartbeat / rejoin. */
  forceFull: boolean;
}

/**
 * Produces either a full packet or a delta packet based on the inputs.
 * `forceFull` takes precedence. If prev is null, always produces full.
 */
export function buildPacket(input: BuildDeltaInput): StatePacket {
  const { prev, next, nextVersion, ts, forceFull, prevVersion } = input;

  if (forceFull || prev === null) {
    return { kind: "full", v: nextVersion, ts, state: next };
  }

  const patch: Partial<FullState> = {};
  let changed = 0;
  for (const key of Object.keys(next)) {
    if (!Object.is(prev[key], next[key])) {
      patch[key] = next[key];
      changed++;
    }
  }
  // Detect removed keys (unlikely in practice but possible).
  for (const key of Object.keys(prev)) {
    if (!(key in next)) {
      patch[key] = undefined;
      changed++;
    }
  }

  // If nothing changed, callers should not be pushing at all — but be safe.
  if (changed === 0) {
    return { kind: "delta", v: nextVersion, ts, baseV: prevVersion, patch: {} };
  }

  return { kind: "delta", v: nextVersion, ts, baseV: prevVersion, patch };
}

/**
 * Apply a delta to a base state. Returns a new state object.
 * Undefined values in the patch are treated as key deletions.
 */
export function applyDelta(base: FullState, patch: Partial<FullState>): FullState {
  const next: FullState = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) delete next[k];
    else next[k] = v;
  }
  return next;
}

/**
 * Heartbeat policy: every Nth push should be a full snapshot.
 * Counts FULL pushes so that a gap-free stream of deltas still produces
 * a full every N deltas.
 */
export function shouldSendFull(
  pushCount: number,
  heartbeatN: number,
  phaseChanged: boolean,
  rejoin: boolean,
): boolean {
  if (rejoin || phaseChanged) return true;
  if (pushCount === 0) return true; // first push is always full
  return pushCount % heartbeatN === 0;
}