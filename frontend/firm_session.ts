// Firm-dashboard API callers (browser-only; no JSX). Read-only: the firm view
// never writes. Pure list/sort/format logic lives in ../shared/firm.ts
// (unit-tested); this module only wires it to fetch.
import type { IntakeRow, IntakeSummary } from "../shared/types.ts";

/** GET /api/intakes → summaries, newest first (the firm list). */
async function fetchIntakes(): Promise<IntakeSummary[]> {
  const r = await fetch("/api/intakes");
  if (!r.ok) throw new Error(`/api/intakes ${r.status}: ${await r.text()}`);
  const json = (await r.json()) as { intakes: IntakeSummary[] };
  return Array.isArray(json.intakes) ? json.intakes : [];
}

/** GET /api/intakes/:id → the full stored intake (summary + payload). */
async function fetchIntake(id: number): Promise<IntakeRow> {
  const r = await fetch(`/api/intakes/${id}`);
  if (!r.ok) throw new Error(`/api/intakes/${id} ${r.status}: ${await r.text()}`);
  const json = (await r.json()) as { intake: IntakeRow };
  return json.intake;
}

export { fetchIntake, fetchIntakes };
