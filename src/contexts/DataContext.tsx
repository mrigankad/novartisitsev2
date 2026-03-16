/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ensureRealDataLoaded, getAllTickets } from "@/data/realData";

type DataContextValue = {
  ready: boolean;
  ticketsCount: number;
  error: string | null;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    ensureRealDataLoaded()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load data");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<DataContextValue>(() => {
    return {
      ready,
      ticketsCount: ready ? getAllTickets().length : 0,
      error,
    };
  }, [ready, error]);

  if (error) {
    return (
      <div className="min-h-screen bg-dashboard-bg text-foreground flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-card border border-border rounded-xl p-6">
          <div className="text-lg font-semibold">Data Load Failed</div>
          <div className="text-sm text-muted-foreground mt-2">{error}</div>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500">
        <div className="flex flex-col items-center">
          <img
            src="/src/assets/Logo.svg"
            alt="Novartis Logo"
            className="h-24 w-24 mb-6 animate-pulse opacity-90"
          />
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] ml-[0.5em]">
              Initializing Dashboard
            </span>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(152,79%,20%)] animate-bounce [animation-delay:-0.3s] shadow-sm" />
              <div className="w-2 h-2 rounded-full bg-[hsl(152,79%,20%)] animate-bounce [animation-delay:-0.15s] shadow-sm" />
              <div className="w-2 h-2 rounded-full bg-[hsl(152,79%,20%)] animate-bounce shadow-sm" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1 animate-pulse">
              Synchronizing with ServiceNow Data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
