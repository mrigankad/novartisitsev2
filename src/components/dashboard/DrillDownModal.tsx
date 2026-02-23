import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DrillDownModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, unknown>[];
  columns: { key: string; label: string }[];
  headerControls?: ReactNode;
}

export function DrillDownModal({ open, onClose, title, data, columns, headerControls }: DrillDownModalProps) {
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (open) {
      setPage(0);
      setQuery("");
      setSortKey(null);
      setSortDir("asc");
    }
  }, [open, title]);

  useEffect(() => {
    setPage(0);
  }, [pageSize, query, sortKey, sortDir]);

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const filteredData = useMemo(() => {
    if (!normalizedQuery) return data;
    return data.filter((row) => {
      return columns.some((col) => {
        const v = row?.[col.key];
        if (v === null || v === undefined) return false;
        return String(v).toLowerCase().includes(normalizedQuery);
      });
    });
  }, [data, columns, normalizedQuery]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const dir = sortDir === "asc" ? 1 : -1;
    const copy = [...filteredData];
    copy.sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];
      if (av === null || av === undefined) return 1 * dir;
      if (bv === null || bv === undefined) return -1 * dir;

      const an = typeof av === "number" ? av : Number(String(av).replace(/[^0-9.\-]/g, ""));
      const bn = typeof bv === "number" ? bv : Number(String(bv).replace(/[^0-9.\-]/g, ""));
      const bothNumeric = Number.isFinite(an) && Number.isFinite(bn);

      if (bothNumeric) return (an - bn) * dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" }) * dir;
    });
    return copy;
  }, [filteredData, sortKey, sortDir]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sortedData.length / pageSize)), [sortedData.length, pageSize]);
  const safePageIndex = page >= totalPages ? 0 : page;
  const startIndex = safePageIndex * pageSize;
  const endIndex = Math.min(sortedData.length, startIndex + pageSize);
  const pagedData = useMemo(() => sortedData.slice(startIndex, endIndex), [sortedData, startIndex, endIndex]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col p-0 gap-0 bg-card rounded-xl shadow-xl border border-border/30 overflow-hidden [&>button]:hidden">
        <DialogHeader className="px-6 py-5 border-b border-border/60 bg-gradient-to-r from-card to-card/95">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {sortedData.length > 0 && (
            <p className="text-sm text-foreground/80 mt-2 font-medium">
              {sortedData.length} {sortedData.length === 1 ? "record" : "records"} found • Showing {startIndex + 1}-{endIndex}
            </p>
          )}
          {sortedData.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-8 w-[240px] bg-card"
              />
              {headerControls}
              <div className="relative">
                <select
                  className="filter-select appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-card border border-border rounded-lg text-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-sm"
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                >
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                  <option value={250}>250 / page</option>
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="text-xs text-muted-foreground font-medium">
                Page {page + 1} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  disabled={safePageIndex === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  disabled={safePageIndex + 1 >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          {/* Add subtle divider when data exists */}
          {sortedData.length > 0 && <div className="border-t border-border/20 my-2" />}
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {sortedData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <X className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">No data available</p>
                <p className="text-sm text-muted-foreground">
                  {normalizedQuery ? "No records match your search" : "No records found for this selection"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <div className="relative">
                <TooltipProvider delayDuration={150}>
                  <table className="w-full border-collapse bg-white">
                    <thead className="sticky top-0 z-10 bg-slate-100 border-b-2 border-slate-300 text-slate-600">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider border-r border-slate-300 w-[60px]">
                          No.
                        </th>
                        {columns.map((col, idx) => (
                          <th
                            key={col.key}
                            className={cn(
                              "px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider border-r border-slate-300 cursor-pointer select-none",
                              idx === columns.length - 1 && "border-r-0"
                            )}
                            onClick={() => handleSort(col.key)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{col.label}</span>
                              {sortKey === col.key && (
                                <span className="text-primary">{sortDir === "asc" ? "▲" : "▼"}</span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {pagedData.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="hover:bg-slate-50 transition-none h-10"
                        >
                          <td className="px-3 py-1.5 text-xs text-slate-500 font-mono text-center border-r border-slate-200 bg-slate-50/50">
                            {startIndex + rowIdx + 1}
                          </td>
                          {columns.map((col, colIdx) => {
                            const raw = row?.[col.key];
                            const value = raw === null || raw === undefined || raw === "" ? null : String(raw);
                            const title = row?.title ? String(row.title) : null;

                            if (col.key === "ticketId" && title && value) {
                              return (
                                <td
                                  key={col.key}
                                  className={cn(
                                    "px-3 py-1.5 text-xs text-slate-800 font-medium border-r border-slate-200",
                                    colIdx === columns.length - 1 && "border-r-0"
                                  )}
                                >
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center min-h-[20px] truncate underline decoration-slate-300 decoration-dotted underline-offset-2 cursor-help text-primary font-bold">
                                        {value}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={8} className="sm:max-w-[520px]">
                                      {title}
                                    </TooltipContent>
                                  </Tooltip>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={col.key}
                                className={cn(
                                  "px-3 py-1.5 text-xs text-slate-700 font-medium border-r border-slate-200",
                                  colIdx === columns.length - 1 && "border-r-0"
                                )}
                              >
                                <div className="flex items-center min-h-[20px] truncate">
                                  {value || <span className="text-slate-300 italic">—</span>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border/60 bg-muted/20 flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6 font-medium"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

