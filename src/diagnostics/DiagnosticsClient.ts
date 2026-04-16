import { buildEvent, DiagnosticEventInput, DiagnosticEventRow } from './events';

export interface SupabaseLike {
  from(table: string): {
    insert: (rows: any) => Promise<{ data: any; error: any }>;
    update: (patch: any) => { eq: (col: string, val: any) => Promise<{ data: any; error: any }> };
    select: (cols: string) => {
      eq: (col: string, val: any) => { maybeSingle: () => Promise<{ data: any; error: any }> };
    };
  };
  rpc(name: string, args: Record<string, unknown>): Promise<{ data: any; error: any }>;
}

export interface EnableConfig {
  sessionId: string;
  playerIndex: number;
  playerName: string;
  isHost: boolean;
  getPhase: () => string | null;
}

export interface ClientOptions {
  supabase: SupabaseLike;
  flushIntervalMs?: number;
  bufferCap?: number;
}

const DEFAULT_FLUSH_MS = 2000;
const DEFAULT_BUFFER_CAP = 10_000;

export class DiagnosticsClient {
  private supabase: SupabaseLike;
  private enabled = false;
  private config: EnableConfig | null = null;
  private buffer: DiagnosticEventRow[] = [];
  private sequence = 0;
  private flushIntervalMs: number;
  private bufferCap: number;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(opts: ClientOptions) {
    this.supabase = opts.supabase;
    this.flushIntervalMs = opts.flushIntervalMs ?? DEFAULT_FLUSH_MS;
    this.bufferCap = opts.bufferCap ?? DEFAULT_BUFFER_CAP;
  }

  enable(cfg: EnableConfig): void {
    this.enabled = true;
    this.config = cfg;
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = setInterval(() => { void this.flush(); }, this.flushIntervalMs);
  }

  disable(): void {
    this.enabled = false;
    this.config = null;
    if (this.timer !== null) { clearInterval(this.timer); this.timer = null; }
  }

  log(input: DiagnosticEventInput): void {
    if (!this.enabled || !this.config) return;
    this.sequence += 1;
    const row = buildEvent(input, {
      sessionId: this.config.sessionId,
      playerIndex: this.config.playerIndex,
      playerName: this.config.playerName,
      phase: this.config.getPhase(),
      sequenceNum: this.sequence,
    });
    this.buffer.push(row);
    if (this.buffer.length > this.bufferCap) {
      const keep = Math.ceil(this.bufferCap / 2);
      const dropCount = this.buffer.length - keep;
      this.buffer.splice(0, dropCount);
      console.warn(`[diagnostics] buffer exceeded ${this.bufferCap}, dropped ${dropCount} oldest events`);
    }
  }

  async flush(): Promise<void> {
    if (!this.enabled || this.buffer.length === 0) return;
    const toSend = this.buffer.splice(0, this.buffer.length);
    try {
      const { error } = await this.supabase.from('kred_diagnostic_events').insert(toSend);
      if (error) {
        this.buffer.unshift(...toSend);
        console.warn('[diagnostics] flush failed, events requeued', error);
        return;
      }
      if (this.config?.isHost) {
        await this.supabase.rpc('increment_diag_event_count', {
          p_session_id: this.config.sessionId,
          p_delta: toSend.length,
        });
      }
    } catch (err) {
      this.buffer.unshift(...toSend);
      console.warn('[diagnostics] flush threw', err);
    }
  }

  _debugBuffer(): DiagnosticEventRow[] {
    return this.buffer.slice();
  }
}
