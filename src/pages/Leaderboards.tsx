import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

import { DrillDownModal } from "@/components/dashboard/DrillDownModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useFilters } from "@/contexts/FilterContext";
import { getFilteredTickets, type Ticket } from "@/data/realData";
import { cn } from "@/lib/utils";

type LeaderboardMode = "resolver" | "assignee";
type SortKey = "total" | "slaMetRate" | "reopened" | "highHop" | "name";
type SortDir = "asc" | "desc";

function coerceNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function isReopened(t: Ticket) {
  if (typeof t.reopenCount === "number") return t.reopenCount > 0;
  const title = String(t.title ?? "").toLowerCase();
  const status = String(t.status ?? "").toLowerCase();
  return title.includes("reopen") || title.includes("re-open") || status.includes("reopen");
}

function getInitials(name: string) {
  const cleaned = String(name ?? "").trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return `${first}${second ?? ""}`.toUpperCase();
}

type Tone = "good" | "warn" | "bad";

function slaTone(rate: number): Tone {
  if (rate >= 95) return "good";
  if (rate >= 85) return "warn";
  return "bad";
}

function ratioTone(numerator: number, denominator: number): Tone {
  if (denominator <= 0) return "warn";
  const pct = (numerator / denominator) * 100;
  if (pct <= 2) return "good";
  if (pct <= 8) return "warn";
  return "bad";
}

function defaultSortDir(key: SortKey): SortDir {
  return key === "name" ? "asc" : "desc";
}

export default function Leaderboards() {
  const { filters } = useFilters();
  const [mode, setMode] = useState<LeaderboardMode>("resolver");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<string | null>(null);

  const tickets = useMemo(() => getFilteredTickets({ ...filters, ticketStatus: "all" }), [filters]);

  const rows = useMemo(() => {
    const by = new Map<
      string,
      {
        name: string;
        tickets: Ticket[];
        total: number;
        reopened: number;
        highHop: number;
        slaMet: number;
      }
    >();

    for (const t of tickets) {
      const rawName = mode === "resolver" ? t.resolver : t.assignee;
      const name = (rawName && String(rawName).trim()) || "Unspecified";

      const existing = by.get(name) ?? { name, tickets: [], total: 0, reopened: 0, highHop: 0, slaMet: 0 };
      existing.tickets.push(t);
      existing.total += 1;
      if (isReopened(t)) existing.reopened += 1;
      const hops = coerceNumber(t.reassignmentCount) ?? 0;
      if (hops >= 3) existing.highHop += 1;
      if (t.slaStatus === "met") existing.slaMet += 1;
      by.set(name, existing);
    }

    const prepared = Array.from(by.values()).map((r) => {
      const slaMetRate = r.total > 0 ? (r.slaMet / r.total) * 100 : 0;
      return { ...r, slaMetRate: Number(slaMetRate.toFixed(1)) };
    });

    const direction = sortDir === "asc" ? 1 : -1;
    prepared.sort((a, b) => {
      if (sortKey === "name") {
        return direction * a.name.localeCompare(b.name);
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av !== bv) return direction * (av - bv);
      return a.name.localeCompare(b.name);
    });

    return prepared;
  }, [tickets, mode, sortDir, sortKey]);

  const selectedRow = useMemo(() => {
    if (!selected) return null;
    return rows.find((r) => r.name === selected) ?? null;
  }, [rows, selected]);

  const drilldownData = useMemo(() => {
    const base = selectedRow?.tickets ?? [];
    return base.map((t) => ({
      ticketId: t.ticketId,
      title: t.title,
      priority: t.priority,
      status: t.status,
      assignedTo: t.assignee,
      resolvedBy: t.resolver ?? "",
      created: t.created,
      reopened: isReopened(t) ? "yes" : "no",
      hops: coerceNumber(t.reassignmentCount) ?? 0,
      sla: t.slaStatus,
    }));
  }, [selectedRow]);

  const modeLabel = mode === "resolver" ? "Resolved By" : "Assigned To";
  const shown = rows;

  return (
    <div className="min-h-screen bg-dashboard-bg w-full pb-10 relative">
      <div className="w-full">
        <DashboardHeader />

        <div className="w-full px-6 py-6 transition-all">
          <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-h-[85vh] flex flex-col">
            {/* Professional Integrated Toolbar */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[hsl(152,79%,20%)] p-1.5 rounded-md text-white shadow-md transition-transform hover:scale-105">
                  <img src="/favicon.svg" alt="Novartis" className="h-5 w-5 brightness-0 invert" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Leaderboard Summary</h2>
                </div>
                <div className="h-8 w-[1px] bg-slate-300 mx-2" />
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-md shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Records:</span>
                  <span className="text-xs font-black text-slate-700">{shown.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grouping Strategy</span>
                  <Select value={mode} onValueChange={(v) => setMode(v as LeaderboardMode)}>
                    <SelectTrigger className="h-9 w-[180px] bg-white border-slate-300 text-xs font-semibold shadow-sm hover:border-slate-400 focus:ring-2 focus:ring-primary/10 transition-all rounded-lg">
                      <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resolver">Resolved By</SelectItem>
                      <SelectItem value="assignee">Assigned To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <Table className="min-w-full border-collapse relative">
                <TableHeader className="bg-slate-50/80 backdrop-blur-sm border-b-2 border-slate-300 sticky top-0 z-20 shadow-sm">
                  <TableRow className="hover:bg-transparent border-none h-10">
                    <TableHead className="w-[60px] border-r border-slate-300 text-[11px] uppercase tracking-wider font-bold text-slate-600 px-3">
                      Rank
                    </TableHead>
                    <TableHead className="border-r border-slate-300 text-[11px] uppercase tracking-wider font-bold text-slate-600 px-3">
                      <button
                        type="button"
                        className="group inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => {
                          if (sortKey === "name") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          else {
                            setSortKey("name");
                            setSortDir(defaultSortDir("name"));
                          }
                        }}
                      >
                        Name
                        {sortKey === "name" ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3 w-3 text-primary" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-primary" />
                          )
                        ) : (
                          <ChevronDown className="h-3 w-3 opacity-20" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-right w-[110px] border-r border-slate-300 text-[11px] uppercase tracking-wider font-bold text-slate-600 px-3">
                      <button
                        type="button"
                        className="group inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => {
                          if (sortKey === "total") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          else {
                            setSortKey("total");
                            setSortDir(defaultSortDir("total"));
                          }
                        }}
                      >
                        Total
                        {sortKey === "total" ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3 w-3 text-primary" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-primary" />
                          )
                        ) : (
                          <ChevronDown className="h-3 w-3 opacity-20" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-right w-[110px] border-r border-slate-300 text-[11px] uppercase tracking-wider font-bold text-slate-600 px-3">
                      <button
                        type="button"
                        className="group inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => {
                          if (sortKey === "slaMetRate") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          else {
                            setSortKey("slaMetRate");
                            setSortDir(defaultSortDir("slaMetRate"));
                          }
                        }}
                      >
                        SLA Met
                        {sortKey === "slaMetRate" ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3 w-3 text-primary" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-primary" />
                          )
                        ) : (
                          <ChevronDown className="h-3 w-3 opacity-20" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-right w-[110px] border-r border-slate-300 text-[11px] uppercase tracking-wider font-bold text-slate-600 px-3">
                      <button
                        type="button"
                        className="group inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => {
                          if (sortKey === "reopened") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          else {
                            setSortKey("reopened");
                            setSortDir(defaultSortDir("reopened"));
                          }
                        }}
                      >
                        Reopened
                        {sortKey === "reopened" ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3 w-3 text-primary" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-primary" />
                          )
                        ) : (
                          <ChevronDown className="h-3 w-3 opacity-20" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-right w-[110px] text-[11px] uppercase tracking-wider font-bold text-slate-600 px-3">
                      <button
                        type="button"
                        className="group inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => {
                          if (sortKey === "highHop") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          else {
                            setSortKey("highHop");
                            setSortDir(defaultSortDir("highHop"));
                          }
                        }}
                      >
                        High Hops
                        {sortKey === "highHop" ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3 w-3 text-primary" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-primary" />
                          )
                        ) : (
                          <ChevronDown className="h-3 w-3 opacity-20" />
                        )}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shown.map((r, idx) => {
                    const rank = idx + 1;
                    const initials = getInitials(r.name);
                    const reopenTone = ratioTone(r.reopened, r.total);
                    const hopsTone = ratioTone(r.highHop, r.total);

                    return (
                      <TableRow
                        key={r.name}
                        data-state={selected === r.name ? "selected" : undefined}
                        className={cn(
                          "group cursor-pointer border-b border-slate-200 h-10 transition-none",
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                          "hover:bg-blue-50/40",
                          "data-[state=selected]:bg-blue-100/50"
                        )}
                        onClick={() => setSelected(r.name)}
                      >
                        <TableCell className="text-slate-500 py-1.5 px-3 border-r border-slate-200 text-center font-mono text-xs">
                          {rank}
                        </TableCell>

                        <TableCell className="font-medium text-slate-800 py-1.5 px-4 border-r border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0 border border-slate-200">
                              {initials}
                            </div>
                            <span className="truncate">{r.name}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right py-1.5 px-4 border-r border-slate-200 font-mono text-xs text-slate-700">
                          {r.total.toLocaleString()}
                        </TableCell>

                        <TableCell className="text-right py-1.5 px-4 border-r border-slate-200">
                          <div className="flex justify-end items-center gap-2">
                            <span className="font-mono text-xs text-slate-700">{r.slaMetRate.toFixed(1)}%</span>
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              slaTone(r.slaMetRate) === "good" ? "bg-emerald-500" :
                                slaTone(r.slaMetRate) === "warn" ? "bg-amber-500" : "bg-red-500"
                            )} />
                          </div>
                        </TableCell>

                        <TableCell className="text-right py-1.5 px-4 border-r border-slate-200">
                          <div className="flex justify-end items-center gap-2">
                            <span className="font-mono text-xs text-slate-700">{r.reopened.toLocaleString()}</span>
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              reopenTone === "good" ? "bg-emerald-500" :
                                reopenTone === "warn" ? "bg-amber-500" : "bg-red-500"
                            )} />
                          </div>
                        </TableCell>

                        <TableCell className="text-right py-1.5 px-4">
                          <div className="flex justify-end items-center gap-2">
                            <span className="font-mono text-xs text-slate-700">{r.highHop.toLocaleString()}</span>
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              hopsTone === "good" ? "bg-emerald-500" :
                                hopsTone === "warn" ? "bg-amber-500" : "bg-red-500"
                            )} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {shown.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-500 py-12">
                        No data found for this selection.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <DrillDownModal
              open={selectedRow !== null}
              onClose={() => setSelected(null)}
              title={selectedRow ? `${modeLabel}: ${selectedRow.name}` : ""}
              data={drilldownData}
              columns={[
                { key: "ticketId", label: "Ticket ID" },
                { key: "priority", label: "Priority" },
                { key: "status", label: "Status" },
                { key: "assignedTo", label: "Assigned To" },
                { key: "resolvedBy", label: "Resolved By" },
                { key: "hops", label: "Hops" },
                { key: "reopened", label: "Reopened" },
                { key: "sla", label: "SLA" },
                { key: "created", label: "Created" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
