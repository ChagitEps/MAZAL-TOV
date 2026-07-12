import "server-only";

/**
 * The single AI entry point (spec §7, §7.1). ALL AI calls go through here so the
 * provider (Anthropic / OpenAI) can be swapped and token cost can be tracked
 * centrally. Never import an AI SDK directly from an action or component.
 *
 * MVP scope: AI Writer (rewrite/shorten/lengthen/restyle) + Spell Checker.
 * The concrete provider call is stubbed until keys are wired — the interface
 * below is stable and callers should not change when the real call lands.
 */

export interface ImproveTextInput {
  /** The current text of the single field being improved (NOT the whole record — privacy §12). */
  text: string;
  /** Free-form Hebrew instruction, e.g. "כתוב בסגנון חסידי", "קצר לשתי שורות". */
  instruction: string;
  /** For cost attribution to the document/order (spec §7.1, §16 < 5%). */
  documentId: string;
}

export interface ImproveTextResult {
  text: string;
  /** Estimated cost of this call in agorot, recorded against the order (spec §7.1). */
  costAgorot: number;
}

const PROVIDER = process.env.AI_PROVIDER ?? "anthropic";

/** Rewrite/improve a single field's Hebrew text per a free-form instruction. */
export async function improveText(input: ImproveTextInput): Promise<ImproveTextResult> {
  // TODO(ai): call PROVIDER via its SDK behind this function only.
  //   anthropic → @anthropic-ai/sdk (claude-*), openai → openai.
  //   Choose the provider by the quality of Hebrew output (spec §7.1).
  //   Record real token cost into orders.ai_cost_agorot.
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    // No key configured yet — echo input so the flow is exercisable end-to-end.
    return { text: input.text, costAgorot: 0 };
  }
  throw new Error(`AI provider "${PROVIDER}" not wired yet — implement in lib/ai/provider.ts`);
}

/** Spell/punctuation/wording check in Hebrew before download (spec §7 AI Spell Checker). */
export async function spellCheck(
  input: Pick<ImproveTextInput, "text" | "documentId">,
): Promise<ImproveTextResult> {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    return { text: input.text, costAgorot: 0 };
  }
  throw new Error(`AI provider "${PROVIDER}" not wired yet — implement in lib/ai/provider.ts`);
}
