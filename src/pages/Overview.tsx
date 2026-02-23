import { useMemo } from "react";
import {
    ArrowRight,
    ShieldAlert,
    TrendingUp,
    Ticket,
    Clock
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { TotalTicketsDonutChart } from "@/components/dashboard/charts/TotalTicketsDonutChart";
import { PriorityDistributionChart } from "@/components/dashboard/charts/PriorityDistributionChart";
import { SLATrackingChart } from "@/components/dashboard/charts/SLATrackingChart";
import { RegionalDistributionPieChart } from "@/components/dashboard/charts/RegionalDistributionPieChart";
import { LeadResolversBarChart } from "@/components/dashboard/charts/LeadResolversBarChart";
import { getFilteredTickets, calculateKPIs } from "@/data/realData";
import { useFilters } from "@/contexts/FilterContext";
import { Link } from "react-router-dom";

export default function Overview() {
    const { filters } = useFilters();
    const tickets = useMemo(() => getFilteredTickets(filters), [filters]);
    const kpis = useMemo(() => calculateKPIs(tickets), [tickets]);

    return (
        <div className="min-h-screen bg-dashboard-bg w-full pb-10">
            <div className="w-full">
                <DashboardHeader />

                <div className="w-full px-2 py-4 text-left">
                    <div className="grid gap-2 grid-cols-1 lg:grid-cols-12 items-start">
                        {/* Column 1: Operational Vital Signs (4 cols) */}
                        <div className="lg:col-span-4 space-y-2">
                            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
                                <KPICard
                                    title="Ticket Volume"
                                    value={kpis.totalTickets.toLocaleString()}
                                    status="neutral"
                                    icon={<Ticket className="h-5 w-5" />}
                                    delay={0}
                                />
                                <KPICard
                                    title="Compliance (SLA)"
                                    value={kpis.slaMetRate}
                                    suffix="%"
                                    status={parseFloat(kpis.slaMetRate) < 85 ? "high" : "low"}
                                    icon={<ShieldAlert className="h-5 w-5" />}
                                    delay={100}
                                />
                                <KPICard
                                    title="Resolution Efficiency"
                                    value={kpis.mttr}
                                    suffix="hrs"
                                    status={parseFloat(kpis.mttr) > 24 ? "high" : "low"}
                                    icon={<Clock className="h-5 w-5" />}
                                    delay={200}
                                />
                            </div>

                            <ChartCard
                                title="Service Quality"
                                subtitle="Open vs Closed distribution"
                                className="overflow-visible"
                            >
                                <div className="py-2">
                                    <TotalTicketsDonutChart />
                                </div>
                                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center px-1">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Resolution Target: 95%</span>
                                    <Link to="/dashboard" className="text-xs text-primary font-black hover:underline flex items-center gap-1">
                                        GO TO DASHBOARD <TrendingUp className="h-3 w-3" />
                                    </Link>
                                </div>
                            </ChartCard>
                        </div>

                        {/* Column 2: Service Health & Risk (4 cols) */}
                        <div className="lg:col-span-4 space-y-2">
                            <ChartCard
                                title="SLA Trends"
                                subtitle="Performance breakdown by priority"
                                className="overflow-visible"
                            >
                                <div className="w-full">
                                    <SLATrackingChart />
                                </div>
                            </ChartCard>

                            <ChartCard
                                title="Priority Risk Pool"
                                subtitle="Backlog distribution across RAG"
                                className="overflow-visible"
                            >
                                <div className="w-full">
                                    <PriorityDistributionChart />
                                </div>
                            </ChartCard>
                        </div>

                        {/* Column 3: Team & Geography (4 cols) */}
                        <div className="lg:col-span-4 space-y-2">
                            <ChartCard
                                title="Global Footprint"
                                subtitle="Distribution across regional units"
                                className="overflow-visible"
                            >
                                <div className="w-full">
                                    <RegionalDistributionPieChart />
                                </div>
                            </ChartCard>

                            <ChartCard
                                title="Lead Resolvers"
                                subtitle="Highest resolution throughput"
                                className="overflow-visible flex flex-col"
                            >
                                <div className="w-full">
                                    <LeadResolversBarChart />
                                </div>
                                <div className="mt-4 pt-4 border-t border-border">
                                    <Link to="/leaderboards" className="text-[11px] text-primary font-black hover:underline flex items-center gap-2 justify-center tracking-widest">
                                        VIEW FULL LEADERBOARDS <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </ChartCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
