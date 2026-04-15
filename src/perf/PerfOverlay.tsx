import { useEffect, useState, useSyncExternalStore } from "react";
import { PERF_ENABLED } from "./index";
import { perfStore } from "./PerfStore";

/**
 * Dev-only perf overlay.
 *
 * Activation: ?perf=1 in the URL OR Ctrl+Shift+P keybinding.
 * Renders nothing when PERF_ENABLED is false (production).
 *
 * The overlay auto-discovers all series + counters in the store and
 * renders them in a small fixed-position panel. No configuration needed.
 */
export function PerfOverlay() {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("perf");
  });

  // Ctrl+Shift+P toggle
  useEffect(() => {
    if (!PERF_ENABLED) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Expose dump() globally for ad-hoc debugging
  useEffect(() => {
    if (!PERF_ENABLED) return;
    (window as any).__kred_perf = {
      dump: () => perfStore.dump(),
      clear: () => perfStore.clear(),
      store: perfStore,
    };
    return () => {
      delete (window as any).__kred_perf;
    };
  }, []);

  // Subscribe to ANY change in the store so we re-render when new series appear
  const tick = useSyncExternalStore(
    (cb) => {
      // Subscribe to a sentinel name; also poll on interval as a cheap fallback
      // for the case where new series are added.
      const id = setInterval(cb, 500);
      return () => clearInterval(id);
    },
    () => Date.now(),
    () => 0
  );
  void tick;

  if (!PERF_ENABLED || !open) return null;

  const seriesNames = perfStore.listSeriesNames();
  const counterNames = perfStore.listCounterNames();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#9fef9f",
        font: "11px/1.3 ui-monospace, Menlo, monospace",
        padding: "8px 10px",
        borderRadius: 6,
        maxWidth: 360,
        maxHeight: "60vh",
        overflowY: "auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
      data-testid="perf-overlay"
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <strong style={{ color: "#fff" }}>perf</strong>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "transparent",
            border: "1px solid #444",
            color: "#9fef9f",
            cursor: "pointer",
            fontSize: 10,
            padding: "0 6px",
          }}
        >
          ×
        </button>
      </div>

      {counterNames.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ color: "#888", marginBottom: 2 }}>counters</div>
          {counterNames.map((name) => (
            <CounterRow key={name} name={name} />
          ))}
        </div>
      )}

      {seriesNames.length > 0 && (
        <div>
          <div style={{ color: "#888", marginBottom: 2 }}>series (last sample)</div>
          {seriesNames.map((name) => (
            <SeriesRow key={name} name={name} />
          ))}
        </div>
      )}

      {counterNames.length === 0 && seriesNames.length === 0 && (
        <div style={{ color: "#666" }}>no metrics yet</div>
      )}
    </div>
  );
}

function CounterRow({ name }: { name: string }) {
  const subscribe = (cb: () => void) => perfStore.subscribe(name, cb);
  const value = useSyncExternalStore(
    subscribe,
    () => perfStore.getCounter(name),
    () => 0
  );
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{name}</span>
      <span>{value}</span>
    </div>
  );
}

function SeriesRow({ name }: { name: string }) {
  const subscribe = (cb: () => void) => perfStore.subscribe(name, cb);
  const series = useSyncExternalStore(
    subscribe,
    () => perfStore.getSeries(name),
    () => ({ name, kind: "histogram" as const, samples: [] })
  );
  const last = series.samples[series.samples.length - 1];
  const avg =
    series.samples.length > 0
      ? series.samples.reduce((a, s) => a + s.v, 0) / series.samples.length
      : 0;
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{name}</span>
      <span>
        {last ? last.v.toFixed(0) : "—"}{" "}
        <span style={{ color: "#666" }}>(avg {avg.toFixed(0)} n={series.samples.length})</span>
      </span>
    </div>
  );
}
