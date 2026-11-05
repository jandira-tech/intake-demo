/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState } from "https://esm.sh/react@18.2.0?deps=react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client?deps=react@18.2.0,react-dom@18.2.0";
import {
  buildRecord,
  callElicit,
  callFinalize,
  type ClientSession,
  loadSession,
  persist,
  resetSession,
} from "./session.ts";
import { Card, ErrorBox, GhostButton, PrimaryButton, Stepper } from "./ui.tsx";
import { StartStep } from "./steps_start.tsx";
import { ElicitingStep, ElicitStep } from "./steps_elicit.tsx";
import { FinalizingStep, ReviewStep } from "./steps_review.tsx";
import { SavedStep } from "./steps_saved.tsx";
import { FirmDashboard } from "./firm.tsx";
import type { IntakeBrief, Stage } from "../shared/types.ts";

function App() {
  const [session, setSession] = useState<ClientSession>(() => loadSession());
  // The firm dashboard is a read-only overlay, deliberately kept out of the
  // persisted client `stage` so it never disturbs the linear intake flow.
  const [firmView, setFirmView] = useState(false);

  function update(patch: Partial<ClientSession>) {
    setSession((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }

  function go(stage: Stage) {
    update({ stage, error_message: null });
  }

  function onReset() {
    setSession(resetSession());
  }

  // start → eliciting → elicit
  async function runElicit(patch: Partial<IntakeBrief>) {
    const brief = { ...session.brief, ...patch };
    update({ brief, stage: "eliciting", error_message: null, elicitation: null, answers: {} });
    try {
      const elicitation = await callElicit(brief);
      const answers: Record<string, string> = {};
      for (const f of elicitation.fields) answers[f.id] = f.recommended || "";
      update({ stage: "elicit", elicitation, answers });
    } catch (e: any) {
      update({ stage: "error", error_message: String(e?.message ?? e) });
    }
  }

  // elicit → finalizing → review
  async function runFinalize(answers: Record<string, string>) {
    update({ answers, stage: "finalizing", error_message: null });
    try {
      const finalize = await callFinalize(session.brief, answers);
      update({ stage: "review", finalize });
    } catch (e: any) {
      update({ stage: "error", error_message: String(e?.message ?? e) });
    }
  }

  const stage = session.stage;

  if (firmView) {
    return <FirmDashboard onClose={() => setFirmView(false)} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
            Client intake
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Tell us about your legal matter</h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed max-w-xl">
            A few guided questions so the firm can help you quickly. We'll suggest answers you can
            accept or change. Nothing is submitted until you review it.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 mt-1">
          {stage !== "start" && stage !== "saved" && (
            <button
              type="button"
              data-testid="start-over"
              onClick={onReset}
              className="text-xs text-slate-500 hover:text-slate-900 underline"
            >
              Start over
            </button>
          )}
          <button
            type="button"
            data-testid="firm-open"
            onClick={() => setFirmView(true)}
            className="text-xs text-slate-500 hover:text-slate-900 underline"
          >
            Firm view
          </button>
        </div>
      </header>

      {stage !== "error" && <Stepper stage={stage} />}

      {stage === "start" && <StartStep brief={session.brief} onStart={runElicit} />}

      {stage === "eliciting" && <ElicitingStep persona={session.brief.persona} />}

      {stage === "elicit" && session.elicitation && (
        <ElicitStep
          brief={session.brief}
          elicitation={session.elicitation}
          initialAnswers={session.answers}
          onBack={() => go("start")}
          onReview={runFinalize}
        />
      )}

      {stage === "finalizing" && <FinalizingStep persona={session.brief.persona} />}

      {stage === "review" && (
        <ReviewStep
          session={session}
          onChange={update}
          onBack={() => go("elicit")}
          onSaved={(res) =>
            update({ stage: "saved", saved_id: res.intake_id, saved_reference: res.reference })}
        />
      )}

      {stage === "saved" && session.finalize && (
        <SavedStep
          record={{ ...buildRecord(session), reference: session.saved_reference ?? "" }}
          reference={session.saved_reference ?? ""}
          onAgain={onReset}
        />
      )}

      {stage === "error" && (
        <Card>
          <h2 className="text-xl font-semibold text-rose-800 mb-2">Something went wrong</h2>
          <ErrorBox message={session.error_message ?? "Unknown error"} />
          <div className="mt-6 flex gap-3">
            <GhostButton onClick={() => go("start")}>Back to start</GhostButton>
            <PrimaryButton
              onClick={() => {
                if (session.elicitation && Object.keys(session.answers).length) {
                  void runFinalize(session.answers);
                } else {
                  void runElicit({});
                }
              }}
            >
              Retry
            </PrimaryButton>
          </div>
        </Card>
      )}

      <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
        This tool helps gather information; it is not legal advice and does not create an
        attorney–client relationship until the firm accepts your matter.
      </p>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
