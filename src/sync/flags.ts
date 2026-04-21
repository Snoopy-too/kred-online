/**
 * Sync layer feature flags.
 *
 * Both default ON in dev so the PerfStore can measure their impact.
 * Both default OFF in prod until a maintainer flips them after
 * manual validation on real hardware. To revert either feature,
 * flip the const and ship.
 */

// @ts-ignore - Vite provides import.meta.env
const DEV = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : (import.meta as any).env?.DEV;

/** Use delta wire format with full-snapshot heartbeats. */
export const SYNC_DELTAS = DEV; // TODO flip to true in prod after validation

/** Use queueMicrotask + flushSync between queued actions (instead of setTimeout 0). */
export const SYNC_MICROTASK_YIELD = DEV; // TODO flip to true in prod after validation

/** Full snapshot every Nth broadcast to bound delta chain length. */
export const FULL_SNAPSHOT_HEARTBEAT_N = 20;