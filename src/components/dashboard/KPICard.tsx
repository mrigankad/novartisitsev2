import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip, type InfoTooltipContent } from "@/components/ui/info-tooltip";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  trendIsGood?: boolean; // Whether 'up' is considered a good trend (default: true)
  status?: "critical" | "high" | "moderate" | "low" | "neutral";
  icon?: React.ReactNode;
  suffix?: string;
  className?: string;
  delay?: number;
  info?: InfoTooltipContent;
}

const statusStyles = {
  critical: "border-l-4 border-l-priority-critical",
  high: "border-l-4 border-l-priority-high",
  moderate: "border-l-4 border-l-priority-moderate",
  low: "border-l-4 border-l-priority-low",
  neutral: "border-l-4 border-l-muted",
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function KPICard({
  title,
  value,
  trend,
  trendIsGood = true,
  status = "neutral",
  icon,
  suffix,
  className,
  delay = 0,
  info,
}: KPICardProps) {
  const TrendIcon = trend ? trendIcons[trend.direction] : null;

  const getTrendColorClass = (direction: "up" | "down" | "neutral") => {
    if (direction === "neutral") return "text-trend-neutral";

    const isUp = direction === "up";
    const isPositiveEffect = trendIsGood ? isUp : !isUp;

    return isPositiveEffect ? "text-trend-up" : "text-trend-down";
  };

  return (
    <div
      className={cn(
        "kpi-card relative flex flex-col items-center bg-card border border-border/80",
        "transition-none",
        statusStyles[status],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* ServiceNow style Header Bar */}
      <div className="w-full bg-slate-50/80 border-b border-border/50 px-3 py-2 flex items-center justify-start gap-2">
        {icon && (
          <div className="text-primary/70">
            {icon}
          </div>
        )}
        <div className="flex items-center gap-2 flex-1">
          <p className="text-xs font-semibold text-foreground/80 tracking-wide truncate">
            {title}
          </p>
          {info && <InfoTooltip content={info} className="flex-shrink-0" />}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 lg:p-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl lg:text-5xl font-light text-foreground">
            {value}
          </span>
          {suffix && (
            <span className="text-lg font-normal text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
        
        {trend && (
          <div className="flex items-center gap-1.5 flex-wrap justify-center mt-3">
            {TrendIcon && (
              <TrendIcon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  getTrendColorClass(trend.direction)
                )}
              />
            )}
            <span
              className={cn(
                "text-sm font-semibold tracking-wide",
                getTrendColorClass(trend.direction)
              )}
            >
              {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
              {trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
