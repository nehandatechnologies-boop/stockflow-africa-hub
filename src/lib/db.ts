import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type TableName = keyof Database["public"]["Tables"];

/**
 * Loosely-typed table accessor for the generic CRUD layer.
 * Feature code that needs full typing should use `supabase.from("items")` directly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const table = (name: TableName): any => (supabase as any).from(name);

/** Turns a raw backend error into a message that is safe and useful for users. */
export function friendlyError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;
  const err = error as { message?: string; code?: string; details?: string };
  const code = err.code;
  const raw = err.message ?? "";

  if (code === "23505" || raw.includes("duplicate key")) {
    return "That code or reference is already in use. Please choose a different one.";
  }
  if (code === "23503") {
    return "This record is linked to other data and cannot be changed or removed.";
  }
  if (code === "23514") {
    return "Some values are outside the allowed range. Please review the form and try again.";
  }
  if (code === "42501" || raw.toLowerCase().includes("row-level security") || raw.includes("permission denied")) {
    return "You do not have permission to perform this action.";
  }
  if (raw.includes("immutable")) {
    return "This record is permanent and cannot be edited or deleted. Post a correcting transaction instead.";
  }
  if (raw.includes("Invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (raw.includes("already belong to an organization")) {
    return "Your account already belongs to an organization.";
  }
  if (raw.includes("platform owner already exists")) {
    return "A platform owner has already been registered for this deployment.";
  }
  if (raw.includes("Unknown or non-joinable")) {
    return "That organization code was not recognised.";
  }
  // Log the technical detail for debugging, show something calm to the user.
  console.error("[stockflow]", error);
  return fallback;
}

/** Best-effort audit trail write. Never blocks the user-facing action. */
export async function writeAudit(input: {
  organizationId: string | null;
  userId: string | null;
  action: string;
  entityType?: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}) {
  try {
    await supabase.from("audit_logs").insert({
      organization_id: input.organizationId,
      user_id: input.userId,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      before_data: (input.before ?? null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      after_data: (input.after ?? null) as any,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    });
  } catch (error) {
    console.warn("[stockflow] audit write failed", error);
  }
}
