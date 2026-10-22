import { skillMeta } from "@/lib/skills";
import { cn } from "@/lib/utils";

export function SkillChip({
  skill,
  highlight,
  className,
}: {
  skill: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        highlight ? "bg-fuchsia/20 text-pink-200 ring-1 ring-fuchsia/40" : "bg-white/6 text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden>{skillMeta(skill).emoji}</span>
      {skill}
    </span>
  );
}
