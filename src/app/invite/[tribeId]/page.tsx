"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AvatarStack, MemberAvatar } from "@/components/member-avatar";
import { JoinFlow } from "@/components/join-flow";
import { Lost, Splash } from "@/components/states";
import type { Member, Tribe } from "@/lib/types";

type Data = { tribe: Tribe; members: Member[] };

export default function InvitePage({ params }: { params: Promise<{ tribeId: string }> }) {
  return (
    <Suspense fallback={<Splash />}>
      <Invite params={params} />
    </Suspense>
  );
}

function Invite({ params }: { params: Promise<{ tribeId: string }> }) {
  const { tribeId } = use(params);
  const ref = useSearchParams().get("ref") ?? undefined;
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tribes/${tribeId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, [tribeId]);

  if (error) return <Lost message={error} />;
  if (!data) return <Splash />;

  const { tribe, members } = data;
  const inviter = members.find((m) => m.id === ref) ?? members[0];
  const inviterFirst = inviter?.name.split(" ")[0];

  return (
    <JoinFlow
      endpoint={`/api/tribes/${tribeId}/join`}
      extraBody={{ ref: inviter?.id }}
      askEmail
      inviterName={inviterFirst}
      header={
        <section
          className="overflow-hidden rounded-3xl ring-1 ring-white/10"
          style={{ background: `linear-gradient(135deg, ${tribe.color}40, #2b2d31 60%)` }}
        >
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="relative shrink-0">
              <span
                className="flex size-24 items-center justify-center rounded-[28px] text-5xl shadow-[0_6px_0_rgb(0_0_0/0.3)] ring-4 ring-white"
                style={{ background: tribe.color }}
              >
                {tribe.emoji}
              </span>
              {inviter && (
                <MemberAvatar
                  name={inviter.name}
                  src={inviter.avatar}
                  className="absolute -right-3 -bottom-3 size-12 rounded-full ring-4 ring-[#2b2d31]"
                />
              )}
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-sm text-muted-foreground">
                <b className="text-foreground">{inviter?.name}</b> invited you to join
              </p>
              <h1 className="font-display text-4xl leading-tight font-black sm:text-5xl">{tribe.name}</h1>
              <p className="text-muted-foreground">{tribe.tagline}</p>
              <div className="flex items-center gap-3 pt-1">
                <AvatarStack people={members} max={6} />
                <span className="text-sm text-muted-foreground">
                  <b className="text-foreground">{members.length}</b> Londoners · {members.filter((m) => m.online).length}{" "}
                  online
                </span>
              </div>
            </div>
          </div>
        </section>
      }
    />
  );
}
