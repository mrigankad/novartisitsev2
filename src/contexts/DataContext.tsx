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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
        <div className="flex flex-col items-center">
          <img
            src="/src/assets/Logo.svg"
            alt="Novartis Logo"
            className="h-24 w-24 mb-6 animate-pulse"
          />
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-[0.4em]">
              Loading
            </span>
            <div className="flex gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(152,79%,20%)] animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(152,79%,20%)] animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(152,79%,20%)] animate-bounce" />
            </div>
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
