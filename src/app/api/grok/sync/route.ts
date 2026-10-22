import { getDb } from "@/lib/db";
import { notifyGrokBot } from "@/lib/grok-bot";

export async function POST() {
  const db = getDb();
  const grok = await notifyGrokBot(db, null, "sync");
  return Response.json({
    sent: grok?.sent ?? false,
    members: db.members.length,
    tribes: db.tribes.length,
  });
}
