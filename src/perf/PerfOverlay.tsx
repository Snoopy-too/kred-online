import React, { useState, useEffect } from "react";
import { PERF_ENABLED } from "./index";
import { usePerfSeries, usePerfCounter } from "./hooks";
import { PerfStore } from "./PerfStore";

/**
 * Dev-only performance overlay component.
 * Displays live metrics from the perf store.
 * Activated via ?perf=1 URL param or Ctrl+Shift+P keybinding.
 */
export function PerfOverlay() {
  if (!PERF_ENABLED) return null;

  return <PerfOverlayContent />;
}

function PerfOverlayContent() {
  const [visible, setVisible] = useState(() => {
    // Check URL param
    const params = new URLSearchParams(window.location.search);
    return params.has("perf");
  });

  const [metricNames, setMetricNames] = useState<{
    series: string[];
    counters: string[];
  }>({
    series: [],
    counters: [],
  });

  // Get store reference
  const store = (globalThis as any).__kred_perf_store as PerfStore | undefined;

  // Poll store for metric names every 500ms
  useEffect(() => {
    if (!store) return;

    const interval = setInterval(() => {
      setMetricNames({
        series: store.listSeriesNames(),
        counters: store.listCounterNames(),
      });
    }, 500);

    return () => clearInterval(interval);
  }, [store]);

  // Handle Ctrl+Shift+P keybinding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Expose dump and clear functions
  useEffect(() => {
    if (store) {
      (globalThis as any).__kred_perf = {
        dump: () => store.dump(),
        clear: () => store.clear(),
        store,
      };
    }
  }, [store]);

  if (!visible || !store) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        width: "300px",
        maxHeight: "400px",
        background: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        borderRadius: "6px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
        overflow: "auto",
        border: "1px solid #444",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "8px",
          borderBottom: "1px solid #444",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: "rgba(0, 0, 0, 0.9)",
        }}
      >
        <span style={{ fontWeight: "bold" }}>Kred Perf</span>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "14px",
            padding: "0 4px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Metrics */}
      <div style={{ padding: "8px" }}>
        {metricNames.series.length === 0 && metricNames.counters.length === 0 ? (
          <div style={{ color: "#888" }}>No metrics yet...</div>
        ) : (
          <>
            {/* Series metrics */}
            {metricNames.series.map((name) => (
              <SeriesMetric key={`series-${name}`} name={name} />
            ))}

            {/* Counter metrics */}
            {metricNames.counters.map((name) => (
              <CounterMetric key={`counter-${name}`} name={name} />
            ))}
          </>
        )}
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: "4px 8px",
          borderTop: "1px solid #444",
          fontSize: "10px",
          color: "#666",
          textAlign: "center",
        }}
      >
        Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}

function SeriesMetric({ name }: { name: string }) {
  const samples = usePerfSeries(name);

  const lastValue = samples.length > 0 ? samples[samples.length - 1].value : 0;
  const avgValue =
    samples.length > 0
      ? samples.reduce((sum, s) => sum + s.value, 0) / samples.length
      : 0;

  return (
    <div
      style={{
        marginBottom: "4px",
        paddingBottom: "4px",
        borderBottom: "1px solid #333",
      }}
    >
      <div style={{ color: "#4af" }}>{name}</div>
      <div style={{ color: "#888", fontSize: "11px" }}>
        last: {lastValue.toFixed(2)} | avg: {avgValue.toFixed(2)}
      </div>
    </div>
  );
}

function CounterMetric({ name }: { name: string }) {
  const count = usePerfCounter(name);

  return (
    <div
      style={{
        marginBottom: "4px",
        paddingBottom: "4px",
        borderBottom: "1px solid #333",
      }}
    >
      <div style={{ color: "#4f4" }}>{name}</div>
      <div style={{ color: "#888", fontSize: "11px" }}>count: {count}</div>
    </div>
  );
}
