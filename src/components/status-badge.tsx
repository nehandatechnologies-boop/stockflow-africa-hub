import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/15 text-warning-foreground border-warning/35",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  info: "bg-info/12 text-info border-info/25",
};

const STATUS_TONE: Record<string, Tone> = {
  active: "success",
  inactive: "neutral",
  suspended: "danger",
  true: "success",
  false: "neutral",
};

export function StatusBadge({ value, tone, className }: { value: string; tone?: Tone; className?: string }) {
  const resolved = tone ?? STATUS_TONE[String(value).toLowerCase()] ?? "neutral";
  const label = String(value).replace(/_/g, " ");
  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium tracking-wide", TONE_CLASS[resolved], className)}
    >
      {label}
    </Badge>
  );
}
