# ROOM C6 — Step 1: Read-Only Code and Test Inspection

**Date:** 14 November 2026, America/New_York (15 November UTC)  
**Status:** STEP 1 ONLY — for owner review; **no C6 contract has been written, and no repair is authorized or begun.**  
**Sources inspected:** owner-supplied original `Room_Creator_v0_2_COMBAT_ROOM_v0_1_1.zip` and `First_Encounter_Lab_Claude_Checkpoint_2026-11-14.zip` (its `1_room_creator_changes/` overlay). Other prior reports were considered background, but the findings below were checked against the actual archived source and tests.

## 0. Executive finding

**The needed building blocks largely exist. The finished C6 connection does not.** Room Creator already contains an authored movement graph, ordinary-NPC walking lanes, and a more complete geometry-aware walking grid with A* pathfinding. However, these are used by different features. Claude's Lab actor controller adds useful commands for bodies and gestures but routes those bodies in straight lines without enforcing those existing physical rules.

**Recommended C6 movement language:** use **`project.routeNet.vertices[]` / `project.routeNet.edges[]`** as the *one named, authored movement network* for the Lab's human and rule-driven characters. Keep `routeNet.nodes[]` for named interaction spots. Use ROOM's existing floor/wall/grid data to validate physical passage. **Do not** turn editor camera rails into the Lab's movement network, and **do not** convert every legacy street NPC lane as part of this Lab repair. This is consistent with the existing `ROOM_ENCOUNTER_MOVEMENT_CONTRACT_v0_1.md`, which calls out the authored movement graph explicitly.

The seven audit answers are below. “Repair size” refers to a **bounded two-character Lab solution**, not a citywide rewrite.

| # | Question | Source-backed status | Recommended repair size | Main reason |
|---|---|---|---|---|
| 1 | Movement networks and who uses them | **EXISTS** (the shared-use connection is only partial) | **MEDIUM** for Lab; **LARGE** for universal merger | Three separate navigation mechanisms are already present but actors do not all use one. |
| 2 | Walls, furniture, between-story checks | **PARTLY EXISTS** | **MEDIUM** | Grid checks furniture; general route checker does not; directed actors do not check either. |
| 3 | Stopping overlap at a character's spot | **PARTLY EXISTS** | **MEDIUM** | Player collision exists, but Claude's actor movement/placement bypasses it. |
| 4 | Named arrival/exit spots and event detection | **PARTLY EXISTS** | **MEDIUM** | The spots and player occupancy tracking exist; reliable entered/left events and an interior threshold marker do not. |
| 5 | Closing a door while a walk is active | **PARTLY EXISTS** | **MEDIUM** for safe commanded-walker response | The player can open/close nearby doors in Route Walk; no safe completed/blocked response for a moving directed actor is implemented. |
| 6 | First-person camera and clerk start | **PARTLY EXISTS** | **MEDIUM** for two actors | The camera follows a special Route Walk player record, not the controlled NPC's persistent body. Clerk starting position is data only. |
| 7 | Claude's commands and hooks | **PARTLY EXISTS** | **MEDIUM** | Actor/pose control works as a prototype; path validation, request/result IDs, timeouts, persistence and player events are missing. |

**Separate LARGE decisions are in section 9.** They should not be included in this repair by accident.

---

## 1. Movement systems — **EXISTS**; Lab integration **MEDIUM**

I found the following distinct mechanisms:

**A. The authored Movement Network (`routeNet.vertices` and `routeNet.edges`).** `source/ui-route.js` builds this graph (`rwBuildGraph`, lines 54–59). In first-person Route Walk, the special player walks along this graph, with small sideways movement allowed by each edge's authored width. It supports both “legacy” and Encounter-style controls (`rwMoveAlongLegacy` and `rwMoveAlongEncounter`, lines 91–142; `rwPlayerStep`, lines 385–404). The player in the **Combat Room** also uses this Route Walk player machinery.

**B. Ordinary NPC walking lanes (`routeNet.lanes`).** `rwLane` / `rwLanePose` in `source/ui-route.js` (around lines 186–190) define paths for background street actors. Their standard walking and passing rules appear in `rwNpcStep` (around lines 221–275). This is **not** the same graph-following logic as the player.

**C. The 0.2-metre walking grid and A* pathfinding.** `source/rails.js` (lines 1–4, 18–87 and 87–145) builds per-story cells that account for walkable floors, walls, door state, pillars, blocking objects and 3D props; `findPath` connects stories by authored stairs. It is currently used for **camera rails** and the editor's free-camera walking and click-to-glide (`source/ui-fp.js`, lines 44–84 and 117–130). It is not the combat player's route controller or Claude's Lab NPC controller.

**D. Combat bots and Claude's directed Lab actors.** Combat bots (`source/ui-combat.js`, around lines 134–146 and 191–205) walk toward assigned points with `rwStepToward`; they do not run the grid A* on each trip. Claude's new `source/ui-lab.js` does something similar, following the points it was supplied (lines 64–89).

The older **`ROOM_ENCOUNTER_MOVEMENT_CONTRACT_v0_1.md`** in the original archive says the intended shared authored graph is `routeNet.vertices/edges`; **`project.rails` is not that graph**, and legacy NPC lanes should remain for compatibility (sections 1–3). It describes runtime path planning and occupancy arbitration as Encounter responsibilities. That older document is explicitly labeled **pre-implementation**, not proof the shared runtime already exists.

**Recommendation and reason:** C6 should expose the single named `routeNet` movement graph for **the two Lab actors** and reuse existing ROOM geometry checks. Let existing street NPC lanes and camera rails stay as they are. A project-wide merger of all legacy movement modes would be **LARGE** and is unnecessary for the store test.

## 2. Walking into furniture, walls and other stories — **PARTLY EXISTS**; repair **MEDIUM**

- `source/core.js:759–774` (`routeCheck`) checks floor boundaries and solid walls; it also refuses closed doors on the line. It does **not** check pillar boxes or furniture. It returns `ok:true` immediately for endpoints on different stories without confirming a stair connection.
- `source/ui-movement.js` (around lines 67–70) **warns** when an authored movement edge crosses a bad floor/wall segment. Those warnings are useful, but do not themselves stop a runtime actor on an invalid route.
- `source/rails.js`'s walking grid **does** mark the store's counter and shelves as blocked cells, and its A* pathfinder routes around them when asked. The editor free-camera also checks those grid cells.
- The Route Walk **player** follows authored graph edges and checks door gates on edge transitions, with a nearby-NPC/3D-prop collision function (`source/ui-route.js:385–406`). It does not grid-check every step against pillar furniture.
- Ordinary NPCs have lane-relative crowd avoidance, but `rwStepToward` is a direct straight-step helper without wall/grid/furniture checks. Combat bots and Claude's directed actors reuse that helper.

**Read-only executable probe against Claude's store project:** from `N_customer` toward `N_cashier` (across the low counter), `C.routeCheck` returns **`ok:true`**. The **same** two locations given to `RCRails.findPath` produce a path **around** the counter; the counter's central grid cell is blocked. Asking `C.routeCheck` to go directly to story 1 in this one-story store also returns **`ok:true`**. These are tests of the existing functions, not repairs.

**Recommendation and reason:** enforce graph-constrained movement plus geometry validation at the physical-execution boundary. Reuse the existing grid as a validation or path-safety aid, **not** as a competing free-walking system that bypasses authored rails. Reject unsupported story changes explicitly. Avoid a new physics engine. Keep the general route checker and its historical callers' behavior under regression scrutiny.

## 3. Standing on another character — **PARTLY EXISTS**; repair **MEDIUM**

In `source/ui-route.js:405–406`, `rwPlayerBlocked` prevents an ordinary player movement step from ending within roughly 0.52 m of a visible, standing NPC. It also checks blocking 3D props and occupied named nodes. `rwStep` (lines 493–494) maintains the player's `node.occ = 'player'` while the player remains within a node radius.

Ordinary NPC walkers can slow or sidestep some other actors (`rwNpcStep`, approximately lines 240–254), and nodes have `occ` and `res` bookkeeping. **However**, these protections are not symmetrical or universal. Claude's `lbPlace` and `lbWalk` do not test dynamic actor occupancy, and a directed NPC can be commanded into the player's space.

**Recommendation and reason:** C6 needs a single physical stop/occupied result for both the human and the directed Lab actor. Keep the distinction between **physical overlap** and **who has permission or a reservation** to use a station. The older ROOM/Encounter movement document puts *runtime occupancy arbitration* on Encounter, so this boundary must be explicitly reconciled in Step 2 rather than silently reassigned.

## 4. Entering and leaving a named spot — **PARTLY EXISTS**; repair **MEDIUM**

Claude's store has the existing `routeNet.nodes[]` IDs `N_arrival`, `N_store_door`, `N_cashier`, `N_customer`, and four shelf-browsing points. The route graph also has the inside vertex `v_in` and the doorway threshold vertex `v_door_thr`. Claude's `lbSpots()` exposes the named node locations (`source/ui-lab.js:101–109`).

The original player update notices when the player enters a node radius and clears its `occ` when the player moves away (`source/ui-route.js:493–494`). **It does not emit unique, durable `enteredSpot` or `leftSpot` messages.** Claude's event stream only records directed-actor gesture and arrival events; it does not record a human player's named-spot transitions.

Crucially, **`N_store_door` is an approach point outside/at the doorway**. Reaching it is not proof that the player crossed into the store. `v_in` is an authored graph vertex, **not a named interaction spot** under the proposed “only named spots” rule.

**Recommendation and reason:** emit exactly one enter and one leave event per physical spot-occupancy transition for each actor, with event IDs and a stable session identity. Before declaring “entered store,” **author a distinct named inside marker** in the future approved scene (or explicitly choose another existing named inside spot and accept delayed detection). Do not guess that approaching the door means the player entered. No edits now.

## 5. Closing a door during walking — **PARTLY EXISTS**; repair **MEDIUM** for directed movement

In `source/ui-route.js:413–425`, the Route Walk player's `E` key toggles a nearby authored door while the walking session runs. The code refuses to close the door **if the player is currently on that door's linked edge**. `rwEdgeBlock` (line 73) blocks an attempted transition across a closed/gated edge.

That means door opening/closing is a **real existing feature**, not something to invent solely for a test. But Claude's `lbWalk` does not check a door after accepting a path; it can continue along its straight points even if a door closes, and the close check does not account for another NPC occupying the threshold.

**Recommendation and reason:** retain a **bounded existing-door gate test** (door closed before crossing; and closure/interruption during a commanded approach where already supported), but do not build a new general-purpose door-state machine. Clearly report if moving-actor door interruption cannot be supported without a larger change. The user's “drop the test if doors cannot close” condition does **not** apply outright: Route Walk can already toggle doors.

## 6. Camera, player's body and clerk start — **PARTLY EXISTS**; repair **MEDIUM**

`rwPlayerPos` and `rwCam` (`source/ui-route.js:61–67,176`) derive the first-person camera position from the special `RW.pl` record. `routeWalkView` (lines 655–657) produces the first-person viewpoint from that record. `rwStart` (lines 659–678) chooses a start edge from `routeNet.settings.start`, which Claude's scene sets to the **customer-side** route.

Claude's scene contains `routeNet.lab.playerStarts.clerk = {edge:'e_staff', s:2.7, dir:1}`, but **this is data only**; the original startup does not read it. The clerk simultaneously exists as a separate `RW.npcs` body with a `lab` block. No current operation says “camera follows this persistent actor, who is now exclusively human-driven.” No test proves the clerk-controlled start.

**Recommendation and reason:** for the first store, explicitly bind the human controller to **one of the two existing Encounter actor identities**, place the first-person camera at the corresponding authored start, and suppress any duplicate visible body representing that same person. Returning control to the NPC should preserve the actor's physical and gameplay identity. No need to rebuild all ROOM cameras; implement and test this narrow two-character binding.

## 7. Claude's hooks and commands — **PARTLY EXISTS**; repair **MEDIUM**

**Useful to preserve as candidate concepts / art-support code:** `actors`, `spots`, `face`, `gesture`, `release`, `idle`, `show/hide`, named poses, true left-facing frames, animation stepping, and source-quality mannequin packs. These are mostly independent from Encounter's gameplay logic. The hooks for actor-specific step/pose and start/stop are understandable points of integration.

**Not safe to accept unchanged:**

- `walk` (`lbWalk`, lines 86–89) accepts points without checking authored topology, walls, furniture, story or occupancy.
- `place` (lines 78–79) directly changes location; useful for setup/restore but not gameplay movement; no occupancy or location validation.
- `events` (lines 21–22,115–116) stores only the most recent 500 events, silently drops earlier ones and starts numbering from zero on each new walk. Its `arrived` event has no originating movement-request ID or session identifier.
- No reliable cancelled/blocked/timed-out movement terminal result, no movement duration limit, no duplicate-result protection and no player-driven spot events.
- `rwCharCards` and other picture-selection changes affect the shared renderer, so compatibility with older character packs must be proven rather than assumed.

**Recommendation and reason:** keep Claude's low-level character/gesture art and reusable command intentions. Replace or harden **only** the physical-command validation and result reporting in a separate, versioned ROOM candidate, followed by legacy regression tests. Never turn this add-on into an economy or NPC-decision engine.

---

## 8. Test execution and evidence

**Original archive:** SHA-256 `ba6c18be7daedeadfad80845ad627070ff72c7a9a1cfab0fb5564c437d9c870b`  
**Claude checkpoint:** SHA-256 `1fb3644ec2785c96fd866a44003fb1b7a3c73460016b564f10631bdd96b65237`

Tests ran in **two disposable extracted copies**. No source code or test scripts were edited. Some tests created or updated their normal generated result files **inside the disposable copies**. The submitted archives and original source bytes were not touched. After testing, all 47 original `source/` files matched the original ZIP; all four checkpoint-overlay `source/` files matched their archived versions.

### 8.1 Non-browser suites: fresh results

| Test | Original Combat Room v0.1.1 | Claude overlay | Standing |
|---|---|---|---|
| Every top-level `tests/*.test.js` suite | **42/42 passed; 813 `PASS` lines** | **43/43 passed; 831 `PASS` lines** (18 additional Lab scene assertions) | **RAN; PASS** |
| `tests/block_layout.test.js` (included above) | **7/7, about 40.95 seconds** | **7/7, about 42.20 seconds** | **RAN; PASS** |
| `tests/asset_intake_test.py` | **23/23** | **23/23** | **RAN; PASS** |
| `tests/vehicle_graph_examples_diff.js` | **7 named recipes preserved apart from intended graph addition** | Same | **RAN; PASS** |

**Timed-out test investigated.** The historical pre-flight reported a timeout in `block_layout.test.js`. With a 95-second allowance, the unchanged test completed in around **41–42 seconds** on both copies, with all seven assertions passing. It generates and verifies **5,780** building recipes. A shorter runner timeout or machine/load differences can explain the pre-flight timeout; no source-level infinite loop was observed here. This does **not** certify the run will meet a tighter build time budget elsewhere. Another relatively slow suite was `vehicle_world_v2_5_two_block_transit.test.js` (~24 seconds each), also passed.

Other helper scripts such as `run_city_foundation_regression.py`, `run_transport_foundation_regression.py`, `run_polish_asset_regression.py`, and `run_v252_node_regression.py` are **not independently counted as passed**: they mostly rerun the same `tests/*.test.js` suites with alternate orchestration and write another evidence summary. They were not executed as separate commands. The specialized browser-regression orchestrators are blocked as described below.

### 8.2 Browser tests: attempted, not verified

**Environment:** Playwright Python and system Chromium were present. The Playwright-managed browser executable was missing, so a path pointing to the installed Chromium was supplied in the **temporary test environment**; no Room Creator test scripts or source files were changed. Chromium launched, but every attempt to navigate a local `file://` page stopped immediately with **`net::ERR_BLOCKED_BY_ADMINISTRATOR`**. This was reproduced for the original and overlay and also for a simple browser navigation outside ROOM. It is an **execution-environment restriction**, not a completed Lab test and not evidence of a gameplay regression. No browser assertion was reached.

| Source | Browser script attempted unchanged | Result |
|---|---|---|
| Original | `tests/combat/combat_playtest.py` | Browser navigation blocked before test assertions |
| Original | `tests/route/route_smoke.py` | Same |
| Original | `tests/route/route_keys.py` | Same |
| Original | `tests/route/characters_smoke.py` | Same |
| Overlay | The same four scripts | Same |
| Overlay | `tests/lab/lab_play_page.py` | Same |
| Overlay | `tests/lab/lab_store_playtest.py` | Same |

**Browser pass count this session: 0.** Claude's previously reported 36/36 Lab browser checks, 7/7 play-page checks and 24/24 combat browser checks are **historical author results, not independently reproduced here**. The other browser scripts were **not run**, rather than counted as passed or as gameplay failures. Their complete names and standing are listed in Appendix A.

**Independent browser checker requirements:** A separate environment with Python 3, the Python Playwright package, a functional Playwright-compatible Chromium/Chrome browser that permits local `file://` navigation, the two exact archives, and the relevant original test scripts. No external furniture library is required for the boxed Lab tests. Older asset-library browser suites need that separate library, and some historical pre-0.13 suites have known stale selectors. A successful independent checker must report exact binary/browser versions, the source hash, each script's exit status, and the assertions—not merely screenshots.

---

## 9. LARGE separate decisions for the owner

### L1 — Should C6 merge every legacy movement system? **LARGE**

A full project-wide conversion of player graph travel, background NPC lanes, Combat bots and editor camera rails to one movement implementation is **large** and risky. Existing games and old scenes rely on different behavior, and those systems have different jobs.

**Recommendation:** **Do not authorize that conversion for C6 v0.1.** Use the shared `routeNet.vertices/edges` graph only for the Lab's two directed characters. Preserve legacy lanes and camera rails untouched. We can investigate a wider retrofit separately after the store is working.

### L2 — Who plans routes and arbitrates occupancy? **Potentially LARGE architecture conflict**

The original `ROOM_ENCOUNTER_MOVEMENT_CONTRACT_v0_1.md` says ROOM authors the movement graph and physical blockers while **Encounter owns runtime path planning, occupancy and traffic arbitration**. The newer proposed Lab C6 boundary expects ROOM to **check physical geometry and report whether a movement/occupied station is possible**. These views can coexist, but only if responsibilities are written precisely.

**Recommendation for Step 2 approval:** Encounter chooses the destination and may plan the route **on ROOM's one shared graph**; ROOM validates the physical route/execution and reports factual positions, contact/obstruction and terminal outcomes. Encounter owns the lasting meaning of spot use, access/permission, reservation, recovery and NPC choices. A physical collision guard in ROOM must not create a second social reservation ledger. **Do not silently replace the old agreement or write a citywide pathfinder during this Lab pass.**

### L3 — Arbitrary character possession across the whole city? **LARGE if generalized now**

Binding one player camera to either of two store actors is a manageable Lab task. A general system for transferring control among any character, vehicle, interior or moving transit platform would be a much larger project.

**Recommendation:** restrict C6 v0.1 to the two specified store actors, but keep actor identities and camera bindings general in the data model. Generalize only after the two-role proof works.

---

## 10. Recommended decisions to carry into Step 2 (for owner review)

1. **Name one authored movement network:** `project.routeNet.vertices[]/edges[]`, with `routeNet.nodes[]` for interaction spots. Keep the grid as a physical validation aid and the existing lanes/rails for compatibility.
2. **For C6, check before and during movement:** static geometry, story legality, authored graph connections, dynamic actor collision, and the final arrival/blocked/interrupted result. Never infer success merely from accepted input.
3. **Report both input types:** rule-driven commanded movement with originating request IDs, and player-driven named-spot transition events without fake per-key commands.
4. **Do not mistake `N_store_door` for crossing the threshold.** The future versioned store needs an explicit inside named spot or an owner-approved alternative.
5. **Keep existing door interactions; do not invent a new door engine.** Specify a narrow blocked-door test for directed actors.
6. **Support a two-role camera/actor binding**, with only one physical actor per identity and one input owner at a time.
7. **Retain Claude's art/control groundwork** but treat `walk`, `place` and `events` as incomplete until physical validation, timeouts, stable correlation, and reliable restoration exist.
8. **Resolve L1–L3 explicitly** before freezing the C6 contract, especially the Encounter-versus-ROOM planning/occupancy boundary.
9. **Independent verification is necessary:** original Node tests are green here, but browser suites remain unverified in this environment and must run elsewhere before accepting a repaired candidate.

**STOP: Step 1 report delivered. Do not write `ROOM_C6_PHYSICAL_CONTROL_CONTRACT_v0_1.md`, modify ROOM, authorize a repair, or start the Codex gameplay build until the owner reviews and explicitly authorizes Step 2.**

---

## Appendix A. Complete inventory of browser-dependent scripts not verified this session

The original archive contains **52 Python files that import Playwright** and **4 browser-dependent `.cjs` files**. Claude’s overlay adds two Lab-specific Python browser tests. Some entries below are screenshots/diagnostics or test runners rather than assertion suites; they are still listed to avoid implying coverage. None is counted as passed here.

**Original archive (`Room_Creator.html`):**

| Browser-dependent file | Status | Reason |
|---|---|---|
| `tests/architecture_extensions_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/assets_all_models.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required; external asset library may also be needed |
| `tests/assets_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required; external asset library may also be needed |
| `tests/assets_demo_checks.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required; external asset library may also be needed |
| `tests/assets_perf.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required; external asset library may also be needed |
| `tests/assets_vehicle_fronts.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required; external asset library may also be needed |
| `tests/browser_acceptance.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/city_structure_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/combat/balance_probe.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/combat/combat_playtest.py` | **NOT VERIFIED** | Attempted unchanged; Chromium rejected local `file://` navigation before assertions |
| `tests/combat/look_room.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/combat/pose_shots.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/construction_v10_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/demo_screens.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required; external asset library may also be needed |
| `tests/door_approach_preview_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/encounter_movement_preview_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/finish_asset_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/library_parts.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required; external asset library may also be needed |
| `tests/make_asset_demo.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required; external asset library may also be needed |
| `tests/movement_network_editor_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/movement_network_r2_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/movement_network_r3_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/movement_network_r4_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/multistory_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/parked_vehicle_authoring_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/polish_entrypoints_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/polish_v02_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/r4_artifact_capture.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/route/characters_smoke.py` | **NOT VERIFIED** | Attempted unchanged; Chromium rejected local `file://` navigation before assertions |
| `tests/route/characters_walk.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/route/route_eval.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/route/route_keys.py` | **NOT VERIFIED** | Attempted unchanged; Chromium rejected local `file://` navigation before assertions |
| `tests/route/route_perf.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/route/route_smoke.py` | **NOT VERIFIED** | Attempted unchanged; Chromium rejected local `file://` navigation before assertions |
| `tests/route/vehicle_ai_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/shared_matte_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/single_exit_preview_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/style_openings_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/transport_combined_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/transport_infrastructure_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/v06_materials_smoke.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_baseline_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_loop_track_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_traffic_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_world_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_world_v2_4_1_legibility_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_world_v2_4_browser_smoke.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_world_v2_5_2_transit_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_world_v2_5_3_transit_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_world_v2_5_4_transit_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_world_v2_5_transit_browser.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/vehicle_world_v2_browser_smoke.py` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/story_floor_ux.cjs` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/v0_11_1_story_floor_browser.cjs` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/v0_11_2_floor_placement_browser.cjs` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |
| `tests/v0_12_stories_rooms_browser.cjs` | **NOT VERIFIED** | Not attempted: common browser navigation restriction already established; an independent environment is required |

**Claude overlay:** The same 56 original browser-dependent files also remain unverified in the overlay. Four were attempted under the overlay and rejected before assertions: `combat/combat_playtest.py`, `route/route_smoke.py`, `route/route_keys.py`, `route/characters_smoke.py`. The two additional overlay scripts were also attempted and blocked: `tests/lab/lab_play_page.py` and `tests/lab/lab_store_playtest.py`. The remaining original browser scripts in the overlay were not attempted, for the same demonstrated environment restriction.

**Test runner scripts not executed separately:** `tests/run_city_foundation_regression.py`, `tests/run_polish_asset_regression.py`, `tests/run_polish_browser_regression.py`, `tests/run_polish_v02_browser_regression.py`, `tests/run_polish_v02_regression.py`, `tests/run_transport_browser_regression.py`, `tests/run_transport_foundation_regression.py`, `tests/run_v252_node_regression.py`, `tests/run_v253_node_regression.py`, `tests/run_v254_node_regression.py`, and `tests/verify_polish_v02_build.py`. The non-browser wrappers chiefly rerun the top-level Node suites already executed; browser wrappers cannot certify their dependent scripts here. No claim of a passed wrapper is made.
