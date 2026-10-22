import { bad } from "@/lib/api";
import { getDb, saveDb } from "@/lib/db";
import { matchMember } from "@/lib/matching";
import { notifyGrokBot } from "@/lib/grok-bot";
import { writeMemory } from "@/lib/memory";
import { MAX_SKILLS, MIN_SKILLS, normalizeSkill, validateSkill } from "@/lib/skills";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const member = db.members.find((m) => m.id === id);
  if (!member) return bad("This invite link doesn't exist (or has been eaten by an octopus).", 404);
  return Response.json({
    member,
    community: db.community,
    tribes: db.tribes
      .filter((t) => member.tribeIds.includes(t.id))
      .map((t) => ({ id: t.id, name: t.name, emoji: t.emoji, color: t.color })),
  });
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const member = db.members.find((m) => m.id === id);
  if (!member) return bad("Member not found.", 404);

  const body = await req.json().catch(() => null);
  const raw: unknown = body?.skills;
  if (!Array.isArray(raw)) return bad("Pick some social skills first.");
  const skills = [...new Set(raw.map((s) => normalizeSkill(String(s))))].slice(0, MAX_SKILLS);
  if (skills.length < MIN_SKILLS) return bad(`Pick at least ${MIN_SKILLS} social skills.`);
  const invalid = skills.find((s) => validateSkill(s));
  if (invalid) return bad(`"${invalid}": ${validateSkill(invalid)}`);

  if (typeof body?.name === "string" && body.name.trim()) member.name = body.name.trim().slice(0, 60);
  if (typeof body?.area === "string" && body.area.trim()) member.area = body.area.trim().slice(0, 40);
  member.skills = skills;
  member.status = "joined";
  member.online = true;
  member.joinedAt ??= Date.now();

  const note = typeof body?.note === "string" ? body.note : undefined;
  const result = await matchMember(db, member);
  writeMemory(member, db.tribes, note);
  saveDb();
  const grok = await notifyGrokBot(db, member, "match");
  return Response.json(grok ? { ...result, grok } : result);
}
