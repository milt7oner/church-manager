import { describe, expect, it } from "vitest";

import {
  PERSON_STATUSES,
  canTransition,
  isPersonStatus,
  type PersonStatus,
} from "./person";

/*
 * Executable spec for the process ladder.
 * Every expected value below is written BY HAND from the rules comment in
 * person.ts. Never derive expectations from the implementation (that would
 * make the tests copy the code instead of checking it).
 */

type Transition = readonly [from: PersonStatus, to: PersonStatus];

// Rule 1: advance one step at a time. Rule 2: the only way down is leader → member.
const ALLOWED: readonly Transition[] = [
  ["visitor", "new"],
  ["new", "in_process"],
  ["in_process", "member"],
  ["member", "leader"],
  ["leader", "member"],
];

const FORBIDDEN: readonly Transition[] = [
  // Rule 1: no skipping steps forward.
  ["visitor", "in_process"],
  ["visitor", "member"],
  ["visitor", "leader"],
  ["new", "member"],
  ["new", "leader"],
  ["in_process", "leader"],

  // Rule 3: no backward moves (other than leader → member).
  ["new", "visitor"],
  ["in_process", "visitor"],
  ["in_process", "new"],
  ["member", "visitor"],
  ["member", "new"],
  ["member", "in_process"],
  ["leader", "visitor"],
  ["leader", "new"],
  ["leader", "in_process"],

  // Rule 4: staying in the same state is not a transition.
  ["visitor", "visitor"],
  ["new", "new"],
  ["in_process", "in_process"],
  ["member", "member"],
  ["leader", "leader"],
];

describe("PERSON_STATUSES", () => {
  it("lists the five ladder steps in order", () => {
    expect(PERSON_STATUSES).toEqual([
      "visitor",
      "new",
      "in_process",
      "member",
      "leader",
    ]);
  });
});

describe("canTransition", () => {
  it.each(ALLOWED)("allows %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it.each(FORBIDDEN)("forbids %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  // Guards the spec itself: if a status is added, this fails until every new
  // pair is classified as allowed or forbidden.
  it("classifies every possible pair exactly once", () => {
    const classified = [...ALLOWED, ...FORBIDDEN].map(
      ([from, to]) => `${from}->${to}`,
    );
    const allPairs = PERSON_STATUSES.flatMap((from) =>
      PERSON_STATUSES.map((to) => `${from}->${to}`),
    );

    expect(new Set(classified).size).toBe(classified.length);
    expect([...classified].sort()).toEqual([...allPairs].sort());
  });
});

describe("isPersonStatus", () => {
  it.each(PERSON_STATUSES)("accepts %s", (status) => {
    expect(isPersonStatus(status)).toBe(true);
  });

  // Values that can realistically arrive from the database or a form.
  it.each([
    ["an unknown status", "admin"],
    ["a different casing", "Member"],
    ["surrounding whitespace", " member "],
    ["an empty string", ""],
    ["null", null],
    ["undefined", undefined],
    ["a number", 1],
    ["an object", { status: "member" }],
  ])("rejects %s", (_label, value) => {
    expect(isPersonStatus(value)).toBe(false);
  });
});
