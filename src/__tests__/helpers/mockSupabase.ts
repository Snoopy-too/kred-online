/**
 * In-process Supabase mock for testing multiplayer scenarios.
 * Provides channels (broadcast + postgres_changes) and table CRUD operations.
 * No real Supabase client — entirely deterministic.
 */

// Simple UUID v4 generator for determinism in tests
function genId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// Types
// ============================================================================

export interface MockAuthSession {
  user?: {
    id: string;
  };
}

interface ChannelSubscriber {
  event: string;
  filter?: Record<string, any>;
  callback: (payload: any) => void;
}

interface MockChannel {
  name: string;
  subscribers: ChannelSubscriber[];
  on(event: string, filter: Record<string, any> | null, callback: (payload: any) => void): MockChannel;
  send(payload: any): void;
  subscribe(): void;
  unsubscribe(): void;
}

interface MockQuery {
  eq(field: string, value: any): MockQuery;
  neq(field: string, value: any): MockQuery;
  gt(field: string, value: any): MockQuery;
  lt(field: string, value: any): MockQuery;
  order(field: string, options: { ascending: boolean }): MockQuery;
  limit(count: number): MockQuery;
  single(): Promise<{ data: any | null; error: any }>;
  execute(): Promise<{ data: any[] | null; error: any }>;
}

export interface MockSupabase {
  auth: {
    getSession(): Promise<{ data: { session: MockAuthSession | null } }>;
    signInAnonymously(): Promise<{ data: { user: { id: string } }; error: any }>;
  };
  channel(name: string, options?: Record<string, any>): MockChannel;
  from(table: string): {
    insert(data: any): Promise<{ data: any; error: any }>;
    select(fields?: string): MockQuery;
    upsert(data: any): Promise<{ data: any; error: any }>;
    update(data: any): MockQuery;
    delete(): MockQuery;
  };
}

// ============================================================================
// Implementation
// ============================================================================

export function createMockSupabase(): MockSupabase {
  const userId = genId();
  const tables: Record<string, any[]> = {
    kred_lobbies: [],
    kred_players: [],
    kred_game_states: [],
    kred_game_actions: [],
  };

  const channels: Record<string, ChannelSubscriber[]> = {};

  // =========================================================================
  // Auth
  // =========================================================================

  const auth = {
    getSession: async () => ({
      data: { session: { user: { id: userId } } },
    }),
    signInAnonymously: async () => ({
      data: { user: { id: genId() } },
      error: null,
    }),
  };

  // =========================================================================
  // Channels
  // =========================================================================

  const channelImpl = (name: string): MockChannel => {
    if (!channels[name]) channels[name] = [];

    return {
      name,
      subscribers: channels[name],
      on(event: string, filter: Record<string, any> | null = null, callback: (payload: any) => void) {
        channels[name].push({ event, filter, callback });
        return this;
      },
      send(payload: any) {
        channels[name].forEach(subscriber => {
          if (subscriber.event === payload.event || payload.type === subscriber.event) {
            subscriber.callback(payload.payload || payload);
          }
        });
      },
      subscribe() {
        // Mark as subscribed (noop for mock)
      },
      unsubscribe() {
        channels[name] = [];
      },
    };
  };

  // =========================================================================
  // Tables
  // =========================================================================

  const fromImpl = (table: string) => {
    const createQueryInstance = (): { filters: Array<(row: any) => boolean>; orderField: string | null; orderAsc: boolean; limitCount: number | null } => ({
      filters: [],
      orderField: null,
      orderAsc: true,
      limitCount: null,
    });

    const buildQuery = (queryState: ReturnType<typeof createQueryInstance>): MockQuery => ({
      eq(field: string, value: any) {
        queryState.filters.push((row: any) => row[field] === value);
        return this;
      },
      neq(field: string, value: any) {
        queryState.filters.push((row: any) => row[field] !== value);
        return this;
      },
      gt(field: string, value: any) {
        queryState.filters.push((row: any) => row[field] > value);
        return this;
      },
      lt(field: string, value: any) {
        queryState.filters.push((row: any) => row[field] < value);
        return this;
      },
      order(field: string, options: { ascending: boolean }) {
        queryState.orderField = field;
        queryState.orderAsc = options.ascending;
        return this;
      },
      limit(count: number) {
        queryState.limitCount = count;
        return this;
      },
      async single() {
        let results = [...(tables[table] || [])];
        queryState.filters.forEach(f => results = results.filter(f));
        if (queryState.orderField) {
          results.sort((a: any, b: any) => {
            const aVal = a[queryState.orderField!];
            const bVal = b[queryState.orderField!];
            if (aVal < bVal) return queryState.orderAsc ? -1 : 1;
            if (aVal > bVal) return queryState.orderAsc ? 1 : -1;
            return 0;
          });
        }
        return { data: results[0] || null, error: null };
      },
      async execute() {
        let results = [...(tables[table] || [])];
        queryState.filters.forEach(f => results = results.filter(f));
        if (queryState.orderField) {
          results.sort((a: any, b: any) => {
            const aVal = a[queryState.orderField!];
            const bVal = b[queryState.orderField!];
            if (aVal < bVal) return queryState.orderAsc ? -1 : 1;
            if (aVal > bVal) return queryState.orderAsc ? 1 : -1;
            return 0;
          });
        }
        if (queryState.limitCount) results = results.slice(0, queryState.limitCount);
        return { data: results, error: null };
      },
    });

    return {
      async insert(data: any) {
        const row = { id: genId(), created_at: new Date().toISOString(), ...data };
        if (!tables[table]) tables[table] = [];
        tables[table].push(row);
        notifyPostgresChanges(table, "INSERT", row);
        return { data: row, error: null };
      },
      select(_fields?: string) {
        return buildQuery(createQueryInstance());
      },
      async upsert(data: any) {
        if (!tables[table]) tables[table] = [];
        const key = Object.keys(data)[0];
        const existingIdx = tables[table].findIndex((r: any) => r[key] === data[key]);
        const row = { id: genId(), created_at: new Date().toISOString(), ...data };
        if (existingIdx >= 0) {
          tables[table][existingIdx] = { ...tables[table][existingIdx], ...row };
          notifyPostgresChanges(table, "UPDATE", tables[table][existingIdx]);
        } else {
          tables[table].push(row);
          notifyPostgresChanges(table, "INSERT", row);
        }
        return { data: row, error: null };
      },
      update(data: any) {
        const queryState = createQueryInstance();
        return {
          ...buildQuery(queryState),
          async execute() {
            let results = [...(tables[table] || [])];
            queryState.filters.forEach(f => results = results.filter(f));
            results.forEach((r: any) => {
              Object.assign(r, data);
              notifyPostgresChanges(table, "UPDATE", r);
            });
            return { data: results, error: null };
          },
        };
      },
      delete() {
        const queryState = createQueryInstance();
        return {
          ...buildQuery(queryState),
          async execute() {
            let results = [...(tables[table] || [])];
            const toDelete = results.filter((r: any) => queryState.filters.every(f => f(r)));
            tables[table] = tables[table].filter((r: any) => !toDelete.includes(r));
            toDelete.forEach(r => notifyPostgresChanges(table, "DELETE", r));
            return { data: toDelete, error: null };
          },
        };
      },
    };
  };

  const notifyPostgresChanges = (table: string, event: string, row: any) => {
    // Notify subscribers listening on postgres_changes
    Object.values(channels).forEach(subs => {
      subs.forEach(sub => {
        if (sub.event === "postgres_changes" || sub.event === "*") {
          sub.callback({ eventType: event, new: row, old: null });
        }
      });
    });
  };

  // =========================================================================
  // Export
  // =========================================================================

  return {
    auth,
    channel: channelImpl,
    from: fromImpl,
  };
}
