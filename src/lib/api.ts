import "server-only";
import type { DB } from "./types";

export function snapshot(db: DB) {
  const joined = db.members.filter((m) => m.status === "joined");
  const inTribe = joined.filter((m) => m.tribeIds.length > 0);
  const viaInvite = joined.filter((m) => m.invitedBy);
  return {
    community: db.community,
    members: db.members,
    tribes: db.tribes.map(({ messages, ...t }) => ({
      ...t,
      messageCount: messages.length,
      lastMessage: messages.at(-1) ?? null,
    })),
    stats: {
      uploaded: db.members.length,
      joined: joined.length,
      invited: db.members.length - joined.length,
      inTribe: inTribe.length,
      unmatched: joined.length - inTribe.length,
      tribes: db.tribes.length,
      viaInvite: viaInvite.length,
    },
  };
}

export type Snapshot = ReturnType<typeof snapshot>;

export function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
