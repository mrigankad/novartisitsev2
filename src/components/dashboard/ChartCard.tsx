import { cn } from "@/lib/utils";
import { InfoTooltip, type InfoTooltipContent } from "@/components/ui/info-tooltip";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  info?: InfoTooltipContent;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  headerAction,
  info,
}: ChartCardProps) {
  return (
    <div className={cn(
      "chart-container relative flex flex-col bg-card border border-border/80",
      "transition-none",
      className
    )}>
      {/* ServiceNow style Header/Title Bar */}
      <div className="w-full bg-slate-50/80 border-b border-border/50 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h3 className="text-xs font-semibold text-foreground/80 tracking-wide truncate">
            {title}
          </h3>
          {info && <InfoTooltip content={info} className="flex-shrink-0" />}
        </div>
        {headerAction && (
          <div className="ml-4 flex-shrink-0 relative z-10">
            {headerAction}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="w-full flex-1 p-4 relative z-10 flex flex-col min-w-0">
        {subtitle && (
          <p className="mb-4 text-xs text-muted-foreground/80 font-medium text-center">
            {subtitle}
          </p>
        )}
        <div className="w-full flex-1 min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
