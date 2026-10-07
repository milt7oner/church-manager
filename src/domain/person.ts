/**
 * Domain: a person's process ladder.
 *
 * PURE module: imports nothing from Supabase, React, src/lib or src/features.
 *
 * TRANSITION RULES (draft: confirm with church leadership before treating as final)
 *
 * 1. Advance one step at a time: visitor → new → in_process → member → leader.
 *    No skipping. Rationale: each step carries pastoral meaning, and skipping one
 *    would hide people who never received the follow-up that step implies.
 *
 * 2. The only downward move allowed is leader → member.
 *    Rationale: someone can stop leading (moved away, taking a break) without
 *    going backwards in their process. OPEN QUESTION: if "leader" is really a
 *    role (user_roles / group_members) rather than a step, this rule goes away.
 *
 * 3. No other backward moves (e.g. member → in_process).
 *    Rationale: stopping attendance is not regressing in the process. Activity
 *    (active / inactive) will be a separate field, not a state on this ladder.
 *
 * 4. Staying in the same state is NOT a transition (returns false).
 *    Rationale: "saving without changes" must not create a change record.
 *
 * OUT OF SCOPE
 * - People transferred from another church who were already members are CREATED
 *   with the initial status "member". Creating is not transitioning, so no skip is needed.
 * - Permissions: who may perform a transition is decided by roles + RLS, not here.
 *
 * KNOWN DEBT
 * - These rules only protect code that calls this function. A direct SQL UPDATE
 *   bypasses them. Pending: a Postgres trigger (it sees OLD and NEW) and keeping
 *   both copies in sync (tests that compare them).
 */

export const PERSON_STATUSES = [
  "visitor",
  "new",
  "in_process",
  "member",
  "leader",
] as const;

export type PersonStatus = (typeof PERSON_STATUSES)[number];

/**
 * Allowed transitions: each key is a state and its list holds the outgoing arrows.
 * Record<PersonStatus, ...> requires one entry per state: adding a new state
 * without deciding its row makes the typecheck fail.
 */
const ALLOWED_TRANSITIONS: Record<PersonStatus, readonly PersonStatus[]> = {
  visitor: ["new"],
  new: ["in_process"],
  in_process: ["member"],
  member: ["leader"],
  leader: ["member"],
};

/** Boundary guard: turns an unknown value (e.g. from Supabase) into a valid status. */
export function isPersonStatus(value: unknown): value is PersonStatus {
  return PERSON_STATUSES.some((status) => status === value);
}

/** Is there an arrow from `from` to `to`? Pure: knows nothing about the person or the user. */
export function canTransition(from: PersonStatus, to: PersonStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
