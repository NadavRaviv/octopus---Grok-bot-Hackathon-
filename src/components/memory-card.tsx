"use client";

import { sourceLabel } from "@/lib/memory";
import type { Member } from "@/lib/types";

type TribeRef = { id: string; name: string; skill?: string };

export function MemoryCard({
  member,
  tribes = [],
}: {
  member: Member;
  tribes?: TribeRef[];
}) {
  const memory = member.memory;
  const source = memory?.source ?? (member.invitedBy ? "tribe_invite" : "crm");
  const tribeNames = member.tribeIds
    .map((id) => tribes.find((tribe) => tribe.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <section className="w-full rounded-2xl bg-panel p-5 text-left ring-1 ring-white/10">
      <div>
        <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">What Grok remembers</p>
        <h3 className="font-display text-xl font-black">{member.name}</h3>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Discord</dt>
          <dd>{memory?.discordName ?? member.email.split("@")[0]}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Source</dt>
          <dd>{sourceLabel(source)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Chat summary</dt>
          <dd className="text-muted-foreground">{memory?.chatSummary || "Nothing saved yet."}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Tribes</dt>
          <dd>{tribeNames.length ? tribeNames.join(", ") : "None yet"}</dd>
        </div>
      </dl>
    </section>
  );
}
