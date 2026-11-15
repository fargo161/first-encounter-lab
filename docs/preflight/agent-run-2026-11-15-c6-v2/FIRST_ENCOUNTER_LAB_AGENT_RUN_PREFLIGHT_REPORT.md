# First Encounter Lab agent-run preflight

Run **2026-11-15-c6-v2** · 15 November 2026, America/New_York · Phase 0

Reviewed Lab revision **`bbed22c4bf4bdad453f7d698a80a36f869320980`**

## A. Executive verdict and authority

**READY_FOR_NONPHYSICAL_WORK_REVIEW.** The exact producer inputs are available to inspect. Their earlier evidence describes a bounded M3 foundation and a ROOM preview. A later scoped run could prove one headless exchange with no ROOM input. Physical integration still depends on a tested implementation and candidate evidence.

```text
M01_M06_DESIGN_APPROVED: true
C6_CONTRACT_APPROVED: true
PREFLIGHT_REPORT_DELIVERED: true
GAMEPLAY_BUILD_AUTHORIZED: false
CODEX_ROOM_SOURCE_EDIT_AUTHORIZED: false
REAL_ROOM_C6_ACCEPTED: false
SHARED_C6_SUITE_AVAILABLE: false
CLAUDE_BROWSER_BASELINE_AVAILABLE: false
NEXT_ACTION: STOP_FOR_TEDDY_AND_NOVA
```

[Approval receipt](../../decisions/ROOM_C6_OWNER_APPROVAL_RECEIPT_2026-11-15.md) · [Evidence index](AGENT_RUN_EVIDENCE_INDEX.md)

## B. Workspace, versions and capabilities

The shell started in the coordinating First Encounter Game workspace. Git changes target the existing standalone `first-encounter-lab` Git root, a sibling of `dungeon-manager` under the local projects directory. Before edits local `main` was clean and matched GitHub at the reviewed SHA. Both origin URLs resolved to `https://github.com/fargo161/first-encounter-lab.git`. GitHub reported public visibility. Host paths stay out of public artifacts. Lab `AGENTS.md` applies. The default shell could read inputs and write disposable scratch. Approved execution was needed for the external Lab worktree and GitHub.

Native Windows NT 10.0.26200.0 with Node 26.13.0, Python 3.12.0, Pillow 12.3.0, Git 2.55.0.windows.3 and GitHub CLI 2.96.0. Chrome 157.0.8103.51 and Edge 157.0.4341.60 were read from installed binaries. Active Python lacked Playwright. No native browser, WSL or offline candidate execution was performed. Step 1 used a separate Chromium environment. Four actual audit slots were used. [Assignments](#j-team-and-concurrency)

## C. Exact input inventory

The pack ZIP SHA-256 was `437ba813e23e7594bcfd90bb983c5ef56d18835e4021d1e1fee8d16f6c8e65f0`. All ten manifest-listed members matched before extraction. The outer hash covers the manifest. The supplied runbook was read in full. Its registered public copy replaces one local checkout path. C6 and Step 1 were copied byte for byte.

The [source manifest](AGENT_RUN_SOURCE_MANIFEST.json) identifies 64 input instances and five pinned producer trees by owner, path/archive member, exact hash and size where applicable, evidence and allowed use. The five original archive fingerprints matched the first preflight. Combat Room v0.1.1 and Claude's checkpoint also matched Step 1. The selected interaction, decision v0.2 and M01–M06 files matched the pack. M3 `76a92fd82ac5ec6f10748f0b439a5d661fff5ea5` and Economy/EA-IE `cc8371c3c497edcdcfb8a73ec7da9dad4663847a` share the Atlas tree `91ab0abf5ff82ddd62f99204669eed0f05204639`. KeyWrapping design `22c06dc179e3a0739a5ce1e747d0a46dc114fab5` and Stage 12 authority `2c9a2e4406418ff432ab169ef9565ce3d302dea4` are distinct pins. Missing inputs have explicit entries and no inferred hashes. [C6 fingerprints](../../provenance/ROOM_C6_INPUT_FINGERPRINTS_2026-11-15.md)

## D. Approved-versus-pending status

| Decision | Standing and remaining proof |
|---|---|
| M01, L1–L3 and C6 | Teddy approved the revised contract on 15 November. Keep legacy movement separate, assign Lab-only path planning and physical arbitration to ROOM, and bind only clerk and customer. Nova's staged repair assignments and exact runtime acceptance remain open. |
| M02 | Versioned M3-derived adaptation and one authoritative history approved. Exact import subset, permitted paths and scoped build command pending. M3 v3 and IR3-25 stay intact. |
| M03 | Known-fact menus, both-controller two-Counter parity, refundable no-show hold, inclusive due tick and true decisive reason are settled. G07 amends score arithmetic. Compound hold representation and activation need review. |
| M04 | Five archives, three foundation revisions and selected designs approved. Overlay remains evidence. Tested scene/runtime and source/art rights remain gates. |
| M05/M06 | One writer and up to four slots including Lead, independent A7, A7 native Windows proof and Teddy's same-artifact playthrough approved. Production remains inactive. |

The printed C6 proposal status and Step 1's earlier status describe their creation dates. The [decision register](../../decisions/DECISION_REGISTER.md) and [C6 receipt](../../decisions/ROOM_C6_OWNER_APPROVAL_RECEIPT_2026-11-15.md) establish current authority.

## E. What exists and what is merely specified

| Area | Evidence | Lab gap |
|---|---|---|
| M3 state/actions/observations | **READ** `src/runtime.mjs`, `contracts.mjs`, `action-boundary.mjs`, `views.mjs` and `src/m3/{types,engine,knowledge}.mjs`. Copied commits, exact IDs and scoped observations. **REPORTED** bounded M3 tests. | Version identities and controller. One ledger for till, personal funds, stock, title, holding, reservations and causal judgment. |
| Language and KeyWrapping | **READ** `m3/meaning.mjs`, accepted expression/commitment design and bounded EA-IE receipt/query code. | One supported Request/Offer/Remark path, exact assent and outward cues. Full composer and cue authoring future. |
| Decisions and routines | **READ** M3 `policy.mjs` deterministic collection priorities and v0.2 store design. | Store scoring, role parity and authored autonomous routine. |
| ROOM and scene | **READ** original checker/routes and archive overlay `ui-lab.js`, `ui-route.js`, scene and tests. **REPORTED** Step 1 fixture results. | Real C6 geometry, correlated results, cameras and restore. |
| Bodies, faces and UI | **READ** checkpoint face descriptors, preview and M3 shell/UI. **REPORTED** 432 exact named frames per body, Goose 18 and Brifern 33 shared/99 per-eye comparisons. | True-side mappings, legacy fallback, Goose anatomical vs Brifern picture sides, hearing/reply and Neutral fallback. Play UI remains unbuilt. |
| Saves/build | **READ** strict M3 `encounter-save@3` replay. **REPORTED** historical ROOM rebuild. | Versioned Lab save boundary and exact standalone HTML. |

Reuse unchanged commit/dedup and canonical validation helpers where compatible, preserving dependencies. Adapt the scenario, knowledge, meaning and policy boundary. New ledger effects separate payment and handover. New Lab save data carries version and replay state. Pure decision code consumes scoped inputs. No clean-room engine or second knowledge store is proposed.

## F. Exact C6 implementation boundary

Approved §10 exposes `RCApp.ext().c6.submit(commandEnvelope)`, `query(queryEnvelope)` and `poll(eventQuery)`. Commands are `bind`, `move`, `face`, `gesture`, `release_gesture`, `set_idle`, `cancel`, `set_presence`, `restore`. Queries are `inspect`, `check_reach`, `snapshot`, with `query_result`. A valid reach query can report false. Snapshot refuses `busy` or `unread_events`. Poll is `event_query` to `event_batch` with returned and latest sequence. Events are `spot_entered`, `spot_left`, `command_final`, optional contact-based `player_blocked`.

Receipt is non-final. Terminal outcomes are `completed`, `blocked`, `cancelled`, `interrupted`, `timed_out`, `rejected`. ROOM owns routes and occupancy. Bridge passes destination and correlates stable IDs without a map or planner. Player events have null request IDs. Human move/face reject and valid pose commands remain legal. Known person obstruction becomes `blocked/occupied` after 5,000 active ROOM ms. Unknown stall or deadline can time out, with a 30,000 ms movement default. ROOM milliseconds do not advance Encounter time. Bridge advances its cursor only after apply. Full live event retention has no ack, gap error or pruning. Scene hash is checked at bind/restore. Stable snapshots refuse unread events. Restore rotates the session.

Nova owns the sole `tests/contracts/c6_contract.test.mjs` and real fixture driver after separate authorization. A4 owns the future official `ROOM_C6_STANDIN_v0_1`. Same protocol and unchanged suite for both, with `reset_fixture`, `advance_room_ms`, `drive_player_input` and named fixture interruptions/obstructions. Stage A uses the customer human view and separate rules-only movement fixture. Stage B proves both bindings/cameras and stable restore. Neither implementation nor suite exists here.

**Before the two adapters are written, review these wire cases.** The contract remains exact.

| Sections | Observable ambiguity |
|---|---|
| §§8–10.3 | Provisioning the first active session and validating the first bind when the actor is still unbound. |
| §§9, 10.4, 10.6–7 | Which stream owns restore's terminal result/final event across rotation and sequence zero, replay of that result, and how restore derives self-mesh/camera state absent the bind flag in the snapshot. |
| §§10.2, 10.4, 10.6 | A changed-payload duplicate rejects without replacing the original terminal. Specify which stale/invalid/reused-ID rejections are retained, with stable IDs and no mutation of the active log for a foreign session. |
| §§10.4–7 | Null/missing actor and final state for disabled/absent/unbound actors and session-wide restore, admin event source, and negative reply shape for malformed/stale queries and polls. |

[Approved C6](../../architecture/ROOM_C6_PHYSICAL_CONTROL_CONTRACT_v0_1_REVISED.md)

## G. Test and browser evidence

Current checks were checksums, pinned source reads, evidence inspection and document validation. Phase 0 ran **zero behavioral tests**. Matching input fingerprints and the absence of any new candidate made earlier results applicable as reported evidence.

| Label | Command and input | Reported outcome |
|---|---|---|
| REPORTED — FIRST PREFLIGHT | `node --test tests/m3.test.mjs` in pinned `76a92fd` export | 48 pass, 0 fail, 0 skip, exit 0, 13.213 s. |
| REPORTED — FIRST PREFLIGHT | `node scripts/run-independent-m3-r3.mjs` in the same export | 24 pass, 1 fail, 0 skip, exit 1, 5.692 s. IR3-25 concerns inconsistent rectangle dimensions earning an invalid display receipt. This is the one named qualification. |
| REPORTED — STEP 1 | Individual `node tests/*.test.js` commands in disposable original and assembled overlay | Original 42/42 exit 0 and 813 PASS lines. Overlay 43/43 exit 0 and 831. `block_layout` 7/7 each, 40.95/42.20 s with 95 s allowance, resolving the earlier timeout for these bytes. `vehicle_world_v2_5_two_block_transit` 19 each, 24.17/23.85 s. Lab scene 18 in 0.63 s on overlay. |
| REPORTED — STEP 1 | `python tests/asset_intake_test.py`, `node tests/vehicle_graph_examples_diff.js` | Asset 23/23 both. Seven named recipes preserved apart from intended graph changes. Other orchestrators not separately run. |
| REPORTED — STEP 1 / BLOCKED_BEFORE_ASSERTIONS | Unchanged `python tests/combat/combat_playtest.py` and `tests/route/{route_smoke,route_keys,characters_smoke}.py` on both copies. Overlay added `tests/lab/{lab_play_page,lab_store_playtest}.py`. | Four original and six overlay attempts exit 1, 1.8–3.3 s. System Chromium blocked `file://` navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. Zero assertions, zero browser passes. Other browser scripts unrun. |
| UNAVAILABLE | Claude's requested matched browser baseline; joint C6 suite/real runtime; final Windows HTML. | No qualifying logs. Historical checkpoint author browser claims belong to separate evidence. |

[First preflight §F](../FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md#f-baseline-test-results) · [Step 1 §8 and Appendix A](../../architecture/ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md#8-test-execution-and-evidence) · [Input hashes and evidence](AGENT_RUN_EVIDENCE_INDEX.md)

## H. Gameplay/source compatibility

M3 `types.mjs` lines 27–43 fix human/partner and only allow NPC `service`, `privacy` and `verification` keys. `engine.mjs` lines 45–100 and 235–247 use a fixed product/custodian, one active offer and combined staged payment/custody. A versioned Lab adaptation needs two persistent actors with assignable control, till distinct from personal balances, stock/title/holding/reservation, exact versions and separate effects with stable retry IDs. `engine.mjs` lines 273–304 gives scoped view and strict save/replay. `meaning.mjs` lines 8–36 frames private cues and known reference, with Yes only acknowledgement. Lab assent binds the exact live version. `knowledge.mjs` lines 11–42 and EA-IE receipt queries supply evidence/provenance patterns. A1 persists learned facts and causal warmth/trust. A3 reads scoped policy inputs.

M03 G04/G05 preserve known-fact filtering and both-controller parity. Execution sees actual resources. Frozen D4 supports one statement or two joined once. A known `Pay in exchange for Give` fits. G07 approves visible frozen hold, deposit, balance and refundable no-show. v0.2 §9.5 defers arbitrary part payments. General KeyWrapping expressions can represent grouped and linked terms, but Lab handling for the compound hold is unresolved. A review option is two visible linked exact-version exchanges, Keep until due for `Pay(200)` and Give for `Pay(300)`, with explicit mutual assent and funded activation. Confirm formation, dependency and release before coding that path. Do not silently enable a third clause or grammar. The first slice can skip this encoding entirely.

The amended Accept/Counter/Refuse scores are `−1/0/−6` Counter, `+3/+2/−8` Accept, `+1/+2/−6` Counter, `−7/−6/−3` Refuse. G12 governs the real decisive reason with stable fallback. G10 includes due-tick performance and persisted deterministic catch-up. [Approved M03](../../decisions/FIRST_ENCOUNTER_LAB_OWNER_APPROVALS_M01_M06_2026-11-14.md#m03--five-gameplay-interpretations)

## I. Physical and scene dependencies

The exact `examples/Lab_Store.room.json` member is 9,577,868 bytes, SHA-256 `b11f6f57473dd1c6e5c0facc2d7e0d1be448034ce36a80fe1161d71404e3f42f`. It has 14 vertices, 14 edges, eight named nodes, and `v_in`. `N_store_inside` is absent. `N_store_door` is approach only. `e_gate` and `e_door` reference the same door. Nova must identify the effective crossing edge in the required swept-body and spot audit, including boundary circles. Phase 0 counted the authored graph and did not certify geometry.

Original `core.js` lines 759–774 approve cross-story segments and check walls/openings without props. It stays unchanged. Overlay `ui-lab.js` lines 21–32 cap the event list and lines 64–89 take supplied waypoints. Existing scene assertions therefore do not establish C6. Nova owns the direct frozen-scene candidate edit, every edge/spot audit, scene hash and assembled-tree fingerprint. Scene regeneration was not performed. C6-13 mid-walk door closure is conditional and separately approval-dependent. Closed-before-crossing stays required. Claude's matched baselines must precede repair. [Approved C6 §§2–3, 12–14](../../architecture/ROOM_C6_PHYSICAL_CONTROL_CONTRACT_v0_1_REVISED.md)

## J. Team and concurrency

Four total slots were used. Three real read-only audit agents returned findings and completed. Shared-disk scope was an instruction, with no distinct OS sandbox or production worktree for each agent.

| Audit agent ID | Assignment and output |
|---|---|
| `/root` | Lead retained sole document writes, checked workspace, approvals, archive and Git identities, assembled evidence. |
| `/root/state_language_audit` | A1/A2 read producer source/tests and approved designs. Returned source lines, ledger/assent reuse and D4/G07 boundary. |
| `/root/decision_c6_audit` | A3/A4 read full C6/Step 1 and archived modules/tests. Returned scores, wire cases, scene and browser limits. |
| `/root/independent_preflight_audit` | A7 inspected original inputs and tests, independently reconciled §8 ownership, evidence, C6 gates and the first slice. |

Archive/UI inspection covered the initial A5/A6 questions. No production lanes or additional agents were activated.

## K. Exact file ownership

Every difference from the checked-in [ownership table](../../architecture/AGENT_OWNERSHIP_AND_HANDOFFS.md) to v2 §8 is accounted for below. This is a reviewed mapping proposal. A later authorization freezes the permitted paths.

| Sole owner | Differences and disposition |
|---|---|
| Lead | Generalizes the named bundler/verifier and single HTML to `build/`, package and dependency lockfiles, `dist/`, `releases/`. Adds README, scoped AGENTS, master status, `docs/runbooks/`, `docs/runs/`, explicit canonical architecture/decision stewardship and `docs/provenance/build-locks/<run_id>.json`. Assign current audit report/index/manifests under `docs/preflight/agent-run-*/` to Lead. Historical locks, designs and manifests stay frozen. |
| A1 | `core/` subsumes five named modules and retains `content/products.json`. Adds `tests/unit/core/` and exact approved-source import under `vendor/encounter-m3/<revision>/`, then frozen. Adapted code lives in `core/`. |
| A2 | `communication/` subsumes the three named modules. Retains actions/BASED data. Adds `content/dialogue.json` and `tests/unit/communication/`. A1 persists authoritative data. |
| A3 | `decisions/` subsumes choose and routines. Retains roles. Adds `content/personalities.json` and `tests/unit/decisions/`. Pure decisions only. |
| A4 | `room-bridge/` subsumes bridge and original proposed bindings path. Use one authoritative data location `scene-bindings/` for Lab bindings. Keep translation in the bridge. Adds `tests/unit/room-bridge/` and `tests/support/room-c6/` for official stand-in, driver and wrapper. No ROOM-owned scene edits. |
| A5 | `presentation/` subsumes the two named modules; retains portrait mappings. Adds derived `assets/characters/`, `assets/portraits/`, `tests/unit/presentation/` and dedicated `docs/provenance/assets/` for provenance. Rights and original quality remain gates. |
| A6 | `ui/` subsumes the five named paths. Adds `tests/unit/ui/` and `tests/ui/`. Scoped UI only. |
| A7 | `tests/independent/` subsumes three named paths. Adds `evidence/independent/<candidate>/` and `docs/reviews/`. Supplemental independent verification only. |
| Nova | New external author row. Sole author of real ROOM logic/thin hooks, revised frozen scene, `tests/contracts/c6_contract.test.mjs`, its approved fixtures and real driver. Separate authorization. |
| Lead, import custodian | New row. Exact-byte copying after approved delivery into `room-runtime/approved/<candidate>/`, `scenes/approved/<scene-version>/` and Nova's delivered `tests/contracts/`, plus permitted original assets/reference inputs. Content authorship remains with original producers. |

Each needed §8 file has one writer or an exact-copy custodian. No file has two writers or lacks an owner. Lead stewardship excludes A5's asset provenance and A7's review area. Keep only canonical contract and lock paths. Do not stage ignored build products or ZIPs by default. Assign any later omitted path before touching it.

## L. Milestones and stop conditions

Wave 1 is one headless nonphysical proof below integrated A. Upon separate authorization, A1–A3 can build and A7 can independently check during ROOM repair. Wave 2 needs separate scope for the official stand-in, presentation and UI, with Nova's unchanged suite before any conformance claim. Wave 3 needs accepted ROOM bytes and matching browser evidence.

ROOM Stage A covers geometry, route/spot audit, correlated results and the existing customer-human fixture. Stop for review before separately authorized Stage B for both actor cameras and stable restore. These are separate from Lab checkpoints. Lab A requires the actual relevant C6 capabilities. B is a real customer sale with failure/retry. C is references, hold/no-show/refund and return. D is clerk perspective and autonomous customer. E needs the exact offline HTML, portable saves, independent browser/native Windows proof and Teddy's same-artifact playthrough. No integrated checkpoint closed. [Build checkpoints](../../architecture/BUILD_CHECKPOINTS.md)

## M. Build tools and source-import plan

After approval, the Lead should inspect imports in a dependency-closed M3 subset exported from the pinned Git object into disposable space. Compare all approved bytes before making a traceable, local, frozen import; adaptation lives in versioned Lab modules. Later public code or asset imports require rights review. Proposed first tests use the built-in Node runner, for example `node --test tests/unit/core/*.test.mjs`, analogous communication/decision tests and selected `tests/independent/` tests once those files exist. Producer documentation expects Node 24.x and Python 3.12.x. Phase 0 observed Node 26 and did not check the later Lab slice on its supported runner or install dependencies.

Later Lead will specify a deterministic bundle command under `build/` after scope. Produce one standalone `First_Encounter_Lab.html` with original-quality permitted assets, portable save samples and separate evidence. Dev tools can build it. Play requires no helper, installation, internet/CDN or live model. Exclude the test driver and stand-in. ROOM delivery remains a path-preserving overlay and reproducible assembly, with original, changed, scene and built-page hashes. A playable delivery does not exist today.

## N. README and resumption plan

[README](../../../README.md) now opens with machine-readable authority and availability, reviewed source SHA, source/evidence status table, reading path, current blockers, run availability, team and resume order. It separates prior producer checks from absent real C6, stand-in, browser and Windows proof. [AGENTS](../../../AGENTS.md) directs fresh/resumed agents to read it first. Lead updates it after approval, checkpoints, accepted handoffs, material blockers, interruption or stop. Specialists send evidence and A7 flags stale claims. Resume by checking current Git and manifests, owner authorization and gate status. README does not grant authority.

## O. Acceptance coverage

The [acceptance matrix](../../testing/ACCEPTANCE_MATRIX.md) retains all original T1–T17 and B01–B26 wordings and NOT RUN status. Approved C6 §13 retains C6-01–35 exactly.

| Group | Future fixture, owner and environment |
|---|---|
| T1–T8 and B03–B07 | A1–A3 component and A7 headless checks for controller parity, scoped deterministic output, actual explanations, cue/knowledge invariance, exact assent and both-controller two-Counter cap. T2 uses amended scores. A6/A7 prove actual composer behavior later. |
| T9–T10, T12, T14–T17, B08–B13 and B21–B22 | A1/A2/A3 known-event fixtures for unique split settlement, failure/retry, refund/release, due/catch-up, causal deduplication and replay. A6/A7 independently verify inert inspector, known-fact menu and stable/invalid save behavior. Only appropriate subsets fit Wave 1. |
| T11, T13 and B14–B20 | A4/A5/A6 component checks and A7 integrated evidence on pinned real scene, camera, pose, legacy bodies, faces and autonomous routine. |
| B01–B02 and B23–B26 | Lead/A7 integrity and regression, reproducible rebuild, actual offline browser and native Windows downstream execution and both run walkthroughs. Teddy's exact-artifact acceptance is separate. |
| C6-01–35 | Nova's common suite via both prescribed fixture adapters, plus A7 supplements and actual browser proof. NB only 01, 02, 06, 16–18, 27, 30, 32–33. BR only 22, 23, 28. 15 NB with BR spot check. 13 conditional NB+BR. All others NB+BR. Stage B adds both camera/restore proofs and relevant Stage A reruns. |

`STANDIN_CONTRACT_PASS`, `REAL_LOGIC_CONTRACT_PASS`, `REAL_BROWSER_PASS` and `WINDOWS_DELIVERY_PASS` are distinct. None applies. C6-33 requires the exact same complete applicable suite against both implementations. Windows delivery uses the exact hashed HTML with external requests blocked and portable save round-trip.

## P. Blockers and requested decisions

- **Independent slice:** Teddy's separate scope, a named supported test runner and reviewed dependency-closed local import. Compound hold encoding can be deferred from this slice.
- **Physical implementation:** Separate Nova authorization, a common ruling for the C6 wire cases, full edge/spot audit and immutable staged candidate and suite. Claude must supply the matched unchanged browser baseline and each relevant repaired-candidate check. A4 needs scope for the official stand-in and the identical suite for proof.
- **Final acceptance:** Exact runnable Lab HTML, rights, offline/browser and native Windows evidence and Teddy's playthrough.
- **Later compound hold:** Review a visible linked shape or named supported template before implementing the compound expression. G07 economics, no-show and scoring remain approved.

Other gaps are expected implementation work. [Remaining gates](../../decisions/OPEN_APPROVALS.md)

## Q. Preservation and documentation audit

The initial Lab worktree was clean at `bbed22c`. Only Phase 0 documentation is in scope. The C1–C8 overview changes only C6. Both registered inputs retain exact bytes. Historical source lock, preflight, selected designs and old checksum records remain unchanged. Earlier manifests retain their baseline scope. [Current documentary checksums](PREFLIGHT_DOCUMENT_MANIFEST.sha256) exclude the manifest itself, and [report checksum](PREFLIGHT_REPORT.sha256) holds the report fingerprint outside the report. Commit/push verification belongs in the delivery handoff outside this snapshot. All three agents completed. No behavioral test, stand-in, repair or gameplay process started.

## R. Proposed next authorization — NOT EXECUTED

**Draft for Teddy and Nova.** Prove one headless known-item Pay-for-Give exchange. A1 builds two persistent actors, one authoritative ledger and a versioned save boundary. A2 composes one supported exact offer and scoped assent. A3 chooses deterministically with a true reason from actor-scoped inputs. A7 verifies both-controller parity, scoped facts, repeat/reload, one injected handover failure after payment, retry and no double charge. Use legitimate domain-fixture observations at the Encounter boundary. No fabricated ROOM events, stand-in, movement, art, UI or compound-hold compiler. G07 scores may be tested as pure fixtures.

```text
AUTHORIZE_FIRST_ENCOUNTER_LAB_SCOPED_BUILD
Pre-flight run ID: 2026-11-15-c6-v2
Pre-flight SHA-256: exact digest in the sibling PREFLIGHT_REPORT.sha256
Reviewed Lab source baseline: bbed22c4bf4bdad453f7d698a80a36f869320980
Registration revision: verify the Phase 0 documentation commit in the delivery handoff
Approved C6: room-c6@0.1 / 55c8094417ead764421825aa19706d26137c456bbb9f2484f40c7d2d47d7afd2
Proposed input inventory SHA-256: 3309f7b99539e15c85ec7e2b1c7b0234f37520d771fcefe6346d5c2a9365253c
Source lock: preserve SOURCE_LOCK.json; pin approved later inputs in a separate per-run build record
Scope: independent M3-derived state, language, decisions and supplemental independent verification
Lead: README, scoped AGENTS, docs/runs/, docs/provenance/build-locks/<run_id>.json
A1: core/, content/products.json, tests/unit/core/, approved local vendor/encounter-m3/<M3 revision>/
A2: communication/, content/actions.json, content/based-cues.json, tests/unit/communication/
A3: decisions/, content/roles.json, content/personalities.json, tests/unit/decisions/
A7: tests/independent/, evidence/independent/<candidate>/, docs/reviews/
Maximum checkpoint: one headless exchange before integrated Lab A
Shared C6 suite: pending from Nova; no conformance claim
Real ROOM candidate: none; Claude baseline unavailable
ROOM source changes by Codex: NOT AUTHORIZED
Publication scope: reviewed documentation only; later code/art/release publication needs explicit scope
Stop for review at: headless exchange evidence
```

**PREFLIGHT DELIVERED — README UPDATED — IMPLEMENTATION NOT STARTED — AWAITING TEDDY/NOVA REVIEW.**
