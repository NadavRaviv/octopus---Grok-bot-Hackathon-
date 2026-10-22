import { cn } from "@/lib/utils";

export type BotKind = "match" | "mod" | "growth";

export const BOTS: Record<BotKind, { name: string; emoji: string; color: string; channel: string }> = {
  match: { name: "Grok Matchmaker", emoji: "🐙", color: "#a78bfa", channel: "matchmaker" },
  mod: { name: "Grok Mod", emoji: "🚩", color: "#f23f43", channel: "mod-flags" },
  growth: { name: "Grok Growth", emoji: "📈", color: "#23a55a", channel: "daily-growth" },
};

export function BotAvatar({ kind, className }: { kind: BotKind; className?: string }) {
  return (
    <span className={cn("relative inline-flex size-10 shrink-0", className)}>
      <span className="flex size-full items-center justify-center rounded-full bg-white font-display text-[1.1em] font-black text-black">
        G
      </span>
      <span
        className="absolute -right-1 -bottom-1 flex size-[55%] items-center justify-center rounded-full text-[0.6em] ring-[3px] ring-chat"
        style={{ background: BOTS[kind].color }}
      >
        {BOTS[kind].emoji}
      </span>
    </span>
  );
}

export function BotMessage({
  kind,
  time,
  children,
  className,
}: {
  kind: BotKind;
  time: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-4 px-4 py-2 hover:bg-black/10", className)}>
      <BotAvatar kind={kind} />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold" style={{ color: BOTS[kind].color }}>
            {BOTS[kind].name}
          </span>
          <span className="rounded bg-blurple px-1 text-[10px] leading-4 font-bold text-white">BOT</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </p>
        <div className="space-y-2 text-[15px] leading-relaxed text-[#dbdee1]">{children}</div>
      </div>
    </div>
  );
}

export function Embed({
  color,
  title,
  children,
  footer,
  className,
}: {
  color: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("max-w-2xl rounded-md border-l-4 bg-[#2b2d31] p-4 ring-1 ring-white/5", className)}
      style={{ borderLeftColor: color }}
    >
      {title && <div className="mb-2 font-semibold text-white">{title}</div>}
      {children}
      {footer && <div className="mt-3 text-xs text-muted-foreground">{footer}</div>}
    </div>
  );
}

export function EmbedField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-white">{label}</p>
      <p className="text-sm text-[#dbdee1]">{value}</p>
    </div>
  );
}
