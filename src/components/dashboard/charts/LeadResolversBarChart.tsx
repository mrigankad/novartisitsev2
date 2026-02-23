/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { getFilteredTickets, type Ticket } from "@/data/realData";
import { DrillDownModal } from "../DrillDownModal";

export function LeadResolversBarChart() {
    const { filters } = useFilters();
    const [drillDownOpen, setDrillDownOpen] = useState(false);
    const [selectedResolver, setSelectedResolver] = useState<string | null>(null);

    const tickets = useMemo(() => getFilteredTickets(filters), [filters]);

    const data = useMemo(() => {
        const counts: Record<string, number> = {};
        tickets.forEach((t: Ticket) => {
            if (t.resolver) {
                counts[t.resolver] = (counts[t.resolver] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({
                name,
                count,
                shortName: name.split(' ').slice(0, 2).map(n => n[0]).join('') || name.substring(0, 2)
            }));
    }, [tickets]);

    const handleBarClick = (data: any) => {
        const name = data?.name ?? data?.payload?.name;
        if (name) {
            setSelectedResolver(name);
            setDrillDownOpen(true);
        }
    };

    const drillDownData = useMemo(() => {
        if (!selectedResolver) return [];
        return tickets.filter(t => t.resolver === selectedResolver)
            .map(t => ({
                ticketId: t.ticketId,
                title: t.title,
                priority: t.priority,
                status: t.status,
                assignee: t.assignee,
                created: t.created,
            }));
    }, [selectedResolver, tickets]);

    return (
        <>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    onClick={handleBarClick}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        width={100}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--card-foreground))",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                        cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                        formatter={(value: number) => [`${value} tickets resolved`, "Tickets"]}
                    />
                    <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                        style={{ cursor: "pointer" }}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={1 - index * 0.15} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <DrillDownModal
                open={drillDownOpen}
                onClose={() => setDrillDownOpen(false)}
                title={`Tickets resolved by ${selectedResolver}`}
                data={drillDownData}
                columns={[
                    { key: "ticketId", label: "Ticket ID" },
                    { key: "priority", label: "Priority" },
                    { key: "status", label: "Status" },
                    { key: "assignee", label: "Assigned To" },
                    { key: "created", label: "Created" },
                ]}
            />
        </>
    );
}
