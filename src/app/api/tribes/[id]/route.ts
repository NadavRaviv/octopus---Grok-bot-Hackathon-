import { bad } from "@/lib/api";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const tribe = db.tribes.find((t) => t.id === id);
  if (!tribe) return bad("Tribe not found.", 404);
  const members = tribe.memberIds
    .map((mid) => db.members.find((m) => m.id === mid))
    .filter(Boolean);
  return Response.json({
    tribe,
    members,
    community: db.community,
    otherTribes: db.tribes.map((t) => ({ id: t.id, name: t.name, emoji: t.emoji, color: t.color })),
    viaInvite: db.members.filter((m) => tribe.memberIds.includes(m.id) && m.invitedBy).length,
  });
}
