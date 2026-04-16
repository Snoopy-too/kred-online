import { useCallback } from 'react';
import { useDiagnosticsContext } from './DiagnosticsContext';
import { DiagnosticEventInput } from './events';

export function useDiagnostics() {
  const { log } = useDiagnosticsContext();
  return useCallback((ev: DiagnosticEventInput) => log(ev), [log]);
}
