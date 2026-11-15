# First Encounter Lab

## Current status

```yaml
project: first-encounter-lab
status_updated_at: 2026-11-15T00:52:03-05:00
phase: preflight_review
active_authorization: documentation_and_preflight_only
last_reviewed_source_commit: bbed22c4bf4bdad453f7d698a80a36f869320980
latest_preflight: docs/preflight/agent-run-2026-11-15-c6-v2/FIRST_ENCOUNTER_LAB_AGENT_RUN_PREFLIGHT_REPORT.md
latest_owner_build_authorization: null
c6_contract: approved
c6_contract_sha256: 55c8094417ead764421825aa19706d26137c456bbb9f2484f40c7d2d47d7afd2
real_room_candidate: not_delivered
shared_c6_suite: not_delivered
claude_browser_baseline: not_available
standin_status: not_built
playable_lab_status: not_built
next_gate: owner_preflight_review
```

Teddy approved M01–M06 and revised C6. Phase 0 delivered the evidence and stops for Teddy and Nova's review.

## What this project is

First Encounter Lab is the first reusable Trapstar gameplay tile. A clerk and customer share the same store state, language, and decision rules. Either can be the player in a separate run. BASED changes delivery, while KeyWrapping tracks meaning, assent and remembered arrangements through later visits.

The target is one offline browser file with portable saves. Purchases affect money, stock, title and holding. An exact agreement can leave both a promise and a consequence. Written rules drive NPC choices. ROOM supplies physical evidence, and Encounter decides what actors learn and what their actions mean.

## What actually works now

| Area | Status | Tested against | Evidence |
|---|---|---|---|
| Encounter foundation | Bounded producer behavior previously tested. Lab adaptation pending. | M3 `76a92fd` and the identical Atlas tree at `cc8371c`. | [Reported M3 and IR3 results](docs/preflight/agent-run-2026-11-15-c6-v2/FIRST_ENCOUNTER_LAB_AGENT_RUN_PREFLIGHT_REPORT.md#g-test-and-browser-evidence), including the one known IR3-25 failure. |
| Language and state rules | Approved Lab design. | KeyWrapping `22c06dc`, Economy and EA-IE `cc8371c`, and M01–M06. | [Pinned inputs](docs/preflight/agent-run-2026-11-15-c6-v2/AGENT_RUN_SOURCE_MANIFEST.json) · [Decisions](docs/decisions/DECISION_REGISTER.md) |
| ROOM source and store preview | Original route behavior and overlay scene evidence reported. The preview remains a candidate. | Combat Room v0.1.1 and Claude's 14 November checkpoint, with unchanged frozen input scene. | [Step 1 inspection](docs/architecture/ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md#8-test-execution-and-evidence) |
| Real C6 and official stand-in | Contract approved. Real runtime and Nova's shared suite pending. Official stand-in unbuilt. | `room-c6@0.1`, exact registered contract. | [C6 receipt](docs/decisions/ROOM_C6_OWNER_APPROVAL_RECEIPT_2026-11-15.md) |
| Bodies and portraits | Prior pixel-level checks on the slim Arcade Cast pair, Goose and Brifern. Lab playback awaits implementation. | Five archive pins in the [source lock](docs/provenance/SOURCE_LOCK.json). | [First preflight](docs/preflight/FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md#e-claude-checkpoint-reuse-ledger) |
| Browser and delivery | Claude's requested baseline is unavailable. Step 1 navigation stopped before assertions. Windows acceptance is future work. | No exact packaged Lab artifact exists. | [Evidence index](docs/preflight/agent-run-2026-11-15-c6-v2/AGENT_RUN_EVIDENCE_INDEX.md) |

## Read these first

1. [Current preflight](docs/preflight/agent-run-2026-11-15-c6-v2/FIRST_ENCOUNTER_LAB_AGENT_RUN_PREFLIGHT_REPORT.md) and [remaining gates](docs/decisions/OPEN_APPROVALS.md).
2. [Master design](FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md) and [M01–M06 approvals](docs/decisions/FIRST_ENCOUNTER_LAB_OWNER_APPROVALS_M01_M06_2026-11-14.md).
3. [Revised C6](docs/architecture/ROOM_C6_PHYSICAL_CONTROL_CONTRACT_v0_1_REVISED.md) and [Step 1](docs/architecture/ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md).
4. [Original source lock](docs/provenance/SOURCE_LOCK.json) and [C6 fingerprints](docs/provenance/ROOM_C6_INPUT_FINGERPRINTS_2026-11-15.md).
5. [Agent ownership](docs/architecture/AGENT_OWNERSHIP_AND_HANDOFFS.md), [file-plan reconciliation](docs/preflight/agent-run-2026-11-15-c6-v2/FIRST_ENCOUNTER_LAB_AGENT_RUN_PREFLIGHT_REPORT.md#k-exact-file-ownership), and [acceptance matrix](docs/testing/ACCEPTANCE_MATRIX.md).

## Current blockers and next actions

- **Teddy’s build authorization.** Review the proposed headless A1–A3 slice and A7 checks. Implementation requires a separate command with the exact revision, paths, inputs and stop point.
- **Nova’s ROOM candidate and shared C6 suite.** Separate Stage A and Stage B approvals, reviewed wire cases, scene audit, frozen candidate fingerprints, and the unchanged common tests are required for physical integration. Codex A4's future scope is the Lab bridge and one test stand-in.
- **Claude’s browser evidence.** Run the matched original and overlay baselines before repair and later check each exact repair candidate. A7's independent native-Windows proof and Teddy's playthrough come after an exact Lab artifact exists.

This pass permitted documentation and inspection. Production, stand-in construction, shared-suite authoring, ROOM repair and scene edits remain outside the current scope.

## How to run and test

There is no runnable Lab in this checkout. The archived ROOM preview contains a store and presentation prototype. Earlier test outcomes are linked above. Phase 0 inspected matching source bytes and reused their evidence. No Lab, browser, or conformance test ran in this pass.

## Team and checkpoint

The Lead maintains the handoff and verifies changes. A1 owns state, effects and saves. A2 owns communication, references and exact assent. A3 owns pure decisions and routines. A4 owns the future bridge and official stand-in. A5 owns permitted presentation integration, A6 the scoped UI, and A7 independent checks. The Phase 0 audit assignments are finished. Production roles are inactive. [Future checkpoints](docs/architecture/BUILD_CHECKPOINTS.md)

## Recent changes and resume

- Registered the exact revised C6 contract, approval receipt, Step 1 report and source fingerprints.
- Compared matching historical evidence, reconciled ownership and recorded the independent first-slice proposal.

Resume by reading this file and the [staged v2 runbook](docs/runbooks/FIRST_ENCOUNTER_LAB_CODEX_AGENT_TEAM_RUN_v2.md), then checking the branch, report checksum, reviewed inputs, active owner authorization and unresolved gates. The next action is Teddy and Nova’s review.
