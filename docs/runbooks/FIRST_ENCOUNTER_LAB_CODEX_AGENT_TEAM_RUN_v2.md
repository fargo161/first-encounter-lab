# First Encounter Lab — Codex agent-team run v2

**Prepared:** 2026-11-15.  
**Repository:** `fargo161/first-encounter-lab` — the existing independent Lab repository.  
**Earlier pre-flight:** `2026-11-14-lab-pf-952b4`.  
**Last repository revision checked when this prompt was prepared:** `bbed22c4bf4bdad453f7d698a80a36f869320980`. Recheck the live and local revisions; this is a reference, not permission to overwrite newer work.  
**Immediate mode:** `PREFLIGHT_ONLY`.  
**Later production instructions:** included below, but inactive until Teddy reviews the new pre-flight and gives a separate, scoped build command.

## 0. Read this first: the job and its stopping point

**A few terms:** a *fingerprint* is a SHA-256 code identifying exact file contents; a *manifest* is a file inventory; a *stand-in* is a test-only substitute, not the game; an *adapter* translates one component's requests into another's; a *gate* is a condition that must be proved before work advances.

You are the Lead coordinating the First Encounter Lab team. The project is a small first-person store that demonstrates reusable communication, real purchases, remembered arrangements and changing relationships. It is the first working tile of Trapstar, not a disposable demonstration.

Teddy has approved M01–M06 and has now explicitly approved **`ROOM_C6_PHYSICAL_CONTROL_CONTRACT_v0_1_REVISED.md`**. Register that approval. Do not ask him to approve those same design decisions again. Approval of the contract is **not** approval of a ROOM repair or evidence that a C6 implementation exists.

**Your first execution of this prompt must do only these things:**

1. Verify the correct repository, approved documents, actual source access and agent capabilities.
2. Register the approved C6 contract and accepted Step 1 report without changing their bytes.
3. Update the README into the short, living project handoff described in section 6.
4. Perform the bounded pre-flight inspection, existing-test verification and team planning below.
5. Create **`FIRST_ENCOUNTER_LAB_AGENT_RUN_PREFLIGHT_REPORT.md`** and its evidence/manifest files for Teddy and Nova to review.
6. Stop every audit agent and running audit process. **Do not continue into implementation automatically, even if the report is green.**

This first pass permits documentation and audit artifacts only. Do not implement the game, create a stand-in, author the shared C6 test suite, repair ROOM, alter Encounter runtime code, change the store scene, or start the production agents.

**Reason:** the design is approved, but the team must first establish exactly what it can build now and what still depends on Nova's separately authorized physical work.

### Scope that never becomes authorized merely by this prompt

- Codex does not edit ROOM source, including a copy, fork, runtime bundle, monkey patch or replacement physics module. In particular, `source/core.js` and its shared route checker stay unchanged.
- Codex does not repair ROOM Stage A or Stage B. Those are separate Nova assignments, with a stop and owner review after each.
- Codex does not erase or edit the accepted M3, KeyWrapping, Economy, EA-IE or other producer histories.
- Codex does not make the repository private or public, recreate it, alter account permissions, rewrite Git history, force-push, or publish a release without separate scope.
- Codex does not add a live model/API to the finished game. Development agents may use their normal development tools; runtime NPCs use written rules and stored data only.

The later build can proceed in independently testable lanes while ROOM work is pending, **but only after the separate build authorization described in section 15**.

---

## 1. Work in the right place and preserve existing work

The intended local repository is the independent `first-encounter-lab` Git root. A previously used path is `<existing independent Lab checkout>`; verify rather than assume it.

Before any write, report the actual working directory, Git top-level directory, branch, HEAD, remote URL and working-tree status. Confirm the repository identity is `fargo161/first-encounter-lab`.

If the current workspace is `First-Encounter-Game`, `encounter and rc`, `dungeon-manager`, or any other project, switch to the existing independent Lab directory using supported workspace access. Re-read the instructions that apply there. If the directory cannot be located or written within granted permissions, stop with the precise blocker. Do not create a nested repository or a second Lab.

Read the effective `AGENTS.md` and any applicable overriding instructions. Do not bypass them or edit global Codex settings to expand your own authority. In Phase 0, the production hold remains in force. A narrow documentation update may add this prompt, the approved contract and README-maintenance rules to the reading list.

Capture pre-existing changes before starting. Do not delete, stage, revert, commit or include somebody else's changes. Prefer disposable copies for inspection, archive extraction and existing tests that generate output. Extract safely: reject archive traversal paths and never overwrite a source archive.

The repository's current public visibility is **not** a blocker to the requested documentation work. Do not repeat the earlier private-public loop. Keep credentials and new machine-specific personal information out of public artifacts. Importing or publishing source/art still follows its separately recorded rights and approval requirements.

If network access is restricted, use supported approval requests where necessary. Report network, authentication and repository-access failures separately. Do not claim a push succeeded until the remote revision and file inventory have been verified.

**Reason:** the earlier work began in an unrelated project, and different clients had different GitHub permissions. Verify identity and access once, then preserve that boundary.

---

## 2. Read order and authority

Read the following exact sources, not just summaries or filenames:

1. Current repository `README.md`, `AGENTS.md`, `FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md`.
2. `docs/decisions/FIRST_ENCOUNTER_LAB_OWNER_APPROVALS_M01_M06_2026-11-14.md`, `DECISION_REGISTER.md`, `OPEN_APPROVALS.md` and `docs/provenance/DOCUMENT_AUTHORITY.md`.
3. The approved revised C6 contract supplied with this prompt, all sections including message formats, tests and staged repair rules.
4. The accepted `ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md`, and its evidence ZIP where available.
5. The selected repository copies of the interaction design and corrected decision specification v0.2.
6. `docs/architecture/SYSTEM_CONTRACTS_C1_C8.md`, `AGENT_OWNERSHIP_AND_HANDOFFS.md`, `BUILD_CHECKPOINTS.md`, and `docs/testing/ACCEPTANCE_MATRIX.md`.
7. The immutable source lock and original pre-flight report/index/manifest, followed by the actual source modules relevant to each agent's work.

**Authority order:** Teddy's latest explicit, scoped decisions; accepted producer boundaries; the approved C6 contract for this Lab's physical interface; owner-approved interaction/decision documents plus M03 amendments; verified source behavior; historical reports; proposed implementation details. An apparent conflict is reported with both locations and the affected behavior. Do not silently reinterpret an accepted rule to make implementation easier.

The revised contract still contains historical phrases such as “proposal” and “await approval.” **Preserve those bytes.** An approval receipt must record Teddy's subsequent explicit statement, **“contract is approved,”** identify the exact contract hash, and say that implementation and runtime acceptance remain separate gates. Likewise Step 1's old “no contract has been written” sentence describes that earlier inspection, not today's status.

Do not let old source comments, frozen pre-flight `NEEDS_OWNER_DECISION` labels, or the original master prompt's dormant Stage 1 overrule the newer decisions. Do not silently edit the frozen documents to remove their historical wording.

### Exact small inputs for this run

| Input | Bytes | SHA-256 |
|---|---:|---|
| `ROOM_C6_PHYSICAL_CONTROL_CONTRACT_v0_1_REVISED.md` | 72387 | `55c8094417ead764421825aa19706d26137c456bbb9f2484f40c7d2d47d7afd2` |
| `ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md` | 35413 | `cb9719b9cc0b9eb4abab5121b7c00fd2abf10bcf52d1b73b9b264dd713183a79` |
| `ROOM_C6_STEP1_TEST_EVIDENCE.zip` | 97101 | `70dab3ec0258ba9f88bb4f8972db57ba7a4c69ac0375115ee9a6e967fc29daf9` |
| Selected interaction design from checkpoint | 19701 | `2ccf9e66a6f9ba56b8272fba1ea3c8c028ec67530f5b97f8a160f9e77100c4d2` |
| Selected corrected decision specification v0.2 | 38229 | `8d34cc75ea59434b4e2499b426c995ef24c24d7db6fa057fcf74f1753d9270c3` |
| M01–M06 approval record including G07 score correction | 8902 | `e5bb4ed4d2afce0fb3995a4e78066284e99c75b65b3ea45d89469cacd86f189e` |

If a named input differs, identify the differing file and compare its actual text. Do not substitute a similarly named loose file automatically. A newer owner-authorized revision needs an explicit provenance entry, not an unexplained replacement.

### Original large inputs — do not duplicate them into this prompt pack or public Git

| Archive | SHA-256 |
|---|---|
| `Room_Creator_v0_2_COMBAT_ROOM_v0_1_1.zip` | `ba6c18be7daedeadfad80845ad627070ff72c7a9a1cfab0fb5564c437d9c870b` |
| `First_Encounter_Lab_Claude_Checkpoint_2026-11-14.zip` | `1fb3644ec2785c96fd866a44003fb1b7a3c73460016b564f10631bdd96b65237` |
| `Arcade_Cast_Four_Mannequins_v0_12.zip` | `af085971ca2e70646f3352caf487cf0af087154aace4a710b51d36bc0261dc0f` |
| `goose_expression_batch.zip` | `ee83fc40c14733d99bef93e0a2b6594b84cc1ab9b4eaa7286413dcf5927bfcf7` |
| `live_expression_gaze_controller_v0_5_1_independent_gaze_standalone.zip` | `6a7d3caba9ab7111694349ab7b4010451c299a4a14878f954c4cc573217b8d33` |

Pinned producer revisions remain M3 `76a92fd82ac5ec6f10748f0b439a5d661fff5ea5`, Economy/EA-IE `cc8371c3c497edcdcfb8a73ec7da9dad4663847a`, and KeyWrapping design `22c06dc179e3a0739a5ce1e747d0a46dc114fab5`. Preserve the separate Stage 12 authority record. Use the source lock for exact package paths and standing; a Git commit existing does not prove a usable working tree or authorise its modification.

**Reason:** the project has same-named files with different contents. The exact approved material must be the team's common starting point.

---

## 3. Phase 0 — register the approval, then inspect

### 3.1 Documentation changes allowed now

The Lead is the only writer of shared documents during pre-flight. Audit subagents inspect and return findings; they do not concurrently edit the master documents.

1. Copy the approved contract byte-for-byte to `docs/architecture/ROOM_C6_PHYSICAL_CONTROL_CONTRACT_v0_1_REVISED.md` and Step 1 to `docs/architecture/ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md`. If exact copies already exist, reuse them. Do not add a second competing contract path or an unapproved “cleaned up” edition.
2. Create a dated C6 owner-approval receipt under `docs/decisions/`, linking both files and the explicit approval. Record the registration timestamp accurately without inventing a time for the owner's earlier message.
3. Link both from **the C6 row** of `SYSTEM_CONTRACTS_C1_C8.md`. Change only the C6 status/reference information there; do not redesign C1–C5 or C7–C8.
4. Add a dated C6 input-fingerprint record under `docs/provenance/`. This is an addition to provenance, not a competing canonical source lock.
5. Update `README.md` as section 6 requires, and make the smallest corresponding documentation updates to `AGENTS.md`, master-design status, document authority, decision register and remaining gates. Say **C6 contract approved; real C6 implementation not yet accepted**. Keep the production hold.
6. Store this v2 prompt under `docs/runbooks/` and identify it as the current staged runbook. Older prompts remain historical and inactive.
7. Add the new pre-flight report, manifests and evidence index to a uniquely named folder such as `docs/preflight/agent-run-<run_id>/`.
8. Produce a new dated documentary checksum manifest, excluding itself. The original setup manifest, approval manifest, source lock, selected design files and historical pre-flight files stay byte-identical.

This expanded documentation scope is for C6 registration, the requested README and this new pre-flight. It is not permission to implement a schema, test stub or runtime module.

Do not overwrite a prior pre-flight report with the same filename. Use a unique run folder and provide an exact copy of the new report as a downloadable handoff if the tool supports it.

### 3.2 Bounded audit tasks

Use actual subagents where supported, within **four total active slots including the Lead**. Record real agent IDs/roles, assignments and outputs. Do not narrate fictitious delegation. If delegation is unavailable, finish a clearly labeled single-agent pre-flight; do not claim independent review or a multi-agent build.

Suggested audit waves:

- Lead: workspace, approvals, fingerprints, current README, report assembly.
- A1/A2 audit assignment: existing Encounter/KeyWrapping/Economy source and the approved store changes.
- A3/A4 audit assignment: decision rules, exact C6 interface, stand-in dependency and the separation of independent versus physical work.
- A7 audit assignment: independent check of source identities, evidence claims, file ownership and proposed gates; inspect the others' findings against sources, not their summaries alone.
- Queue A5/A6 asset/UI inspections as needed; do not exceed the slot cap or start nested subagents that silently exceed it.

Read the current baseline before assigning implementation. Establish which engine modules will be reused unchanged, adapted with a version change, or implemented because genuinely absent. Explain each new module in one sentence. A new folder called `core` is not permission for a clean-room replacement of Encounter.

Run only existing, relevant checks in disposable copies, with the time allowances in section 12. Pre-flight may use scratch-only inspection and document-validation helpers, but no new gameplay, bridge, schema, stand-in or acceptance-test implementation. Inspect imported scripts before running them and do not allow them to publish, alter original sources or install unapproved dependencies.

Reuse the accepted Step 1 evidence honestly. If not rerun here, mark it **REPORTED — STEP 1**, not freshly passed. In particular the earlier block-layout timeout was followed by Step 1 successful runs of about 41–42 seconds. Do not keep listing that as an unexplained persistent failure, and do not call an unrun browser check a pass.

Claude is the designated browser-baseline and repaired-ROOM executor. Locate a separately supplied Claude baseline report if one is actually available. **Do not assume that its announced run has completed.** Missing browser results block acceptance of a real ROOM candidate, not an otherwise independent Encounter unit-test lane.

### 3.3 Stop on source-level uncertainty, not on missing future gameplay

A missing purchase system, stand-in or portrait integration is expected implementation work. Record it; do not turn every unbuilt feature into another owner design question.

A missing approved source, conflicting rules, inaccessible tool, absent shared C6 suite, unknown asset provenance or an unapproved ROOM modification is a real dependency. Name the affected lane and smallest action needed. Do not solve an ambiguity by inventing new contract fields or silently lowering tests.

If the approved C6 prose leaves an observable result under-specified, list its exact section and a concrete example in the pre-flight. In particular inspect session initialization/restoration, immediate rejection versus retained terminal result, and source/result fields for administrative operations. Freeze those interpretations for review before A4 and Nova independently implement them. This is a compatibility check, not permission to expand or rewrite the approved contract.

**Reason:** the pre-flight should prevent mismatched implementations without repeating the entire game-design process.

---

## 4. Required pre-flight report — the review gate

Create **`FIRST_ENCOUNTER_LAB_AGENT_RUN_PREFLIGHT_REPORT.md`**, in simple language with short reasons and exact file/section references. Include every section A–R below, even when the answer is “not available.”

### A. Executive verdict and authority

Use one of `READY_FOR_SCOPED_BUILD_REVIEW`, `READY_FOR_NONPHYSICAL_WORK_REVIEW`, or `BLOCKED`. These are recommendations, never build authorization. Show separately:

```text
M01_M06_DESIGN_APPROVED: true
C6_CONTRACT_APPROVED: true
PREFLIGHT_REPORT_DELIVERED: true/false
GAMEPLAY_BUILD_AUTHORIZED: false
CODEX_ROOM_SOURCE_EDIT_AUTHORIZED: false
REAL_ROOM_C6_ACCEPTED: false or exact separately approved candidate
SHARED_C6_SUITE_AVAILABLE: true/false
CLAUDE_BROWSER_BASELINE_AVAILABLE: true/false
NEXT_ACTION: STOP_FOR_TEDDY_AND_NOVA
```

State what is usable, what the next scoped run could build, and what prevents physical integration. Do not mark an unavailable real runtime as present because its prose is approved.

### B. Workspace, versions and capabilities

Actual Git root/HEAD/remotes/dirty status; effective agent instructions; Node, Python and browser/test-tool versions; read/write/network limitations; real subagent capacity; external source access. Separate Windows native execution from Linux/WSL and from a browser screenshot.

### C. Exact input inventory

For every needed document/archive/module: filename, role, exact hash or commit, accessible location, size where applicable, evidence level, owner and allowed use. Keep personal machine locations in local-only evidence; public report paths can be repository-relative or descriptive. Include the five archives, selected designs, M01–M06 approval, C6, Step 1, M3 and bounded references. Include missing real ROOM candidate and shared suite as explicit dependencies, not fabricated paths.

### D. Approved-versus-pending status

Map the user's approved M01–M06, G07 reconciliation, L1–L3 and revised C6 amendments to current repository records. Explain the historical “proposal” and “pending” text with the new receipt. List only genuinely outstanding decisions; no re-approval of settled choices.

### E. What exists and what is merely specified

A reuse ledger for M3 state/actions/observations, communication, KeyWrapping, decisions, customer routine, ROOM overlay, store scene, mannequin packs, faces, UI, saves and build pipeline. Mark `READ`, `RAN`, `REPORTED`, or `UNAVAILABLE`; give what was actually observed and what is missing.

### F. Exact C6 implementation boundary

List `submit`, `query`, `poll`, all command/query operations, outcomes and event forms from the approved contract. Confirm the stand-in and real adapter will use the same protocol. Name the shared test file owner and required fixture driver; distinguish future Stage A proof from Stage B camera/restore proof. Show how the bridge avoids map copying or route planning.

### G. Test and browser evidence

Commands, source hashes, exits, assertions, elapsed time and limits for fresh checks. Separate inherited passes, actual failures, timeouts, blocked-before-assertions and not-run scripts. Preserve the qualified M3 IR3-25 result as historical known failure; do not mark it fixed or count unrelated failures as that qualification. Include Claude's browser evidence only if actually supplied and identified.

### H. Gameplay/source compatibility

Trace the actor/controller adaptation, original fixed profile keys, cash versus till, exact proposal versions, separate settlement effects, observation/reference provenance, attitudes, BASED cues, deadlines, deposits/refunds and save versioning to actual source. State the supported expression shape for the hold/deposit/balance without adding a new grammar or silently exceeding D4. Escalate any unresolved conflict; approved G07 semantics do not by themselves select an undocumented encoding.

### I. Physical and scene dependencies

Identify the unchanged input scene hash, absent future inside marker/candidate, required scene audit and baseline browser reports. State that Nova, not Codex, owns the real repair and direct frozen-scene edit. No scene regeneration. Mark C6-13 conditional and separately approval-dependent.

### J. Team and concurrency

The Lead/A1–A7 roles, actual available slots, delegated audit work, independent review limits, sequencing and who waits for what. Identify technical isolation separately from instructions: a “read-only” assignment is not itself a filesystem sandbox.

### K. Exact file ownership

Resolve the proposed table in section 8 into non-overlapping allowed paths, including imported reference source, adapted runtime, room import, scene bytes versus bindings, art, unit tests, shared C6 suite, independent tests, manifests, README and `AGENTS.md`. No orphan files and no competing source-lock/contract paths.

### L. Milestones and stop conditions

Map independent work and integration to Lab checkpoints A–E without confusing those with ROOM repair Stages A/B. Name what can proceed before physical integration and what requires a reviewed Stage A or Stage B artifact.

### M. Build tools and source-import plan

Exact proposed commands and dependencies, supported runtime versions, no runtime network/model dependency, offline bundling approach, original-quality art, required rights checks and final delivery format. Distinguish missing development tools from requirements on Teddy's playable HTML.

### N. README and resumption plan

Show the actual README changes, current status block, short reading order, links to this report, exact next action and stale-status checks. Specify when and by whom it is updated. Include the resume procedure following interruption or context loss.

### O. Acceptance coverage

Map T1–T17, B01–B26 and C6-01–35 to owners, fixtures, environment and future proof. Preserve original test wording; link approved interpretations separately. C6 stand-in, real logic, browser and Windows evidence must be distinct. Record pending shared-suite and real-adapter availability rather than inventing their hashes.

### P. Blockers and requested decisions

Separate blockers for independent development, blockers for physical integration, blockers for final acceptance, and work that is simply not built yet. Recommend the smallest resolution for each. No unrelated new systems or indefinite audit loops.

### Q. Preservation and documentation audit

Before/after changes, immutable-file hashes, links/JSON/checksum validation, selected staging/commit/push result, leftover processes and subagents. Preserve old pre-flight and checksum evidence unchanged. Report unsupported checks honestly.

### R. Proposed next authorization — NOT EXECUTED

Provide a filled proposal referencing this report/hash, repository baseline, proposed source lock, permitted lanes/paths and maximum checkpoint. It must be labeled **a draft for Teddy, not approval**. Specify whether the requested scope is independent work or real integration. State remaining external ROOM/Claude dependencies.

### Required companion artifacts

In the same unique report folder, create:

- `AGENT_RUN_SOURCE_MANIFEST.json`: exact selected sources and their measured identities; an inventory, not a replacement for the historical source lock.
- `AGENT_RUN_EVIDENCE_INDEX.md`: every report claim linked to a source or log; identify private/local evidence that is not included.
- `PREFLIGHT_REPORT.sha256`: actual report fingerprint; do not insert the report's own hash into the report.
- `PREFLIGHT_DOCUMENT_MANIFEST.sha256`: hashes of the documentary snapshot, excluding itself and any circular dependency.

Also provide a **review ZIP** outside tracked source containing the report, manifests, evidence index, README and bounded relevant logs/agent findings that are safe to share. Do not include source archives, credentials or unrelated files. Do not replace unavailable logs with invented summaries. Clearly label any missing evidence.

Before delivery, reopen the ZIP and verify its entries and the report hash. Supply real paths/downloads. Shut down all audit work, summarize in at most ten plain sentences and stop.

**Reason:** Teddy and Nova need a concrete file to review before the team is allowed to build, not just “everything looks ready” in chat.

---

## 5. Approved C6 rules the team must not lose

The full approved contract controls. This checklist points to critical rules; it does not replace the exact formats in its section 10.

### Physical responsibilities

- One authored network: `routeNet.vertices`/`routeNet.edges`; named spots: `routeNet.nodes`. The walking grid checks geometry only. Old NPC lanes and camera rails stay untouched.
- For this Lab only, Encounter names the destination spot; ROOM plans/checks/executes the path. Encounter has no copy of the map and no path planner. The older wider-game movement contract retains its standing outside this Lab.
- ROOM reports physical facts. Encounter owns permission, reservation, legitimate observation, memory and meaning. Being near a shelf does not automatically reveal everything on or behind it.
- A4 cannot reproduce collision/routing code in the bridge to work around unfinished ROOM. The official test stand-in is not a shippable second physical engine.

### The interface

Only `RCApp.ext().c6.submit`, `.query`, and `.poll` are production-facing.

Commands: `bind`, `move`, `face`, `gesture`, `release_gesture`, `set_idle`, `cancel`, `set_presence`, `restore`.

Queries: `inspect`, `check_reach`, `snapshot`.

Final statuses: `completed`, `blocked`, `cancelled`, `interrupted`, `timed_out`, `rejected`.

An accepted receipt is not completion. An immediate rejection is final. Every command has one logical final result, with stable request/result identities. Do not create a second final result when retrying, polling or cancelling an already-final request.

### Player and rules-driven movement

- Stage A normal fixture: customer is human-controlled, clerk rule-driven. Customer keyboard movement reports named-spot entry/leave with ROOM event numbers and `request_id:null`; no fake commands per keypress.
- Commanded customer tests use the separate rules-only fixture. Any observer camera is explicitly `TEST_OBSERVER_ONLY` and excluded from the shipped Lab. Clerk first-person binding belongs to Stage B.
- Human bodies reject `move` and `face` as `wrong_controller`; valid `gesture`, `release_gesture` and `set_idle` are allowed. Administrative binding/presence/restore still obey their guards.
- Both input types have the same physical checks. Bodies cannot overlap. Do not invent exclusive-spot reservations inside ROOM.
- A person-caused obstruction waits through the 5,000 ms no-progress allowance and ends `blocked/occupied`. Unknown stalls use `timed_out`; the commanded-move overall default limit is 30,000 ms. Use the approved rules for precedence. These are active ROOM times, not Encounter ticks or test-runner timeouts.

### Events, scene and saves

- Keep every event in order for the live session. No `ack`, `event_gap`, pruning or capped 500-event buffer. The bridge tracks its last successfully applied sequence and supplies `last_applied_seq` when requesting a snapshot.
- Scene fingerprint is checked only at binding and restore. Do not put it back on every message. Ordinary messages still validate contract, scene and session identities.
- Snapshot is refused for unstable physical state or if the bridge has unread/unapplied events. Stable physical saves do not erase unfinished social arrangements.
- Restore validates the full state before adoption and starts a new session. Old-session records are not new arrivals or purchases.
- Starting `present` is explicit. An absent customer has no physical footprint. Self-mesh suppression is not physical absence.
- Reach uses only named spot pairs in v0.1: across the reachable-over counter succeeds; through a solid wall fails. No general arm physics.
- Inside/outside marker enter circles stay entirely on their respective sides of the store boundary. The new inside marker is a direct edit to the tested frozen scene by the authorized ROOM process, not a scene-regenerator run.
- The input scene is `examples/Lab_Store.room.json`, SHA-256 `b11f6f57473dd1c6e5c0facc2d7e0d1be448034ce36a80fe1161d71404e3f42f`. This is **not** the future repaired scene hash.
- Closed before crossing must block. Mid-walk door closure is conditional under C6-13; a larger door change is an owner decision, not an excuse to weaken the required closed-door test.

### One official stand-in and one shared suite

A4 owns future `ROOM_C6_STANDIN_v0_1`. **Nova owns authoring `tests/contracts/c6_contract.test.mjs` after a separately authorized Stage A repair.** Do not reassign that file to A4 or A7 and do not have Codex create its own competing “shared” suite.

Both implementations use the same test-only fixture driver described in C6 section 11: `reset_fixture`, `advance_room_ms`, `drive_player_input`, plus named fixture obstructions/interruptions. Fixture injection must never become a production API.

The shared test file must run unchanged against both adapters; record its SHA-256 and separate results. A7 reviews it and can add independent supplemental tests in its own paths, but cannot change the shared expectations or use a second file as substitute proof.

If the shared suite has not been delivered, mark `SHARED_SUITE_PENDING_FROM_NOVA`. With later authorization, other independent work may continue and A4 may develop the one stand-in provisionally. Neither the stand-in nor C6 conformance is certified until the official unchanged suite runs. Do not force all social-engine development to wait for that external file.

**Reason:** these are exactly the seams where the earlier prototype and reviews diverged. Keeping the agreed boundary prevents another parallel movement implementation.

---

## 6. Make README.md the living project handoff

“Dynamic” means the Lead updates the file as verified project state changes. It does **not** mean a new website, dashboard server, scheduled bot, runtime AI, telemetry service or competing status database.

The README must let Teddy, Nova, Claude or a new Codex session understand the project in a few minutes without rereading the entire conversation. Keep it approximately **600–1,000 words**, with stable headings and links to detailed records. Do not squeeze away important blockers to hit a word count.

### Required structure

**1. Current status — first screen.** Include a short machine-readable block and one plain-language sentence. Example field layout below; fill actual values, never leave an example falsely marked as current:

```yaml
project: first-encounter-lab
status_updated_at: <actual ISO timestamp with offset>
phase: preflight_review
active_authorization: documentation_and_preflight_only
last_reviewed_source_commit: <actual reviewed revision>
latest_preflight: <repository-relative report path>
latest_owner_build_authorization: null
c6_contract: approved
c6_contract_sha256: 55c8094417ead764421825aa19706d26137c456bbb9f2484f40c7d2d47d7afd2
real_room_candidate: not_delivered
shared_c6_suite: not_delivered
standin_status: not_built
playable_lab_status: not_built
next_gate: owner_preflight_review
```

Use `null` or a clear `not_available` value for absent evidence. Do not write `HEAD` or a future commit hash as if it uniquely identifies tested source. To avoid a self-referential hash cycle, the README names the **reviewed implementation/source revision**, while the final handoff reports the commit carrying the README.

**2. What this project is.** Two short paragraphs: two-character store, BASED/KeyWrapping, real economy/history, offline browser target, player/NPC symmetry; no feature creep.

**3. What actually works now.** Compact capability table with columns `Area`, `Status`, `Tested against`, `Evidence`. Distinguish design-approved, implemented-unverified, stand-in-only, real-logic-tested, browser-tested, native-Windows-tested and owner-accepted. Do not call a stage complete because a demonstration looks convincing.

**4. Read these first.** A short ordered path: latest report/authorization, master design, owner approvals, C6 contract + Step 1, source lock, agent ownership/acceptance matrix. Do not duplicate entire specifications in the README.

**5. Current blockers and next actions.** List only active blockers, affected lane, owner and required evidence. Mark “awaiting Nova ROOM candidate” separately from “awaiting Teddy's build authorization.” Include exactly what is allowed now and what must not start.

**6. How to run and test.** Only commands verified for the current artifact. Before code exists, explicitly say that no runnable Lab exists; a staged ROOM preview is not the Lab. Later identify the exact HTML, hash, source revision, save instructions and whether no-helper offline launch was proved.

**7. Team and checkpoint.** Lead/A1–A7 responsibility summary, current active assignments, latest completed checkpoint and which gate remains open. Use links to the detailed ownership and handoff records.

**8. Recent changes and resume.** At most five concise recent changes, then the next concrete task and link to deeper history/handoff records. Preserve earlier details elsewhere, not by growing README into a transcript.

### Update rules

The Lead alone writes shared README status. Specialists provide evidence-backed updates in their handoffs. Update it:

- after pre-flight delivery;
- after an integration checkpoint or accepted component handoff;
- when a material blocker appears or clears;
- when an owner approval changes active scope;
- before a deliberate stop, interrupted-run handoff, or final delivery.

Do not update every animation frame, agent thought or shell command. Do not invent percentages. A failed test is not replaced by the number of passing tests.

`AGENTS.md` must require every fresh or resumed agent to read this status first, then the approved documents needed for its lane. README explains the present state; signed/scoped owner records grant authority. Editing a YAML status flag **cannot** authorize a build.

At every handoff, validate README links, source revision, current authorization, real-versus-stand-in status and the evidence behind each completed claim. A7 flags stale or overstated entries. Keep personal machine paths and credentials out of the public README.

**Reason:** the README becomes a dependable handoff, not a marketing summary that stays unchanged while the project moves on.

---

## 7. Team operating rules after a later build approval

These rules are dormant during Phase 0.

Use one Lead and seven distinct specialist roles. At most four active agents including the Lead, or fewer if that is the actual supported capacity. Queue independent jobs instead of assuming eight simultaneous agents. Keep A7's review independent from production authorship.

Use real delegation tools. If supported, isolate parallel edits in separate worktrees/branches without creating nested repos. If sharing a tree, enforce a single writer for every path. Do not change sandbox settings or Codex configuration to pretend instructions are technical isolation. Record unavailable capabilities.

Every assignment includes:

- the authorization record, baseline revision and input hashes;
- exact read and write paths;
- prerequisites and the upstream/downstream contracts;
- the bounded deliverable, tests and known failure cases;
- forbidden changes and a clear stop condition.

Every handoff includes candidate revision, changed paths, contract effects, exact commands/exits, evidence location, remaining limitations and recommended next dependency. The Lead reviews actual diffs and runs cross-component checks before accepting the handoff. “My module works” is not proof that it integrates.

No agent creates an alternative C6 stand-in, economic ledger, knowledge store, source lock or master contract. Shared interfaces are coordinated by the Lead; changes to approved semantics return to Teddy. Routine implementation choices that do not alter accepted behavior can be documented and reviewed without reopening the design.

Before a stop, finish or safely stop delegated work and child processes, preserve outputs and pending requests, update README and write a resume note. Do not promise continued background work.

---

## 8. Proposed file ownership for the later build

Paths are relative to the independent Lab root. Reconcile with actual files during pre-flight; the exact reviewed mapping is frozen by the later authorization. Do not relocate the whole project merely to fit this table.

| Owner | Sole write area during authorized implementation | Boundaries |
|---|---|---|
| Lead | `README.md`, scoped `AGENTS.md` changes, current master-design status, `docs/runbooks/`, `docs/runs/`, canonical architecture/decision records as allowed, `build/`, `package.json`, dependency lockfiles, `dist/`, `releases/` | No invented approval. Historical manifests/design/source lock immutable. New per-run locks under `docs/provenance/build-locks/<run_id>.json`, explicitly linked to the original lock. |
| A1 — State/economy | `core/`, `content/products.json`, `tests/unit/core/`; exact approved M3 source import under `vendor/encounter-m3/<revision>/`, then frozen | One authoritative state, money/till, stock/title/holding, observation persistence, arrangement effects, stored warmth/trust and causal deduplication, clock and saves. Imported original is read-only after verification; adapted code lives in versioned Lab modules. |
| A2 — Communication | `communication/`, `content/actions.json`, `content/based-cues.json`, `content/dialogue.json`, `tests/unit/communication/` | Meanings, references, exact proposals/assent, supported grammar and outward cues. No second memory store; A1 persists results. |
| A3 — NPC behavior | `decisions/`, `content/roles.json`, `content/personalities.json`, `tests/unit/decisions/` | Pure candidate generation/scoring and bounded routines. Reads A1 state, proposes actions/updates; no direct world mutation. |
| A4 — Bridge/stand-in | `room-bridge/`, Lab-side `scene-bindings/`, `tests/unit/room-bridge/`, `tests/support/room-c6/` | One official stand-in and its test-only adapter/driver, plus real adapter wrapper. No ROOM geometry/path-planning implementation, runtime repair or authoritative frozen-scene edit. |
| A5 — Performance | `presentation/`, `content/portrait-mappings.json`, approved derived `assets/characters/` and `assets/portraits/`, `tests/unit/presentation/`, asset provenance assigned to this lane | Preserve pixels/quality and true sides; no face or gesture changes history. Original art remains hashed/read-only. Rights gate applies before public push. |
| A6 — Interface | `ui/`, `tests/unit/ui/`, `tests/ui/` | Both modes, composer, inspection, portable file controls. Read scoped APIs; no direct economic/social-state writes or hidden-information leaks. |
| A7 — Independent review | `tests/independent/`, `evidence/independent/<candidate>/`, `docs/reviews/` | Independent contract/gameplay/regression/Windows evidence. No production repairs, no modified expected outputs to force a pass. |
| Nova — external ROOM owner, not a Codex specialist | Real ROOM logic, thin page hooks, directly versioned frozen store scene, `tests/contracts/c6_contract.test.mjs` and its approved fixtures/real-logic fixture adapter | Requires separate Stage A/B authorization outside this run. Codex consumes exact delivered bytes, not edits them. |
| Lead — import custodian only | `room-runtime/approved/<candidate>/`, `scenes/approved/<scene-version>/`, `tests/contracts/` delivered by Nova, untouched original asset/reference inputs | Hash-verified copying only after approved delivery/rights. No content edits. A4/A5 read these inputs. |

Each specialist owns its unit tests; A7 owns independent acceptance checks. A7 does not become the author of Nova's common C6 suite. A1 owns storing and applying relationship changes; A3 owns deciding how those stored values affect a choice; A2 owns learned-reference meaning. This is one pipeline, not three independent stores.

No path is implicitly shared. Identify any omitted file before assigning it. Public publication of imported code/art is a separate check from using local inputs for development.

---

## 9. Later implementation requirements: preserve the actual game

After explicit build approval, implement the approved design rather than inventing a new scenario.

### A1: a single M3-derived simulation

Make source lineage visible: reused file/function, adaptation and reason, new behavior and its test. Preserve the original accepted M3 package and versioned-save distinction. Do not silently load an old save into an incompatible Lab format.

Characters are persistent people; human/rules control is an assignment, not an identity type. The store till is not the clerk's personal cash. Track real stock, holding, title and reservation separately. Use stable IDs and money units that cannot drift through floating-point arithmetic.

A message or promise alone does not move goods or funds. Settlement records payment and handover as separate validated effects; a failed second effect leaves an honest partial record. Retry does not repay. Refund is a new effect. Partial waiver or late completion must not erase other owed parts.

Knowledge and lasting warmth/trust updates require legitimate information receipt and a unique causal source. Preserve the three levels: ROOM physical fact; Encounter observation; Encounter memory/meaning. Stored judgment for the human-controlled actor is diagnostic policy state, not a claim about the human's private feelings.

### A2: communication and KeyWrapping

Keep Request/Offer/Remark. Use the accepted expression structure and a small supported composer, with explicit whole rejection of unsupported forms. All twenty BASED vibes exposed in the Lab need authored outward cues; the listener receives cues/prominence, never the sender's private vibe label or scorecard.

Show known subjects; distinguish expressible versus executable actions. A hidden stock/reservation fact cannot secretly remove an option. Freeze proposal versions; unambiguous assent, counters, defer and clarification have their approved meanings. Conversations may end without erasing open proposals or obligations. Acknowledge is not assent and must not create endless acknowledgement loops.

Map the existing action dictionary deliberately. Do not adopt legacy Deal/Pressure/Ask as a replacement or add parser-driven free text as the core.

### A3: personality, routine and exact approved scoring

One priority/score table, stable tie breaks, no dice. Separate cannot, may-not and will-not; knowledge-scoped candidate checks differ from authoritative execution checks. A human chooses from the same lawful available choices; both controllers have the approved two-counter cap per proposal chain.

Use the refundable deposit policy: $2 on a $5 item leaves $3; visible frozen pickup terms, express reservation release after no-show, and a remaining refund obligation, not hidden forfeiture. Late/missed history survives. Score refundable holds as small exposure. The amended worked totals, in Accept/Counter/Refuse order, are:

| Case | Totals | Winner |
|---|---|---|
| 1 Stranger, sufficient stock, well-received approach | `-1 / 0 / -6` | Counter |
| 2 Trusted customer, well-received approach | `+3 / +2 / -8` | Accept |
| 3 Trusted customer, disliked approach | `+1 / +2 / -6` | Counter |
| 4 Stranger, last item | `-7 / -6 / -3` | Refuse |

Use the approved amendment as the source of these expectations; preserve the frozen historical table. The NPC states a real decisive reason, with the approved stable fallback. Due-tick completion is on time. Catch-up runs once under the approved policy and is independent of movement/animation milliseconds.

Routines remain bounded authored steps: browse, choose, approach, propose, respond, settle/perform, leave. Handle refusal, counter, clarification, deferred decisions, obsolete arrivals and interruptions without infinite loops or silently stalled state.

### A4/A5/A6: real inputs and honest presentation

A4 queues destination commands and processes correlated physical results; it does not plan a route. Real arrival or player spot events must precede dependent action eligibility. Apply the event cursor only after processing. Before save, drain and apply events then request a stable physical snapshot; retry `unread_events`, do not lose the last arrival.

A5 drives the two-stage hearing/reply face plus body from committed records. Normalize Goose/Brifern side conventions in mappings, preserve source quality, use Neutral with a recorded diagnostic for missing expressions. No visual skip/cancel/replay can transfer property or duplicate an event. A reachable counter handover is not a wall-crossing animation trick.

A6 uses one actor-scoped interface for clerk/customer, distinct Development and Play modes, no in-play control hopping, and an inert-on-read inspector. Development edits and comparison runs stay separate from the original world's history. A stand-in-only interface or nonphysical harness must be conspicuously labeled; it is not the finished first-person game.

**Reason:** the valuable result is one person whose next interaction changes because of actual history, not several separately working widgets.

---

## 10. Build sequence after authorization — independent work first, real proof later

Distinguish **Lab checkpoints A–E** from **ROOM repair Stage A/Stage B**. They are different gates owned by different processes.

### Wave 1 — independent state, language and decisions

With a reviewed scoped authorization, A1/A2/A3 implement their pure modules in parallel once their shared data/commit boundaries are agreed. A7 checks nonphysical behavior. Keep the working source adapter traceable to M3. These lanes need not wait for a real ROOM runtime.

Freeze the minimum typed data boundary before coding across it. Do not spend the entire run writing new frameworks. Build one real nonphysical message → decision → recorded transaction/arrangement path, with repeat/load/failure checks.

### Wave 2 — official stand-in, UI and portrait preparation

A4 builds only the official C6 stand-in/bridge in its permitted paths, under explicit scope. A5 integrates the portraits/body mappings; A6 exposes the scoped controls and inspector. Any physical outputs remain test-fixture evidence until the real runtime exists.

Nova supplies the common C6 suite through separately authorized work. Test its exact bytes against the stand-in. If absent, report a pending gate, not a self-certified substitute. No private mock for each lane.

### Wave 3 — real ROOM integration

Only after Teddy identifies an accepted candidate/scene and authorizes integration, import the small ROOM repair overlay and assemble it on its pinned baseline in a disposable copy. Verify every changed/original file and assembled-tree fingerprint. Do not ask for the full archive to be copied around every stage. Do not edit an approved runtime after import; request a new candidate from Nova when needed.

Run the same unchanged C6 suite against the real logic and stand-in. Confirm Claude's baseline and repaired browser evidence matches the exact source/scene. A7 performs its own authorized checks; a supplied report does not automatically satisfy its independent gate.

ROOM Stage A delivery stops for its owner review. It does not authorize Nova Stage B or full Lab integration automatically. A partial Stage A candidate is not proof of clerk-camera or stable-restore behavior. The final integrated Lab needs the relevant accepted Stage B capabilities.

### Lab checkpoint exits

| Checkpoint | Required proof and stop |
|---|---|
| A — integrated foundations | Both identities, correct control ownership, verified stable bindings and real C6 legal movement/result/gesture behavior. Headless module passes alone do not close this checkpoint. |
| B — real customer sale | One genuine purchase through supported communication, exact assent, funds/till/stock/title/holding effects; injected failure, deduplication, save/reload. |
| C — history and return | Earned references, hold/pay-later, no-show/refund, overdue and done-late, observed attitude changes and the four amended worked outcomes. |
| D — clerk perspective | Real clerk camera/control, autonomous customer completes or declines, same grammar/state/economy and no duplicate body or input. |
| E — delivery candidate | All required independent checks, real rendered walkthroughs, exact offline HTML, portable saves, source/evidence package and native Windows test. Teddy's final playthrough/acceptance remains separate. |

At the end of the **authorized** scope/checkpoint, update README, deliver evidence and stop. Do not cross an unapproved checkpoint simply because the next task is obvious. If only independent work was authorized, deliver an honest nonphysical checkpoint and stop without calling it a playable Lab.

---

## 11. Acceptance and evidence rules

Keep all original T1–T17 and B01–B26 wordings and the C6-01–35 descriptions. Add linked approved interpretations and statuses without silently rewriting old expected behavior. Current G07 and known-fact interpretations govern applicable new test assertions.

Use four separate physical evidence labels:

- `STANDIN_CONTRACT_PASS`: official shared suite against the official stand-in.
- `REAL_LOGIC_CONTRACT_PASS`: identical suite against the real pure ROOM logic.
- `REAL_BROWSER_PASS`: actual candidate page tests, with rendering/control behavior.
- `WINDOWS_DELIVERY_PASS`: exact final hashed HTML on native Windows with network dependencies blocked and portable-save round-trip.

A partial pass records its test subset. C6-33's joint gate is open until both implementations pass the complete same applicable shared suite. Stage A delivery may remain an interim candidate; it is not full C6 acceptance.

A7 independently covers at least: unknown-fact menu invariance; exact version assent; two-counter parity; duplicate commands/effects/observations; real money conservation; split settlement failure/recovery; refund obligation and released stock; inclusive deadline; restart/catch-up deduplication; human background judgments not forcing choices; no fake keypress requests; blocked/occupied versus unknown timeout; unread-event save refusal; initial absence and correct returns; both cameras; portrait side/gaze fallback; legacy packs; stable and malformed save handling; network-free delivery.

Tests must interrogate the real state they claim to prove. A screenshot of an Offer/Take pose is not proof of purchase. A simulated event is not proof of real collision. Do not weaken or delete a failing test, edit a supplied browser harness to obtain green, or count a skipped/blocked test as passed.

Preserve each failure and subsequent rerun as separate evidence. Historical IR3-25 remains specifically identified; the new Lab cannot claim success by inheriting an unrelated waiver. If equivalent defective behavior affects this Lab's required flow, report it and fix only within the authorized Lab adaptation or seek a decision.

**Reason:** replayable decisions and believable memory depend on consistency that a visually attractive preview cannot prove.

---

## 12. Test environments and minimum runner allowances

Use the exact script list in approved C6 section 14; do not invent an installed browser or a completed Claude report.

Existing non-browser baseline examples, each in a disposable matching source root:

```text
node tests/block_layout.test.js
node tests/vehicle_world_v2_5_two_block_transit.test.js
node tests/vehicle_graph_examples_diff.js
python tests/asset_intake_test.py
```

Run the existing top-level `tests/*.test.js` separately when that full suite is in the authorized verification scope. Preserve their source bytes. Relevant browser baselines from the contract:

```text
python tests/combat/combat_playtest.py
python tests/route/route_smoke.py
python tests/route/route_keys.py
python tests/route/characters_smoke.py
```

Overlay/candidate only:

```text
python tests/lab/lab_play_page.py
python tests/lab/lab_store_playtest.py
```

Additional targeted browser regressions and the required report fields are listed in the C6 contract. Claude runs unchanged original and overlay browser baselines before any ROOM repair, then each repaired copy. Nova's author tests, Claude's browser execution, Codex A7's later independent checks and Teddy's native Windows acceptance are separate records.

| Test | Runner allowance |
|---|---:|
| Block layout | 120 seconds per run |
| Two-block transit | 90 seconds per run |
| Full top-level Node suite | 20 minutes overall with per-script limits retained |
| Targeted browser play/smoke | 240 seconds per script; at least 60 seconds startup/page allowance |
| Browser performance/heavy capture | 300 seconds initially; report measured duration |
| New pure C6 test file | 60 seconds; use the controlled test clock for movement timeouts |

These are execution allowances, not claims about required runtime or instructions to bypass environment limits. If a tool has a shorter call limit, use supported process execution/polling to allow the test to finish; otherwise report that constraint. Do not shorten a slow test until it fails and call that a regression.

For each test preserve exact command/cwd, source and scene hash, environment/browser binary version, exit or timeout, elapsed/limit, assertion names and pass/fail/skip totals. Browser refusal before assertions is `BLOCKED_BEFORE_ASSERTIONS`. Native Windows acceptance cannot be replaced by Linux Chromium or source inspection.

---

## 13. Final packaging, README and delivery

These steps apply only to the later authorized candidate, never Phase 0.

Deliver the modular source, exact runnable standalone `First_Encounter_Lab.html`, portable example runs, manifests and reproducible commands, reports with known defects, and walkthrough evidence. No helper server, runtime AI, internet/CDN asset, Node/Python installation or developer tooling is required to play the final HTML. Source development may use such tools locally.

Do not reduce resolution, drop expressions, remove functionality or lower asset quality merely to make a transfer smaller. Lossless reorganization must be verified against original pixels and provenance. Large archives remain outside Git where the approved delivery method requires; `.gitignore` is not a reason to omit the user-facing deliverable.

Preserve received ROOM stage deliveries as changed-files overlays at original paths, untouched originals and assembled-tree fingerprints. Never distribute a silently modified real ROOM package or a full duplicate archive each review round.

Keep any stand-in, test-only observer camera and fixture mutation driver out of the production bundle. Build/test guards must prove that the final renderer uses the approved real ROOM implementation.

The README must link the actual candidate, source revision, evidence and current limitations. Until Teddy's playthrough accepts it, say “candidate awaiting owner acceptance,” not “finished.” Do not invent a download URL: verify the actual file exists and can be reopened, then provide the tool's real attachment, release artifact or precise accessible path.

---

## 14. Phase 0 commit, publication and stop

Before committing, compare all changed paths with the Phase 0 allowlist. No engine, art, scene, executable schema, stand-in or production test code may be changed. Scratch audit helpers and test-generated files must not leak into a source commit.

You may create a bounded documentation-only commit for this requested registration/README/pre-flight work in the independent Lab repository, and push it using existing approved access after checking for unrelated or concurrent changes. Stage explicit files, not the whole worktree. Never amend/force-push or overwrite another commit. If remote access is unavailable, preserve the local result and report it; do not recreate the repository. Public visibility alone does not stop this documentation push.

Preserve `docs/provenance/SOURCE_LOCK.json`, `REPOSITORY_SETUP_MANIFEST.sha256`, the prior approvals manifest, selected frozen designs and historical pre-flight material byte-for-byte. Add a new current audit manifest; do not pretend the old manifests describe edited README bytes today.

Verify the new report and its support files, README links/status, actual commit and any push. Report the implementation/source revision separately from the documentation revision. No self-referential checksum or endless commit-to-fix-its-own-SHA loop.

Conclude:

**PREFLIGHT DELIVERED — README UPDATED — IMPLEMENTATION NOT STARTED — AWAITING TEDDY/NOVA REVIEW.**

Do not leave a worker or test process running. Do not launch the build after printing that line.

---

## 15. The later authorization — template only, not granted here

Teddy's separate message must identify the reviewed report and scope. This is the proposed form for the pre-flight report to fill, **not an authorization you may issue yourself**:

```text
AUTHORIZE_FIRST_ENCOUNTER_LAB_SCOPED_BUILD
Pre-flight run ID: <reviewed run>
Pre-flight report SHA-256: <actual report hash>
Reviewed Lab revision: <commit>
Approved C6: room-c6@0.1 / 55c8094417ead764421825aa19706d26137c456bbb9f2484f40c7d2d47d7afd2
Approved source-manifest hash: <actual hash>
Scope: <independent modules / stand-in & UI / specified real integration checkpoint>
Allowed agent/file plan: <reviewed plan and any exceptions>
Maximum checkpoint: <explicit limit>
Shared C6 suite: <exact supplied hash OR pending-from-Nova; no conformance claim>
Real ROOM candidate: <approved assembled-tree and scene hashes OR none>
ROOM source changes by Codex: NOT AUTHORIZED
Publication scope: <documentation/source/art/release boundaries>
Stop for review at: <checkpoint>
```

At authorized re-entry, reread the current README and source documents, compare revisions/hashes, verify no conflicting concurrent work, and record that authorization. Make a narrowly scoped `AGENTS.md` update that permits only the named phase while retaining all protections. This is not a blanket removal of the stop rule.

If the runtime and common suite remain unavailable, a reviewed authorization can permit independent Encounter/communication/decision work and a provisional official stand-in. Real integrated acceptance stays blocked. A later command can open the real integration gate once the exact ROOM candidate and evidence are approved.

---

## 16. Operator references and final instruction

Project requirements above come from the owner's accepted materials, not from external model documentation. Current official operational references consulted when preparing this runbook are:

- OpenAI: `https://learn.chatgpt.com/docs/agent-configuration/subagents`
- OpenAI: `https://learn.chatgpt.com/docs/agent-configuration/agents-md`

Use supported subagent and repository-guidance features actually available in this session. Agent instructions do not independently change inherited sandbox permissions. Keep `AGENTS.md` concise, with links to this detailed runbook and the approved documents; do not paste this entire runbook into it.

**Begin Phase 0 only. Register the approved C6 material, establish the living README, write the reviewable pre-flight report and STOP.**
