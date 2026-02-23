/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { getFilteredTickets, type Ticket } from "@/data/realData";
import { DrillDownModal } from "../DrillDownModal";
import { ChartLegend } from "./ChartLegend";

const COLORS = [
    "hsl(217, 91%, 60%)", // NA
    "hsl(152, 79%, 20%)", // EMEA
    "hsl(35, 92%, 50%)",  // APAC
    "hsl(280, 65%, 55%)", // LATAM
    "hsl(200, 15%, 50%)", // Other
];

export function RegionalDistributionPieChart() {
    const { filters } = useFilters();
    const [drillDownOpen, setDrillDownOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    const tickets = useMemo(() => getFilteredTickets(filters), [filters]);

    const data = useMemo(() => {
        const regions: Record<string, number> = { NA: 0, EMEA: 0, APAC: 0, LATAM: 0, Other: 0 };
        tickets.forEach((t: Ticket) => {
            const r = t.region.toUpperCase();
            if (regions[r] !== undefined) {
                regions[r]++;
            } else {
                regions["Other"]++;
            }
        });

        return Object.entries(regions)
            .filter(([, count]) => count > 0)
            .map(([name, value], idx) => ({
                name,
                value,
                color: COLORS[idx % COLORS.length]
            }));
    }, [tickets]);

    const handlePieClick = (data: any) => {
        const name = data?.name ?? data?.payload?.name;
        if (name) {
            setSelectedRegion(name);
            setDrillDownOpen(true);
        }
    };

    const drillDownData = useMemo(() => {
        if (!selectedRegion) return [];
        return tickets.filter(t => t.region.toUpperCase() === selectedRegion)
            .map(t => ({
                ticketId: t.ticketId,
                title: t.title,
                priority: t.priority,
                status: t.status,
                assignee: t.assignee,
                created: t.created,
            }));
    }, [selectedRegion, tickets]);

    return (
        <>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                            const pctValue = percent ?? 0;
                            return `${name} (${(pctValue * 100).toFixed(0)}%)`;
                        }}
                        outerRadius={80}
                        innerRadius={40}
                        dataKey="value"
                        onClick={handlePieClick}
                        style={{ cursor: "pointer" }}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                style={{ cursor: "pointer" }}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--card-foreground))",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [`${value} tickets`, "Count"]}
                    />
                    <Legend content={(props) => <ChartLegend {...props} />} />
                </PieChart>
            </ResponsiveContainer>
            <DrillDownModal
                open={drillDownOpen}
                onClose={() => setDrillDownOpen(false)}
                title={`${selectedRegion} Tickets`}
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
