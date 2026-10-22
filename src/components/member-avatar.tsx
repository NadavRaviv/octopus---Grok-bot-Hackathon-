"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TINTS = ["#5865f2", "#eb459e", "#23a55a", "#f0b232", "#a78bfa", "#ed4245", "#22d3ee"];

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MemberAvatar({
  name,
  src,
  online,
  className,
  ringClassName = "ring-panel",
}: {
  name: string;
  src?: string;
  online?: boolean;
  className?: string;
  ringClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const tint = TINTS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % TINTS.length];

  return (
    <span className={cn("relative inline-flex size-10 shrink-0", className)}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full rounded-full object-cover"
        />
      ) : (
        <span
          className="flex size-full items-center justify-center rounded-full font-display text-[0.8em] font-extrabold text-white"
          style={{ background: tint }}
          aria-label={name}
        >
          {initials(name)}
        </span>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 size-[34%] rounded-full ring-[3px]",
            ringClassName,
            online ? "bg-online" : "bg-[#80848e]",
          )}
        />
      )}
    </span>
  );
}

export function AvatarStack({
  people,
  max = 5,
  className,
  size = "size-8",
}: {
  people: { id: string; name: string; avatar?: string }[];
  max?: number;
  className?: string;
  size?: string;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className={cn("flex -space-x-2", className)}>
      {shown.map((p) => (
        <MemberAvatar key={p.id} name={p.name} src={p.avatar} className={cn(size, "ring-2 ring-panel rounded-full")} />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            size,
            "flex items-center justify-center rounded-full bg-rail text-[11px] font-bold text-muted-foreground ring-2 ring-panel",
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
