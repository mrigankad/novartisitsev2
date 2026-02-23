/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { getFilteredTickets, getMTTRTrend } from "@/data/realData";
import { DrillDownModal } from "../DrillDownModal";
import { ChartLegend } from "./ChartLegend";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MTTRTrendChart() {
    const { filters } = useFilters();
    const [drillDownOpen, setDrillDownOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

    const filteredTickets = useMemo(() => getFilteredTickets(filters), [filters]);
    const chartData = useMemo(() => getMTTRTrend(filteredTickets, filters.dateRange), [filteredTickets, filters.dateRange]);

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

    const handleDotClick = (evt: any, e?: any) => {
        const payload = evt?.activePayload?.[0]?.payload ?? e?.payload;
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
                if (!t.resolvedAt) return false;
                const resolvedDate = new Date(t.resolvedAt.replace(" ", "T"));
                if (Number.isNaN(resolvedDate.getTime())) return false;
                const key = resolvedDate.toISOString().substring(0, keyLength);
                return key === selectedKey;
            })
            .map((t) => ({
                ticketId: t.ticketId,
                title: t.title,
                priority: t.priority,
                status: t.status,
                resolved: t.resolved,
                created: t.created,
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
                <LineChart data={visibleData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} onClick={handleDotClick}>
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
                        itemStyle={{ color: "hsl(var(--primary))" }}
                        formatter={(value: any) => [`${value ?? 0} hrs`, "Avg MTTR"]}
                    />
                    <Legend content={(props) => <ChartLegend {...props} />} />
                    <Line
                        name="Avg MTTR"
                        type="monotone"
                        dataKey="mttr"
                        stroke="hsl(var(--priority-high))"
                        strokeWidth={2.5}
                        dot={{ fill: "hsl(var(--priority-high))", strokeWidth: 0, r: 4, cursor: "pointer", onClick: handleDotClick }}
                        activeDot={{ r: 6, fill: "hsl(var(--priority-high))", cursor: "pointer", onClick: handleDotClick }}
                        onClick={handleDotClick}
                        style={{ cursor: "pointer" }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <DrillDownModal
                open={drillDownOpen}
                onClose={() => setDrillDownOpen(false)}
                title={`Resolved Tickets on ${selectedLabel || ""}`}
                data={drillDownData}
                columns={[
                    { key: "ticketId", label: "Ticket ID" },
                    { key: "priority", label: "Priority" },
                    { key: "status", label: "Status" },
                    { key: "resolved", label: "MTTR" },
                    { key: "created", label: "Created" },
                ]}
            />
        </>
    );
}
