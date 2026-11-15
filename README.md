# First Encounter Lab

## Current status

```yaml
project: first-encounter-lab
status_updated_at: 2026-11-15T01:36:19-05:00
phase: headless_purchase_review
active_authorization: stopped_at_headless_purchase_review
latest_owner_build_authorization: docs/runs/headless-purchase-2026-11-15-v0-1/RUN_SCOPE.md
last_reviewed_source_commit: 1278b705302da2b1bbd8b0edcca62d63a66fc866
tested_headless_candidate: 27b7f93a40fecccd139007204b3ce04580409dd2
local_review_branch: codex/headless-purchase-v0_1-2026-11-15
candidate_publication: local_only
headless_purchase_a7_verdict: PASS
latest_build_report: docs/runs/headless-purchase-2026-11-15-v0-1/HEADLESS_PURCHASE_BUILD_REPORT.md
c6_contract: approved
c6_contract_sha256: 55c8094417ead764421825aa19706d26137c456bbb9f2484f40c7d2d47d7afd2
real_room_candidate: not_delivered
shared_c6_suite: not_delivered
claude_browser_baseline: not_available
standin_status: not_built
playable_lab_status: not_built
next_gate: teddy_and_nova_headless_review
```

The local review branch contains one implemented headless Pay-for-Give purchase. Work stops here for Teddy and Nova's review. [Build report](docs/runs/headless-purchase-2026-11-15-v0-1/HEADLESS_PURCHASE_BUILD_REPORT.md)

## What this project is

First Encounter Lab is the first reusable Trapstar gameplay tile. A clerk and customer share the same store state, language, and decision rules. Either can be the player in a separate run. BASED changes delivery, while KeyWrapping tracks meaning, assent and remembered arrangements.

The delivered scope is one headless purchase. The target remains an offline browser experience with portable saves. ROOM supplies physical evidence in a later scope, and Encounter owns observations, actions and their consequences.

## What actually works now

| Area | Status | Tested against | Evidence |
|---|---|---|---|
| Headless purchase | Known item, exact offer/assent, deterministic clerk ranking, separate payment/handover, recorded partial failure, retry, save/replay and both controller assignments. | Tested local candidate on Node 24.22.1. | [Actual transaction trace](docs/runs/headless-purchase-2026-11-15-v0-1/HEADLESS_PURCHASE_TRACE.json) |
| Independent proof | A7 PASS. Exit 0. 9 pass, 0 fail, 0 skip. | Clean export of `27b7f93` plus independently authored verification. | [A7 findings](docs/reviews/HEADLESS_PURCHASE_A7_REVIEW_2026-11-15.md) |
| Producer rules | M3 journal, validation and observation helpers imported exactly. Bounded references held at their reviewed pins. | M3 `76a92fd`, Economy/EA-IE `cc8371c`, KeyWrapping `22c06dc`. Producer IR3-25 remains the one qualified historical failure. | [Source inventory](docs/runs/headless-purchase-2026-11-15-v0-1/HEADLESS_PURCHASE_SOURCE_MANIFEST.json) · [Earlier evidence](docs/preflight/agent-run-2026-11-15-c6-v2/FIRST_ENCOUNTER_LAB_AGENT_RUN_PREFLIGHT_REPORT.md#g-test-and-browser-evidence) |
| Real ROOM / official stand-in | Revised C6 approved as written. Real candidate and Nova's shared suite pending, official stand-in unbuilt. | Combat Room v0.1.1 and archived overlay remain historical evidence. | [C6 receipt](docs/decisions/ROOM_C6_OWNER_APPROVAL_RECEIPT_2026-11-15.md) · [Step 1](docs/architecture/ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md) |
| Browser and delivery | Claude baseline unavailable. UI, art integration, offline HTML and native Windows playthrough remain future work. | No playable Lab artifact. | [Physical and delivery gates](docs/decisions/OPEN_APPROVALS.md) |

## Read these first

1. [Run scope](docs/runs/headless-purchase-2026-11-15-v0-1/RUN_SCOPE.md), [build report](docs/runs/headless-purchase-2026-11-15-v0-1/HEADLESS_PURCHASE_BUILD_REPORT.md) and [A7 findings](docs/reviews/HEADLESS_PURCHASE_A7_REVIEW_2026-11-15.md).
2. [Master design](FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md) and [M01–M06 approvals](docs/decisions/FIRST_ENCOUNTER_LAB_OWNER_APPROVALS_M01_M06_2026-11-14.md).
3. [Approved C6](docs/architecture/ROOM_C6_PHYSICAL_CONTROL_CONTRACT_v0_1_REVISED.md) and [Step 1](docs/architecture/ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md).
4. [Original source lock](docs/provenance/SOURCE_LOCK.json), [local build pins](docs/provenance/build-locks/2026-11-15-v0-1.json), [ownership plan](docs/architecture/AGENT_OWNERSHIP_AND_HANDOFFS.md) and [acceptance matrix](docs/testing/ACCEPTANCE_MATRIX.md).

## Current blockers and next actions

- **Teddy and Nova review.** Inspect the trace, exact-source inventory and A7 verdict. Any next checkpoint or public implementation push needs a separate authorization.
- **Nova's ROOM interface.** Real tests need the reviewed wire cases, separately authorized candidate, exact shared suite and accepted scene. A4's future work remains limited to a Lab bridge and the official stand-in.
- **Claude's browser baseline.** Matching unchanged original and overlay baselines are still unavailable. Final native Windows and delivery checks remain separate.

## How to run and test

From the local review checkout with Node 24.22.1 selected:

```text
node --test tests/unit/core/purchase.test.mjs tests/unit/communication/purchase-meaning.test.mjs tests/unit/decisions/clerk.test.mjs
node --test tests/independent/headless-purchase.test.mjs
node docs/runs/headless-purchase-2026-11-15-v0-1/generate-trace.mjs
```

The trace uses scenario-domain observations. There is no playable UI or standalone HTML. [Fresh runner evidence](docs/runs/headless-purchase-2026-11-15-v0-1/HEADLESS_PURCHASE_EVIDENCE_INDEX.md)

## Team and checkpoint

A1 built the ledger, receipts and saves, A2 the purchase language, and A3 the pure clerk policy. A7 reviewed independently after implementation. The Lead integrated and maintains this handoff. All assignments are stopped. The latest result is the headless proof below integrated checkpoint A. [Future checkpoints](docs/architecture/BUILD_CHECKPOINTS.md)

## Recent changes and resume

- Implemented the versioned M3-derived purchase and checked the paid-but-unfulfilled save, retry and replay.
- Recorded independent tests, exact source inventory and the local review handoff.

Resume by checking this branch, the tested candidate and the report checksum. Read the scope and A7 review before any further work. The next action is Teddy and Nova's review.
