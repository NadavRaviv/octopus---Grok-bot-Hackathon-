import { snapshot } from "@/lib/api";
import { getDb, saveDb } from "@/lib/db";
import { runBatchMatch } from "@/lib/matching";

export async function POST() {
  const db = getDb();
  const result = await runBatchMatch(db);
  saveDb();
  return Response.json({
    created: result.created.map((t) => ({ id: t.id, name: t.name, size: t.memberIds.length })),
    placements: result.placements,
    unmatched: result.unmatched,
    pending: result.pending,
    state: snapshot(db),
  });
}
