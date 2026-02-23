import { GlobalFilters } from "./GlobalFilters";
import { useFilters } from "@/contexts/FilterContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportDashboardToExcel, exportDashboardToPdf } from "@/lib/dashboardExport";
import { Download, FileSpreadsheet, FileText, Menu } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { filters } = useFilters();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const location = useLocation();
  const showGlobalSlicers = !location.pathname.startsWith("/leaderboards");

  const handleExportExcel = async () => {
    setMenuOpen(false);
    setExporting("excel");
    try {
      await exportDashboardToExcel(filters);
      toast({ title: "Export started", description: "Downloading Excel file." });
    } catch (e) {
      toast({ title: "Export failed", description: e instanceof Error ? e.message : "Failed to export Excel" });
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    setMenuOpen(false);
    setExporting("pdf");
    try {
      await exportDashboardToPdf(filters);
      toast({ title: "Export started", description: "Downloading PDF file." });
    } catch (e) {
      toast({ title: "Export failed", description: e instanceof Error ? e.message : "Failed to export PDF" });
    } finally {
      setExporting(null);
    }
  };

  return (
    <header className="flex flex-col w-full bg-white relative">
      {/* Top Bar matching ServiceNow */}
      <div className="flex items-center gap-3 px-2 py-2 border-b border-border/50 text-sm text-foreground/80">
        <Menu className="h-4 w-4 text-foreground/70" />
        <img src="/favicon.svg" alt="Novartis Logo" className="h-5 w-5" />
        <span className="font-semibold text-foreground">Novartis ITSE Dashboard</span>

        {/* Right side items */}
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 border border-border/40" disabled={exporting !== null}>
                <Download className="h-3 w-3" />
                {exporting ? "Exporting…" : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleExportExcel} disabled={exporting !== null}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleExportPdf} disabled={exporting !== null}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs Row matching ServiceNow */}
      <div className="flex items-center bg-slate-50 border-b border-border/80 overflow-x-auto px-1 pt-1">
        <Link
          to="/"
          className={cn(
            "px-4 py-1.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors",
            location.pathname === "/" ? "border-[hsl(152,79%,20%)] text-[hsl(152,79%,20%)] bg-white" : "border-transparent text-muted-foreground hover:bg-slate-100 hover:text-foreground"
          )}
        >
          Overview
        </Link>
        <div className="h-4 w-[1px] bg-border/40" />
        <Link
          to="/dashboard"
          className={cn(
            "px-4 py-1.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors",
            location.pathname.startsWith("/dashboard") ? "border-[hsl(152,79%,20%)] text-[hsl(152,79%,20%)] bg-white" : "border-transparent text-muted-foreground hover:bg-slate-100 hover:text-foreground"
          )}
        >
          My Dashboard
        </Link>
        <div className="h-4 w-[1px] bg-border/40" />
        <Link
          to="/leaderboards"
          className={cn(
            "px-4 py-1.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors",
            location.pathname.startsWith("/leaderboards") ? "border-[hsl(152,79%,20%)] text-[hsl(152,79%,20%)] bg-white" : "border-transparent text-muted-foreground hover:bg-slate-100 hover:text-foreground"
          )}
        >
          Leaderboards
        </Link>
      </div>

      {/* Global Slicers */}
      {showGlobalSlicers && (
        <div className="mt-4 px-4 pb-2">
          <GlobalFilters />
        </div>
      )}
    </header>
  );
}
