import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DiagnosticsClient, SupabaseLike } from './DiagnosticsClient';
import { DiagnosticEventInput } from './events';
import { setErrorHandler } from './errorSink';

interface DiagnosticsContextValue {
  log: (ev: DiagnosticEventInput) => void;
  enabled: boolean;
}

const DiagnosticsContext = createContext<DiagnosticsContextValue>({
  log: () => {},
  enabled: false,
});

export interface DiagnosticsProviderProps {
  children: React.ReactNode;
  lobbyId: string | null;
  isHost: boolean;
  playerIndex: number | null;
  playerName: string | null;
  pin: string | null;
  playerCount: number | null;
  playerNames: string[];
  hostName: string | null;
  diagnosticEnabled: boolean;
  currentPhase: string | null;
}

export function DiagnosticsProvider(props: DiagnosticsProviderProps) {
  const clientRef = useRef<DiagnosticsClient | null>(null);
  if (clientRef.current === null) {
    clientRef.current = new DiagnosticsClient({ supabase: supabase as unknown as SupabaseLike });
  }
  const phaseRef = useRef(props.currentPhase);
  phaseRef.current = props.currentPhase;

  useEffect(() => {
    const client = clientRef.current!;
    if (!props.diagnosticEnabled || !props.lobbyId || props.playerIndex === null || !props.playerName) {
      client.disable();
      return;
    }
    let cancelled = false;
    (async () => {
      const sessionId = await client.createOrAttachSession({
        isHost: props.isHost,
        lobbyId: props.lobbyId!,
        pin: props.pin ?? '',
        playerCount: props.playerCount ?? 0,
        hostName: props.hostName ?? '',
        playerNames: props.playerNames,
      });
      if (cancelled || !sessionId) return;
      client.enable({
        sessionId,
        playerIndex: props.playerIndex!,
        playerName: props.playerName!,
        isHost: props.isHost,
        getPhase: () => phaseRef.current,
      });
    })();
    const flushOnUnload = () => { void client.flush(); };
    window.addEventListener('beforeunload', flushOnUnload);
    return () => {
      cancelled = true;
      window.removeEventListener('beforeunload', flushOnUnload);
      void client.flush();
      client.disable();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.diagnosticEnabled, props.lobbyId, props.isHost, props.playerIndex]);

  useEffect(() => {
    const client = clientRef.current!;
    void client.flush();
  }, [props.currentPhase]);

  useEffect(() => {
    setErrorHandler(({ message, stack, source }) => {
      clientRef.current?.log({
        category: 'error',
        event_type: 'CLIENT_ERROR',
        payload: { message, stack, source },
      });
    });
    return () => setErrorHandler(() => {});
  }, []);

  const value = useMemo<DiagnosticsContextValue>(() => ({
    log: (ev) => clientRef.current?.log(ev),
    enabled: props.diagnosticEnabled,
  }), [props.diagnosticEnabled]);

  return <DiagnosticsContext.Provider value={value}>{props.children}</DiagnosticsContext.Provider>;
}

export function useDiagnosticsContext() {
  return useContext(DiagnosticsContext);
}
