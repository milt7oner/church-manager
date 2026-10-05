# 0001. Use src/ for application code, with app/ and domain/

- Status: Accepted
- Date: 2026-10-05
- Deciders: Duvan Muñoz

## Context

The `create-next-app` scaffold placed `app/` at the repository root, mixed with
configuration files (tsconfig, ESLint, PostCSS, Next), documentation and the
`supabase/` folder. As the project grows it will contain business rules, data access
and components, and at the root it would be hard to tell code from configuration.

The project also needs a home for pure business rules (the first one is a person's
process ladder) that can be tested without a database or React.

CLAUDE.md described a `src/features/...` structure that did not exist, which gave
agents false context.

[COMPLETE IN YOUR OWN WORDS: what broke when moving app/ to src/ and how you found it.]

## Decision

All application code lives in `src/`. Today it contains:

- `src/app/` — App Router routes, kept thin: no business rules.
- `src/domain/` — pure business rules. It imports nothing from other folders in
  `src/`, nor from Supabase or React.

These stay at the root: `public/`, `supabase/`, configuration, `package.json` and
documentation. The `@/*` alias points to `./src/*`.

## Alternatives considered

- **Keep `app/` at the root (scaffold default)**: mixes code and configuration and
  offers no obvious place for rules that are not routes.
- **Create `src/features/*` and `src/lib/` now**: they would be empty or speculative
  folders; they will be added when the first code that needs them exists
  (see "Revisit if").

## Consequences

- (+) Visible separation between code (`src/`) and configuration (root).
- (+) Pure rules have their own home and are tested without infrastructure.
- (−) Many tutorials and examples (and agents' prior knowledge) assume `app/` at the
  root: paths must be adapted when copying examples.
- (−) If someone creates `app/` at the root, Next uses it and ignores `src/app/`.
- New rules: route code goes in `src/app/`; pure rules go in `src/domain/`;
  `src/domain/` imports no other folder in `src/`.
- Debt: the `src/domain/` import rule is not yet enforced by ESLint
  (`no-restricted-imports`).
- Revisit if: the first feature with services and data access appears
  (introduce `src/features/` and `src/lib/` in a new ADR).