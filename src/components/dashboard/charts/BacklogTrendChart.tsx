/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { DrillDownModal } from "../DrillDownModal";
import { ChartLegend } from "./ChartLegend";
import { getFilteredTickets, getBacklogTrend } from "@/data/realData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BacklogTrendChart() {
  const { filters } = useFilters();
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const filteredTickets = useMemo(() => getFilteredTickets(filters), [filters]);
  const chartData = useMemo(() => getBacklogTrend(filteredTickets, filters.dateRange), [filteredTickets, filters.dateRange]);

  const [page, setPage] = useState(0);
  const pageSize = 15;

  useEffect(() => {
    setPage(0);
  }, [filters.dateRange]);

  const visibleData = useMemo(() => {
    const total = chartData.length;
    if (total <= pageSize) return chartData;

    const start = Math.max(0, total - (page + 1) * pageSize);
    const end = total - page * pageSize;
    return chartData.slice(start, end);
  }, [chartData, page, pageSize]);

  const hasPrev = page < Math.ceil(chartData.length / pageSize) - 1;
  const hasNext = page > 0;

  const handleAreaClick = (evt: any) => {
    const payload = evt?.activePayload?.[0]?.payload;
    const key = payload?.fullDate ?? visibleData.find((p: any) => p.date === evt?.activeLabel)?.fullDate;
    if (!key) return;

    setSelectedKey(key);
    setSelectedLabel(payload?.date ?? evt?.activeLabel ?? key);
    setDrillDownOpen(true);
  };

  const drillDownData = useMemo(() => {
    if (!selectedKey) return [];
    const keyLength = selectedKey.includes("T") ? 13 : selectedKey.length === 7 ? 7 : 10;

    return filteredTickets
      .filter((t) => {
        if (["Resolved", "Closed"].includes(t.status)) return false;
        const ticketDate = new Date(t.created.replace(" ", "T"));
        if (Number.isNaN(ticketDate.getTime())) return false;
        const key = ticketDate.toISOString().substring(0, keyLength);
        return key === selectedKey;
      })
      .map((t) => ({
        ticketId: t.ticketId,
        title: t.title,
        priority: t.priority,
        age: t.age,
        assignee: t.assignee,
      }));
  }, [selectedKey, filteredTickets]);

  return (
    <>
      {chartData.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-white hover:shadow-sm"
              disabled={!hasPrev}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Button>
            <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-white hover:shadow-sm"
              disabled={!hasNext}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Page {page + 1} of {Math.max(1, Math.ceil(chartData.length / pageSize))}
            </span>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 uppercase tracking-tight">
              {chartData[0].fullDate.includes("T") ? "Hourly" : chartData[0].fullDate.length === 7 ? "Monthly" : "Daily"} view
            </span>
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={visibleData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          onClick={handleAreaClick}
        >
          <defs>
            <linearGradient id="backlogGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--chart-secondary))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--chart-secondary))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "var(--card-shadow)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            itemStyle={{ color: "hsl(var(--chart-secondary))" }}
            formatter={(value: any) => [`${value ?? 0} tickets`, "Backlog"]}
          />
          <Legend content={(props) => <ChartLegend {...props} />} />
          <Area
            name="Backlog Trend"
            type="monotone"
            dataKey="backlog"
            stroke="hsl(var(--chart-secondary))"
            strokeWidth={2.5}
            fill="url(#backlogGradient)"
            style={{ cursor: "pointer" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <DrillDownModal
        open={drillDownOpen}
        onClose={() => setDrillDownOpen(false)}
        title={`Backlog Tickets for ${selectedLabel || ""}`}
        data={drillDownData}
        columns={[
          { key: "ticketId", label: "Ticket ID" },
          { key: "priority", label: "Priority" },
          { key: "age", label: "Age" },
          { key: "assignee", label: "Assigned To" },
        ]}
      />
    </>
  );
}
