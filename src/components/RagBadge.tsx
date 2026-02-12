import { RagCode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ragConfig: Record<RagCode, { label: string; className: string }> = {
  RED: { label: "Red", className: "bg-[hsl(var(--rag-red))] text-white hover:bg-[hsl(var(--rag-red))]/90" },
  AMBER: { label: "Amber", className: "bg-[hsl(var(--rag-amber))] text-white hover:bg-[hsl(var(--rag-amber))]/90" },
  GREEN: { label: "Green", className: "bg-[hsl(var(--rag-green))] text-white hover:bg-[hsl(var(--rag-green))]/90" },
};

interface RagBadgeProps {
  code: RagCode;
  className?: string;
}

/** Colour-coded RAG status badge */
export function RagBadge({ code, className }: RagBadgeProps) {
  const cfg = ragConfig[code];
  return (
    <Badge className={cn("border-0 font-semibold text-xs", cfg.className, className)}>
      {cfg.label}
    </Badge>
  );
}
