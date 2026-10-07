@AGENTS.md

# church-manager

Platform to manage a hierarchical network of churches (parent/child): people,
process ladder, small groups, finances and roles with access control.

> This file separates what EXISTS today (Current state) from what is PLANNED
> (Target architecture). Do not assume anything planned already exists: check the repo.
> If an instruction here contradicts what you see in the repo, stop and ask.

## Language

Everything in the repository is written in English: code, identifiers, comments,
documentation, ADRs, commit messages, branch names and pull requests.
User-facing UI text is the only exception and will live in translation files.

## Current state (verified: 2026-10-05)

- Next.js 16.3.6 (App Router) + React 19.2.8 + TypeScript + Tailwind v4.
  Read `node_modules/next/dist/docs/` before writing Next.js code: your training data
  may reflect older versions (see AGENTS.md).
- Package manager: pnpm only. The only lockfile is `pnpm-lock.yaml`.
  Never use npm or yarn, and never edit the lockfile by hand.
- TypeScript: `strict` + `noUncheckedIndexedAccess`. Alias `@/*` → `./src/*`.
- Supabase: CLI installed as a dev dependency. `supabase/config.toml` exists.
  There are NO migrations, tables or Supabase client in the code yet.

Current structure:

- `src/app/` — App Router routes. Today only the scaffold: layout and home page.
- `src/domain/` — pure business rules. Today: `person.ts` (PersonStatus, canTransition).
- `docs/adr/` — architecture decisions. Read them before structural changes.
- `docs/workflow.md` — how changes move from a branch to `main`.

## Commands that exist today

- `pnpm dev` · `pnpm build` · `pnpm start`
- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm supabase start` / `pnpm supabase stop` — local Supabase (requires Docker)

Pending (they do NOT exist yet; do not run or invent them): `pnpm format`, `pnpm test`.

## Working rules

- Before calling a task done: `pnpm lint` and `pnpm typecheck` must pass.
  If a command does not exist or fails because of configuration, report it; do not
  "fix" it by changing the check.
- Never modify verification scripts, TypeScript/ESLint config or tests to make something
  pass, unless the task explicitly asks for it.
- Forbidden: `any`, `as any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error` and the
  non-null `!` operator. External data is received as `unknown` and validated with a
  type guard (for example `isPersonStatus`).
- Conventional Commits (feat, fix, refactor, chore, docs, test, build...). Small commits,
  one purpose each. Branch names: `type/short-kebab-description`, lowercase.
- Never push directly to main: every change goes through a branch and a PR
  (main is protected on GitHub).
- If you change the structure, the commands or the state of the repo, update this file
  in the same PR.

## Architecture

Accepted decisions live in `docs/adr/`. Summary:

- `src/app/` stays thin: it receives the request and calls the logic; no business rules.
- `src/domain/` holds pure rules: it imports nothing from `src/app`, `src/lib`,
  `src/features` or Supabase. It is tested without a database.

### Target architecture (PLANNED — does not exist yet)

- `src/features/{auth,churches,people,groups,finance}/` with `components/` and `services/`.
  Services orchestrate: read data, ask `src/domain/`, then persist.
- `src/lib/supabase/` — typed Supabase client (single entry point for data access).
- `src/types/database.ts` — types generated with
  `pnpm supabase gen types typescript --local > src/types/database.ts`.
- `get_church_descendants()` — SQL function returning a church's descendants.
  Once it exists, always use it instead of recursion on the client.

## Security — hard rules (apply from the first table)

- Every table with personal or financial data has RLS enabled in the SAME migration
  that creates it, together with its policies.
- Authorization is resolved in the database (RLS + `user_roles.scope_church_id`).
  A UI check is UX, not security.
- The `service_role` key never appears in client code or in `NEXT_PUBLIC_` variables.
  Server code only, and only when RLS cannot express the rule.
- Schema changes only through `supabase/migrations/`. Never in the production dashboard.
- Never commit `.env*` files with real values.
- Every edit or reversal in `financial_entries` is recorded in `audit_log`.
- Changes touching RLS or roles: test both the allowed and the denied case before merging.

## Domain (planned; see migrations once they exist)

- Geography (countries → regions → districts → zones) is independent from the
  organizational hierarchy (churches.parent_church_id). Do not mix the two trees.
- people.church_id is optional: a person may attend only a small group.
- Process ladder: see the rules in `src/domain/person.ts`.
- RBAC: a role with `scope_church_id` applies to that church and all its descendants.

## Implementation order (do not build out of order)

1. Auth + roles/permissions
2. Church hierarchy (geography + organizational tree)
3. People + process ladder
4. Small groups
5. Finances (requires RLS already tested)
6. Dashboards and reports
