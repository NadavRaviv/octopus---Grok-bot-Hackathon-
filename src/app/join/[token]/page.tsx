"use client";

import { Suspense, use, useEffect, useState } from "react";
import { Octopus } from "@/components/octopus";
import { JoinFlow } from "@/components/join-flow";
import { Lost, Splash } from "@/components/states";
import type { Community, Member } from "@/lib/types";

type Data = { member: Member; community: Community; tribes: { id: string; name: string; emoji: string }[] };

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<Splash />}>
      <Join params={params} />
    </Suspense>
  );
}

function Join({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/members/${token}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  if (error) return <Lost message={error} />;
  if (!data) return <Splash />;

  const { member, community } = data;
  const first = member.name.split(" ")[0];

  return (
    <JoinFlow
      endpoint={`/api/members/${token}`}
      initialName={member.name}
      header={
        <section className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Octopus className="size-28 sm:size-32" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm text-muted-foreground ring-1 ring-white/10">
              <span className="size-2 rounded-full bg-online" />
              {community.managerName} from <b className="text-foreground">{community.name}</b> invited you
            </span>
            <h1 className="font-display text-4xl leading-tight font-black sm:text-5xl">
              Hey {first}, grow <span className="text-gradient">8 arms</span>.
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Tell us the 8 things you love doing with other people. Grok Bot stores that as your memory, then
              matches you with a mini tribe of Londoners who share them.
              {member.status === "joined" && " You've done this before, so updating will re-run your match."}
            </p>
          </div>
        </section>
      }
    />
  );
}
