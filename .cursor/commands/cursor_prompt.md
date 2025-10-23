## Cursor Agent Prompt Library

These are reusable, generalized prompts you can paste into Cursor Agent. Each template enforces:
- **Plan first**: Always produce a clear, stepwise plan in a markdown file before coding.
- **Follow repo patterns**: Keep to the existing structure and conventions.
- **Small, verifiable chunks**: Implement in small steps with validations after each chunk.
- **Testing and linting**: Run tests and lint/type checks; if failures occur, create a fix plan and execute it.

Repository conventions to follow (tailor as needed):
- **Architecture**: `src/modules/<module>/{controllers,services,schemas}` with barrel `index.ts` files; shared `src/globalSchemas`; models in `src/db/models`.
- **Types**: Keep `types/` in sync with model/schema updates.
- **Utilities**: Prefer existing helpers in `src/utils/` and constants in `src/constants/`.
- **Testing**: Tests colocated under `src/modules/<module>/__tests__/` and global setup at `src/__tests__/setup.ts`.
- **Tooling**: Detect and use the correct runner from repo scripts/lockfiles (Bun/Node/NPM/Yarn/PNPM). Prefer package.json scripts over ad‑hoc commands.

How to use: Replace placeholders like [GOAL], [ACCEPTANCE_CRITERIA], [PATHS], [BRANCH], etc. Keep what applies, remove the rest.

---

### 1) Build or Update Feature Prompt (Implementation)

```markdown
You are an implementation agent. Goal: [GOAL]

Context & Constraints:
- Project path: [PROJECT_PATH]
- Branch: [BRANCH]
- Scope: [SCOPE]
- Inputs/specs/links: [REFERENCES]
- Must follow repository patterns:
  - Architecture: src/modules/<module>/{controllers,services,schemas} with barrel index.ts
  - Shared schemas in src/globalSchemas, models in src/db/models
  - Update types in types/models when models/schemas change
  - Use existing utils/constants; avoid duplicating logic
- Coding standards: TypeScript strictness, early returns, meaningful names, minimal try/catch, no dead code
- Non-functional: performance neutral or better; secure inputs; proper error handling

Plan First:
1) Create a concise implementation plan in markdown at the repo root named [PLAN_FILENAME e.g. PLAN.md] with:
   - Title, context, and objective
   - Acceptance criteria ([ACCEPTANCE_CRITERIA])
   - Affected areas/files ([PATHS]) and risks
   - Step-by-step chunks (each chunk should be 5–15 minutes of work)
   - Test strategy per chunk + final regression plan
   - Rollback plan and verification checklist
2) Wait to start coding until the plan is written.

Execution Rules:
- Implement chunk-by-chunk as per the plan. After each chunk:
  - Run type check (tsc) for edited files; run lints for edited files
  - Run relevant tests; if none exist, add focused tests in src/modules/<module>/__tests__
  - Update barrels (index.ts) and exports as needed
  - Keep changes small and cohesive
- Align with existing patterns:
  - Controllers: input validation via schemas; return structured error responses from global schemas
  - Services: stateless, pure business logic; no HTTP concerns
  - Schemas: colocated and/or shared via src/globalSchemas; keep consistency with existing zod/yup patterns
  - Models: keep db models cohesive; update related types under types/models
  - Update src/modules/<module>/index.ts and any higher-level exports if required
- Do not dump large code in chat; apply edits directly to files and summarize changes

Testing & Linting:
- Detect runner from lockfiles and scripts:
  - If bun.lockb exists, prefer: bun test; otherwise use package.json scripts
  - Use npm/yarn/pnpm scripts if defined (e.g., test, lint, typecheck)
- After all chunks:
  - Run full test suite
  - Fix failures by drafting a mini-plan and applying targeted edits
  - Run lint and type checks, fix all issues for edited files

Deliverables:
- [PLAN_FILENAME] created and kept up-to-date
- Implementation complete per acceptance criteria
- New/updated tests added and passing
- Lint/type checks clean for edited files
- Short summary of key changes and impacted files

Now:
1) Inspect repository to confirm conventions and locate relevant modules/files.
2) Produce [PLAN_FILENAME] with the detailed step-by-step plan.
3) Execute chunk 1 and verify; iterate through remaining chunks with tests/lints after each.
```

---

### 2) Reviewer and Correcting Prompt (Code Review + Fixes)

```markdown
You are a reviewer-fixer agent. Review and correct the code for: [SCOPE or PR/changeset]

Context:
- Project path: [PROJECT_PATH]
- Branch: [BRANCH]
- Paths to review: [PATHS]
- Constraints/criteria: [REVIEW_CRITERIA]
- Must adhere to repository patterns and coding standards

Review Checklist (identify issues with severity and proposals):
- Architecture: controllers/services/schemas separation; barrel exports; no cross-layer leaks
- Consistency: matches existing module patterns (naming, foldering, exports)
- Types: strict, safe types; no any; accurate model/type sync under types/models
- Validation: request/response schemas consistent with src/globalSchemas; defensive checks
- Error handling: structured error responses; no swallowing errors
- DB/model changes: coherent schema; migrations or model updates aligned; indexes/performance considered
- Security: input sanitization, auth/perm checks where expected
- Performance: avoid N+1, unnecessary loops, redundant I/O; cache/use existing utils when applicable
- Tests: adequate unit/integration tests under src/modules/*/__tests__; global setup used correctly
- Tooling: lints pass; type checks pass; scripts/exports updated

Plan First:
1) Create a markdown review plan [PLAN_FILENAME e.g. REVIEW_PLAN.md] summarizing:
   - Findings grouped by severity (blocker/major/minor/notes)
   - Fix strategy as small, ordered chunks
   - Test plan for verifying each fix
2) Execute in small chunks: apply fixes, then run targeted tests and lints

Execution Rules:
- For each identified issue:
  - Propose a minimal, targeted fix
  - Apply edit adhering to module boundaries and patterns
  - Update relevant barrels and types
  - Add or update tests covering the fix
  - Run lints and relevant tests immediately

Finalization:
- Run full test suite
- Ensure lint/type checks clean for edited files
- Update [PLAN_FILENAME] status and provide a brief summary of changes and rationale

Now:
1) Inspect files in [PATHS] and cross-check with repo patterns.
2) Produce [PLAN_FILENAME] with findings and fix plan.
3) Implement fixes chunk-by-chunk, validating after each.
```

---

### 3) Testing Prompt (Run, Triage, Add/Improve Tests, Fix Failures)

```markdown
You are a testing agent. Goal: ensure tests are complete, reliable, and passing for [SCOPE].

Context:
- Project path: [PROJECT_PATH]
- Branch: [BRANCH]
- Target areas/modules: [PATHS]
- Coverage target (optional): [COVERAGE_TARGET]

Plan First:
1) Create a testing plan markdown [PLAN_FILENAME e.g. TEST_PLAN.md] covering:
   - Test discovery (what exists, where)
   - Gaps to cover (unit/integration by module)
   - Execution strategy (commands, filters, environment)
   - Failure triage plan and prioritization

Execution:
- Detect the correct runner and scripts from lockfiles and package.json:
  - Prefer project scripts (e.g., test, test:unit, test:integration)
  - If Bun is present (bun.lockb), use `bun test` if not overridden by scripts
- Run the full suite once to baseline failures
- Triage failures:
  - For each failure: document root cause in [PLAN_FILENAME], propose fix, implement minimal change
  - Add/adjust tests to reflect intended behavior, not incidental implementation details
- Fill gaps:
  - Add missing tests under src/modules/<module>/__tests__ matching existing style
  - Use shared setup at src/__tests__/setup.ts
  - Prefer small, focused cases; cover happy paths, edge cases, and error handling
- Iterate:
  - After each fix/addition, re-run the relevant subset; then periodically run the full suite
- Quality gates:
  - Lint and type-check all new/edited test and source files
  - Ensure deterministic tests (no hidden time/network dependencies unless mocked)

Finalization:
- Full suite green
- Lint/type checks clean for edited files
- [PLAN_FILENAME] updated with outcomes and any remaining TODOs
- Short summary of coverage improvements and key tests added

Now:
1) Produce [PLAN_FILENAME] with a concrete test plan.
2) Run the suite, record failures, and start targeted fixes with tests.
3) Iterate until green and clean.
```


