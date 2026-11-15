# ROOM C6 — Physical-Control Contract v0.1

**Status: REVISED PROPOSAL FOR TEDDY'S REVIEW — DOCUMENTATION ONLY.**  
**Basis:** Accepted [ROOM C6 Step 1 Read-Only Inspection Report](ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md); the original `ROOM_ENCOUNTER_MOVEMENT_CONTRACT_v0_1.md` found inside Combat Room v0.1.1; Claude's checkpoint; and Teddy's decisions L1–L3, Step 2 instructions, and the twelve requested pre-approval amendments.  
**Scope:** Two Lab store characters, one frozen store scene, one authored movement graph.  
**Not authorized by this document:** Editing Room Creator, repairing movement, changing the existing core checker, publishing a new runtime, starting Codex production, or approving the final implementation.  
**Ownership:** Nova/ChatGPT writes any later ROOM source repair under separate approval. Codex A4 may only consume the approved ROOM interface in the Lab-side bridge.

## Plain-language summary

**Encounter says where a character wants to go; ROOM finds a legal way there, moves the body, and reports what really happened.** When you move a character yourself with the keyboard, ROOM does not pretend those keypresses were Encounter commands: it reports when you enter or leave an *authored, named spot*. In Stage A the customer is human-controlled and the clerk is rule-driven. A separate rules-only test fixture permits commanded customer-movement tests without giving the same body two controllers. Both characters obey the same physical restrictions. Encounter decides why an action matters, what someone observed, and what they remember.

For this first store, use `routeNet.vertices` and `routeNet.edges` as the **one movement network** for the human-controlled and rule-controlled characters. Use `routeNet.nodes` as named interaction spots. The existing walking grid can **check** whether the authored network crosses obstacles, but it is not a second route network for the Lab.

**Why this approach:** Room Creator already has most of the physical machinery. A small, dependable interface is safer and more reusable than rewriting navigation or placing social logic inside ROOM.

## Owner decisions still needed

Teddy has **already decided** L1 (no movement-system merger), L2 (Lab-only ROOM path planning), and L3 (bind only the clerk and customer). The following are *future gates*, not reasons to invent new rules now:

1. **Approve or revise this complete C6 v0.1 contract.** Reason: both Nova's ROOM repair and Codex's bridge must be built against exactly the same message and result meanings.
2. **Authorize Stage A ROOM repair separately, after the contract is approved.** Reason: approving a design does not approve source modification. Stage B needs another explicit authorization after Stage A review.
3. **If the required scene audit finds an invalid route or named spot, choose how to proceed before anything is silently “fixed.”** Reason: changing the scene to pass a test could hide a physical error or break stored identities.
4. **If a mid-walk door closure needs a larger alteration, decide whether to defer it as an explicit exception.** The required closed-*before*-crossing test cannot be waived by this exception. Reason: doors already toggle, but a general door-event engine is outside v0.1.
5. **If neither Nova nor Claude can execute the required browser tests, decide whether to find a working test environment or keep the candidate on hold.** The default recommendation is **hold, not claim a pass**. A later A7 check and Teddy's Windows playthrough are separate gates.
6. **Review each stage's evidence and final candidate fingerprint.** Even a technically passing candidate is not automatically the accepted ROOM baseline or permission for the Codex game build.

The contract below chooses narrow engineering defaults (including spot-boundary tolerance and movement time limits) for this Lab. Approval of this contract approves those defaults for a candidate; an implementation may report a necessary adjustment, but it may not silently change them.

---

## 1. Authority, existing foundation, and the Lab-only exception

| Question | C6 rule for this Lab | Reason |
|---|---|---|
| Which movement map? | Only `project.routeNet.vertices[]` and `project.routeNet.edges[]`. Named spots come from `project.routeNet.nodes[]`. | One common authored physical language for both playable characters. |
| Who chooses the destination? | Encounter names a **destination spot ID** for autonomous movement. The keyboard supplies continuous steering for the human-controlled actor. | Encounter decides goals; the human remains directly in control. |
| Who plans the path? | **ROOM** finds a route on its own authored graph, validates it, and executes movement. Encounter holds no duplicate movement graph or path planner. | A small store should not require two competing map implementations. |
| Who judges physical blockage? | **ROOM** reports walls, furniture, unsupported story transitions, closed doors, physical occupancy, and whether movement or reach actually succeeded. | Physical claims must come from the physical engine. |
| Who decides access and meaning? | **Encounter** owns staff-only restrictions, permission, social/contractual station reservations, intentions, observations, inventory, ownership, and consequences. | Being physically able to enter somewhere is not the same as being allowed. |
| Which other movement systems change? | **None.** Leave `routeNet.lanes`, `project.rails`, legacy traffic, combat-bot movement, and camera-rail behaviors unchanged. | Merging them all would be a large, unnecessary project. |
| Which characters may be bound? | Only the store's `clerk` and `customer` in v0.1. Bindings use general identity fields rather than special player/NPC types. | Proves both roles without implementing citywide character possession. |

### Relationship to the older movement contract

The archived **`ROOM_ENCOUNTER_MOVEMENT_CONTRACT_v0_1.md` remains in force for the wider game**. It assigns authored physical topology to ROOM but assigns general runtime path planning/A*, occupancy arbitration, yielding, and traffic behavior to Encounter. It is also labeled **pre-implementation**; it does not prove that shared runtime behavior exists yet.

**C6 is an explicitly bounded Lab exception:** for the two store actors *only*, ROOM plans a path on its own authored `routeNet` graph and performs **physical collision/spot-occupancy checks**. Encounter still owns *social reservation and permission* and the meaning of any failure. Do **not** quietly apply this Lab exception to the wider city, or rewrite the older contract. When widening the system later, the owner must reconcile the policies deliberately.

**Important distinction:** a character standing in a doorway is a physical obstruction for ROOM to report; a clerk holding the doorway for a customer by arrangement is an Encounter rule, not a second occupancy ledger inside ROOM.

## 2. Reuse first; protect existing code

The accepted Step 1 inspection found:

- `source/ui-route.js`: first-person Route Walk player already traverses `routeNet.vertices/edges`; the Combat Room player uses that machinery. Named node occupancy is partly tracked; old player collision checks exist.
- `source/rails.js`: a 0.2 m walking grid and pathfinding already understand floors, walls, doors, pillars and blocking props. **Use it only as a geometric checking aid** for the Lab graph, not as a replacement graph.
- `source/ui-route.js`: ordinary background NPCs instead use `routeNet.lanes`. Keep that legacy system as-is.
- Claude's `source/ui-lab.js`: useful commands for `actors`, `spots`, `face`, `gesture`, `release`, `idle`, show/hide and directed actors; useful mannequin and true-side-frame work. Its current `walk`, `place`, `events` and shared renderer changes **are candidates, not safe accepted APIs**.

### Protected shared checker

**Do not edit `source/core.js` or change its shared `routeCheck` behavior for C6.** Put any additional geometry, furniture, story and dynamic-obstruction checks in a Lab-scoped validation/execution layer. Keep the existing tests that use `routeCheck` unchanged.

**Known wider ROOM defects, not fixed by C6:** `routeCheck` does not check furniture/pillar boxes along a route and can approve a direct across-story segment without a stair connection. Its validation is insufficient for new Lab runtime guarantees. These blind spots are documented for a **separate owner decision** on a general ROOM repair. Do not hide them by asserting that C6 fixed `core.js`.

**Why:** a local Lab repair must not unexpectedly change every old Room Creator scene, editor function, or vehicle/character test using the shared checker.

## 3. The one graph and the scene audit

**Movement network:** `routeNet.vertices` are places routes join, `routeNet.edges` are the legal walking connections, and `edge.band` describes the legal half-width. `routeNet.nodes` are the named interaction spots. A named spot must have a verified safe connection to the authored graph; the Lab must not treat an arbitrary coordinate as a legal destination.

**For each graph edge and every named spot, the Lab checker must verify:**

1. All IDs are unique and every reference is present. **Why:** a saved actor must not accidentally refer to another object.
2. Each vertex and spot lies on a physically valid floor and story, and each edge is connected through valid authored vertices. **Why:** a story number alone does not create stairs.
3. The full walkable band or effective body corridor is clear of solid walls, furniture, pillars, blocking props and closed/gated passages. Evaluate the *swept actor clearance*, not just the centerline or endpoints. **Why:** a valid-looking line might still clip a shelf with the character's body.
4. Any story transition follows an explicitly supported connector such as authored stairs. **Why:** a short line between stories must not teleport a walker.
5. Named spots are reachable from the graph without cutting through furniture. Mark spots that are intentionally isolated only if the owner has explicitly approved their use; an unusable required store spot is a failure. **Why:** a visible icon does not make a physical path.
6. Actual actor bodies and current occupancy are checked at movement time, not just at scene load. **Why:** someone can step into a path after it is validated.
7. The Lab scene's entry/exit route, customer area, shelf spots and staff area are connected in the expected direction, with the doorway gate affecting only the crossing edge. **Why:** a closed door must not make the outside approach impossible.
8. The named counter reach pair is legal as a handover even though a **low reachable-over counter** stands between the actors; an actual solid wall must veto reach. **Why:** checkout must work without allowing interaction through walls.
9. **The door-approach spot’s entire enter circle remains outside the store boundary, and the inside marker’s entire enter circle remains inside.** This includes the author-defined radius or the Lab fallback radius. If a circle crosses the boundary, flag the exact spot and circle in the scene audit before editing anything. **Why:** someone standing on the wrong side must never trigger a false entry or exit.

**Scene audit gate:** Run the new checks on **every authored route and every named spot** in the existing tested scene **before accepting a repair**. If any route or spot fails, stop and produce a list with ID, position, failure reason and suggested fix. **Do not rewrite the scene, relax the tests, or change the checker to make red results go green without Teddy's approval.**

### One versioned frozen store; no regeneration

The accepted input is the **specific** `examples/Lab_Store.room.json` from Claude's checkpoint, not a newly generated scene. Its Step 1 inspected bytes have SHA-256:

`b11f6f57473dd1c6e5c0facc2d7e0d1be448034ce36a80fe1161d71404e3f42f`

That value identifies the **old input**, not the future C6 scene.

In a separately authorized repair stage, **edit that tested scene file directly in a candidate copy** to add an explicitly named inside marker, tentatively `N_store_inside`, linked to the existing interior route vertex `v_in`. Record the marker's real coordinates, radius, direction association and the store boundary in the scene's Lab descriptor. Do **not** run `tools/make_lab_store.cjs` to regenerate the scene: Step 1 found that regeneration changes unrelated room/door/light IDs.

The new candidate must be labeled with a new scene version, such as `lab-store-c6@0.1`, and a **new SHA-256 computed from its actual saved bytes**. Compare that fingerprint **only during `bind` and `restore`**. The snapshot carries the bound fingerprint for later restore, but ordinary commands, queries, results and events do not repeatedly supply or rehash it. Do not invent the new hash now or silently change it on the fly.

**Proposed additional Lab metadata within the existing scene descriptor (not a new universal ROOM schema):**

```json
{
  "schema": "rc-lab-scene@0.1",
  "c6_scene_version": "lab-store-c6@0.1",
  "inside_marker_spot_id": "N_store_inside",
  "door_approach_spot_id": "N_store_door",
  "outside_arrival_spot_id": "N_arrival",
  "store_door_edge_id": "e_door",
  "reach_pairs": [
    {
      "id": "counter-handover",
      "spot_a": "N_cashier",
      "spot_b": "N_customer",
      "method": "named_spots",
      "over_low_counter": true
    }
  ]
}
```

This is **illustrative proposed metadata** inside `routeNet.lab`, not a claim it already exists. The actual frozen scene must retain all required existing Lab descriptors, actor bindings and version-11 project compatibility.

**Why:** `N_store_door` currently marks an outside/door *approach*; reaching it is not evidence of having entered the store. A distinct inside marker provides that evidence without inventing a new generic scene-transition engine.

## 4. The two kinds of walking

### A. Rule-driven character — requested move

Encounter issues a unique **request ID** and an existing **named destination spot ID**. ROOM checks the actor's binding and input owner, finds the path **itself** on `routeNet.vertices/edges`, validates geometry and occupancy, and either rejects immediately or accepts a pending move. Once accepted, ROOM ultimately produces **exactly one logical final result**:

- `completed`: reached the requested spot and its physical conditions hold;
- `blocked`: a wall, prop, closed door, occupied place or other physical condition prevented completion;
- `cancelled`: a valid explicit cancellation ended the move;
- `interrupted`: the scene or physical operating context stopped the move unexpectedly;
- `timed_out`: progress did not complete within the Lab's approved movement limits;
- `rejected`: input was invalid or the request could not start, returned **immediately**.

**A request receipt saying “accepted” is not a final result.** Once a request has a terminal result, later events or retries must return that same result rather than creating a second outcome. A new attempt must have a new request ID.

**Why:** Encounter should never conclude that a customer reached the register because ROOM merely agreed to try.

### B. Human-controlled character — continuous steering

Keyboard and mouse continue to drive the existing first-person controller along the **same authored graph**, with the same physical checks as an NPC. ROOM watches **named spots only** and emits a `spot_entered` event once on entering and a `spot_left` event once on leaving. Each event gets its **own monotonic sequence number** for the current session.

Do **not** generate a fake Encounter `move` request for each keypress or frame. Player movement never needs a fabricated movement-request number.

**Why:** direct control should feel like control, while Encounter still receives reliable physical facts about reaching a shelf or register.

### Same physical rules

Both kinds of walker must respect the same available edges and widths, solid geometry, closed-gate state, supported story connections, actor clearance and physical spot occupancy. The same underlying Lab geometry-validation functions should be callable from **non-browser tests** and from the browser runtime. A scene failure is not turned into permission merely because the player used keys instead of an NPC move request.

### Physical occupancy vs Encounter permission

ROOM must prevent **one present body from entering another present body's physical space**. This is the **only** occupancy rule: there is no special category called an “exclusive named spot.” The spot's authored standing point cannot be used by a second actor when doing so would overlap the actor already standing there. Membership in a larger spot circle is not itself a separate reservation. A player pressing forward stops at the last legal position rather than overlapping the clerk. For a rule-driven actor physically obstructed by another actor, ROOM waits for the 5,000 ms no-progress allowance and then returns `blocked`, reason `occupied` (not `timed_out`). **Why:** these outcomes have different consequences for an NPC deciding whether to wait or try something else.

An Encounter reservation (“this place is promised to someone”) does **not** count as physically occupied until a body is there; ROOM does not store that reservation or judge staff-only access. Encounter may refrain from requesting a forbidden destination, but a forbidden move is not a physical impossibility.

**Why:** collisions are physical truth; access rules and promises are social truth.

## 5. Named spot transitions, entering/leaving the store, and returning

**The contract reports transitions only for records in `routeNet.nodes[]`.** General vertices (`v_in`, `v_door_thr`) are **not** automatically interaction spots. Each actor has its own list of currently occupied named spots in ROOM's physical state.

**Proposed transition rule:** enter when the actor moves inside a spot's authored `radius` (if no radius, a Lab fallback of 0.50 m); leave only after exceeding that radius by **0.15 m**. The extra margin prevents small camera/position fluctuations from producing repeated enter/leave messages. Initial binding returns the currently occupied spot in a snapshot; it must not fabricate a “walked into this spot” event for someone who started there. Re-entering after an actual departure produces a new event ID.

When a human or NPC *truly crosses* the store door, combine the existing doorway route with the new named inside marker:

- **Approach from outside:** `N_store_door` is only an approach; it is not entry.
- **Entry completed:** `N_store_inside` is physically reached **after passing the legal door gate** in the inward direction. ROOM reports that spot event/arrival with the relevant route direction; Encounter may then record the meaningful “entered store” fact. Merely standing outside cannot produce it.
- **Exit completed:** moving outward through the door gate and reaching the existing outside-side `N_store_door` (or proceeding to `N_arrival`) provides evidence that the actor has left. The event must include physical traversal direction or corroborating route state; reaching the same door-approach spot *inward* must not count as an exit.
- **Leave for a later visit:** only after a confirmed exit may Encounter request a stable `set_presence` operation to hide/remove the non-present body. This does not change the actor's persistent identity.
- **Return:** after Encounter advances its **own** step clock, ROOM may restore/show the body at the verified outside arrival spot. Normal walking and the ordinary inside-marker event establish re-entry; no off-screen movement simulation is required.

Do not treat every departure from the *inside marker's small radius* as exiting the store. A customer walking from that marker to a shelf is still inside.

**Why:** we need evidence of an actual threshold crossing, not a location label that accidentally means two different things.

## 6. Reach and physical interaction

The general C6 question is **“Can these two physically interact now?”** In v0.1 only, answer that through **named interaction spot pairs**. Do not add full-body hand collision, arbitrary-distance interaction or a general object-grabbing engine.

A `check_reach` query is true only when both bound actors are present and each is physically at the specified compatible named spot, on the same story, with no intervening **solid wall**. One approved pair is `N_cashier` ↔ `N_customer` for a counter handover. The scene marks the low counter as **reachable over**; that low fixture alone must not make the handover fail. A real solid wall always vetoes reach even if a pair is mistakenly authored.

The named pair is a physical authoring permission for an interaction, **not** an economic permission or agreement. ROOM returns only `reachable` and a physical reason. Encounter separately determines whether anyone may or intends to give a product, whether it is held, and whether ownership changes. Gesture playback portrays the already committed action; it is not the transfer itself.

**Why:** one general question with a narrow, testable method allows checkout without building arm physics or letting characters pass goods through walls.

## 7. Doors, interruptions, and time

- **Required door test:** a door that is already closed before an actor tries to cross its linked edge must give `blocked`, reason `closed_door`. The actor can still approach the door. **Why:** this is already meaningful ROOM topology and must not be bypassed by a directed walker.
- **Optional bounded mid-walk test:** if an existing door closes while a commanded actor is approaching, the move should stop safely with `blocked` or `interrupted`. Include this test in the accepted Stage A candidate **only if it does not require a larger door-system change**. If it does, record the limitation and ask Teddy for a separate decision; do not invent a door-state machine in C6. **Why:** preserve scope while documenting a real limitation.
- **No infinite commanded walking:** a Lab move has a **30,000 ms active movement deadline** and a **5,000 ms no-progress allowance**. These measure ROOM time, never Encounter clock ticks. When no progress is caused by **another present actor physically blocking the walker or its destination**, wait through that 5,000 ms allowance, then finish with `blocked`, reason `occupied`, even if the obstacle was visible at the start. A known wall/fixture/closed-door obstruction returns `blocked` with its physical reason; it may be found before the move starts or while moving. Use `timed_out` **only** when the movement deadline is reached or progress stalls and ROOM cannot identify a known physical cause (reasons `deadline` or `no_progress`). The body stays at the last legal position. If the general deadline and the occupied-person allowance end together, the known `occupied` cause takes precedence. A genuinely longer future route requires a separately approved higher limit; the store cannot silently raise one. **Why:** an NPC must distinguish “someone is in my way” from “the movement stopped working.”
- **Pauses and shutdown:** a controlled pause does not consume active movement time. Stopping or replacing a scene must finalize an active request as `interrupted` before the old session is discarded. On resume after an unexpected stall, the watchdog must finalize or clearly surface a non-recoverable session; it may not silently restart an already completed walk. **Why:** a suspended page must not create false success or leave an unknown pending request.
- **Separate clocks:** ROOM's elapsed movement/animation time **never advances Encounter's step clock**. Encounter's time advances only by its own approved game events and explicit leave/return jumps. **Why:** a slow graphics card must not make a promise late.

Player key-driven walking has **no artificial request timeout**; each physical step remains subject to collision checking. The timeout rule applies to **commanded moves**, not to how long a human is allowed to stand still.

## 8. Actor identity, camera, body visibility, and exclusive control

Each bound actor carries its persistent Encounter ID, native ROOM actor/body ID, assigned character pack, authored starting/return spot, **starting presence** (`present:true` or `false`), and controller (`human` or `rules`). In v0.1 the valid actor identities are **`clerk` and `customer` only**. The schema itself uses general IDs for future reuse. At `bind`, a **present** actor is checked and placed at the legal named start, contributes its physical footprint, and has its starting spot membership returned in the initial state **without emitting `spot_entered`**. An **absent** actor is bound to its identity and a validated future outside return spot but has no active position, footprint, or spot membership. It cannot move, be steered, or gesture until shown. For example, **customer-controlled start:** customer present outside, clerk present behind counter. **Clerk-controlled Stage B start:** clerk present, customer may start absent and later be shown at `N_arrival` before walking in. Showing a character validates the real unoccupied arrival position. **Why:** absence is not a new character and is not the same as hiding only the first-person self-mesh.

- When the **customer** is controlled, the first-person camera starts on the verified customer-side graph location. The clerk has one autonomous physical body.
- When the **clerk** is controlled, the camera starts behind the counter on the verified staff-side graph location. The customer has one autonomous physical body.
- No actor may simultaneously receive human keyboard movement and rule-driven `move` commands; a wrong-controller request is rejected.
- Suppressing the **local first-person self-mesh** is only a rendering decision. It must not remove the actor's physical collision body or named-spot detection.
- `set_presence` **does** remove/show the actor in the active physical scene for a verified departure or return. Hiding someone mid-walk is rejected until that movement is explicitly cancelled/interrupted and recorded. Showing a body on an occupied/illegal spot is rejected.
- Switching control is a **Development Mode, stable-moment operation**, authorized by Encounter. Play Mode cannot switch. Binding changes camera/input ownership, not identity, funds, relationship, memories, or social permissions.

**Why:** the player must not become a separate third character, and there must never be two moving copies of the same clerk or customer.

### Exactly who is human during Stage A

In **Stage A's normal playable test**, **`customer` is human-controlled, present at the verified outside customer start**, using the existing first-person Route Walk camera and keyboard. **`clerk` is rule-controlled, present behind the counter.** Stage A does **not** claim that the camera can be bound to the clerk; that belongs to Stage B. Every customer key-driven entry/exit event is attributed to the persistent `customer` ID.

To test **commanded movement of `customer` in Stage A**, start a **separate reset, non-browser rules-only test fixture** with `customer.controller="rules"` (and normally `clerk.controller="rules"`). There is **no human controller in this special fixture**, so the command is legal. Use exactly the same physical tests and actor/scene identities; do not command an actor while that actor is human-controlled. For Stage A browser observation of this rules-only fixture, a static or free **test-only observer camera** may be used, clearly labeled `TEST_OBSERVER_ONLY`. It never becomes a third physical actor, never changes game events, and **must not ship** in the Lab. Stage A tests must not mislabel that observer as proof of Stage B's clerk camera.

During normal play there is **exactly one human-controlled actor** after both bindings are installed and the session is activated. During the brief two-actor initialization sequence, one binding may arrive before the other; no movement begins until the pair is validated. Only the isolated contract-test fixture may **activate** with neither actor assigned to a human. **Why:** we can test both requested and directly controlled customer movement now without pretending that the clerk's first-person camera already works.

### Which human-body commands are legal

A **human-controlled body rejects** `move` and `face` immediately with `reason:"wrong_controller"`. Its steering and facing come from the existing keyboard/mouse controller, never fake commands. It **accepts** `gesture`, `release_gesture`, and `set_idle` under the same pose and lifecycle checks used for rule-driven bodies. `cancel` is for pending **commanded** movement/commands; a held human gesture ends through `release_gesture`. `bind`, `restore`, and `set_presence` are **stable-moment administrative operations**, not ordinary player movement instructions; they may act on either body only with their specific guards. The rules-controlled body may receive `move`, `face`, `gesture`, `release_gesture`, `set_idle`, and `cancel` where applicable.

**Why:** players keep direct control, but both characters can use the same performance system without giving a program permission to steer the player's body.

**Stage B owns verified clerk/customer camera rebinding and exclusive-control behavior in both play perspectives.**

## 9. Stable saves and restore

For v0.1, **save only at stable moments:** no commanded move, cancellation, binding switch, physical handover attempt, or active transient gesture that could change physical placement. **A stable scene is still NOT ready to save if the Lab bridge has unread/unapplied physical events.** Before calling `snapshot`, the bridge polls through the current last sequence, processes each record once, then sends its `last_applied_seq` in the snapshot query. ROOM compares that cursor with its own latest event number **at the instant of the query**. If any newer event exists, return `ok:false, reason:"unread_events"` without creating a snapshot. There is no acknowledge API or event pruning. **Why:** an arrival immediately before Save must affect Encounter before the save is taken.

Encounter owns the overall save file; ROOM supplies a *read-only physical snapshot* that Encounter stores as one part of that run.

A snapshot records at least: exact scene ID and SHA-256, the session/instance identity, each actor ID and ROOM body binding, present/absent status, controller, graph location (edge/vertex and progress), story, coordinates, facing, named spot membership, and the last physical event sequence applied by the Lab bridge. **It contains no money, trust, promise, knowledge, or NPC motives.**

`restore` validates the **whole** snapshot and its frozen scene fingerprint (the second and only other time the fingerprint is checked) before adopting anything: correct frozen scene/version, known actors and stations, legal geometry, no physical overlaps, consistent controller ownership, and no unresolved movement. If any check fails, the complete restore is rejected; it must not halfway place the clerk while leaving the customer somewhere else. Restoring begins a **new event session** so old events cannot be confused with new ones. No restored event is reinterpreted as a new purchase or new arrival.

**Exact snapshot shape (read-only `query(snapshot)` data, for later `restore`):**

```json
{
  "scene_id": "lab-store-c6@0.1",
  "scene_sha256": "<64 actual lowercase hex characters>",
  "session_id": "run-0007",
  "last_applied_seq": 18,
  "actors": [
    {
      "actor_id": "customer", "body_id": "body_customer",
      "character_pack_id": "mannequin_slim_female", "controller": "human",
      "present": true, "start_spot_id": "N_arrival",
      "graph": { "vertex_id": "v_customer", "edge_id": null, "progress": 0 },
      "position": { "x": 3.35, "y": 3.05, "story": 0, "facing_deg": 0 },
      "spot_ids": ["N_customer"]
    },
    {
      "actor_id": "clerk", "body_id": "body_clerk",
      "character_pack_id": "mannequin_slim_male", "controller": "rules",
      "present": true, "start_spot_id": "N_cashier",
      "graph": { "vertex_id": "v_clerk", "edge_id": null, "progress": 0 },
      "position": { "x": 4.3, "y": 3.7, "story": 0, "facing_deg": 180 },
      "spot_ids": ["N_cashier"]
    }
  ]
}
```

The `actors` array must contain **both bound characters**. The example coordinates and graph vertex IDs are **illustrative only**; the real snapshot must contain locations actually verified in the frozen scene. An absent actor must have `position:null`, no active graph location and `spot_ids:[]`. The bridge exports this snapshot only after all events through `last_applied_seq` are actually processed.

**Restore command shape:** the standard §10.3 command envelope uses `actor_id:null`, `op:"restore"` and `args:{"physical_snapshot":<validated complete snapshot>, "new_session_id":"run-0008"}`. The fingerprint is taken from the saved `physical_snapshot`; it is not repeated in the command header. A failed restore leaves the previous session intact; a successful restore starts the new session with `seq:0` and no fabricated arrival events.

**Why:** saving stable physical positions is enough for the first store; half-completed animation persistence would create complexity without making the social test more useful.

## 10. Exact interface and message formats (C6 v0.1)

This section is **normative for the proposed contract**: a real ROOM adapter and the one official test stand-in must use the same names, required fields, status values, and semantics. Examples below use illustrative IDs and a placeholder hash; they are not evidence of a running implementation.

### 10.1 One interface, not direct access to ROOM internals

The Lab-facing API is proposed as `RCApp.ext().c6` with **three** methods:

```text
submit(commandEnvelope)  → receipt OR immediate terminal result
query(queryEnvelope)     → queryResult
poll(eventQuery)         → ordered events after the caller's sequence number
```

The non-browser logic providing geometry checks, movement state, request tracking and event sequencing must be separately callable by Node tests. The browser-side adapter should only translate current ROOM positions/controls/drawing into this interface. **Do not expose mutable `RW` / `LB` objects to the Lab.**

### 10.2 Common IDs and field rules

| Field | Exact meaning and requirement |
|---|---|
| `c6` | Always `"room-c6@0.1"` for these messages. Reject unknown major versions. |
| `scene_id` | Fixed authored ID of the frozen Lab scene (proposed `"lab-store-c6@0.1"`). |
| `scene_sha256` | Exactly 64 lowercase hexadecimal characters from the actual frozen scene. **Required only in `bind` arguments and the `restore` physical snapshot**; carried in a returned physical snapshot for later validation. Not required in ordinary command, result, query or event envelopes. |
| `session_id` | Opaque unique ID for one active ROOM session. It changes on restart/restore/branch and identifies obsolete callbacks. |
| `request_id` | Encounter-issued opaque ID, unique for any state-changing command within a session. Reusing an ID with different content is `rejected`; exact duplicate calls return the original outcome. |
| `query_id` | Caller-issued ID for a read-only inspection or reach query. Query replies refer to it; reads do not create world events. |
| `actor_id` | Persistent Encounter actor ID. v0.1 bindings allow `clerk` and `customer`. |
| `body_id` | Native physical actor ID in the frozen scene. Never use a display name as identity. |
| `spot_id` | Exact `routeNet.nodes[].id`; only an authored named spot may be an external destination. |
| `seq` / `event_id` | ROOM-issued, strictly increasing per-session event sequence; `event_id` is `session_id:seq`. No recycled IDs, event pruning or dropped events **within the session**. |
| `x`, `y`, `story`, `facing_deg` | Physical position in ROOM plan metres, integer story and normalized compass heading in degrees. These are evidence fields, not alternative paths supplied by Encounter. |
| `source` | `"commanded"` or `"player"` for physical events. Player source events have `request_id:null`. |

**Security/correctness rule:** mismatched scene fingerprints are rejected **at `bind` and `restore` only**. Every command/query/poll still checks `c6`, `scene_id`, active `session_id`, actor binding and request validity where relevant, without sending or hashing the fingerprint again. Unknown/stale sessions must never mutate the current session. **Why:** the frozen scene is validated at entry and restore; repeating its fingerprint on every message adds noise, not safety.

### 10.3 Command envelope — exactly one shape for all commands

```json
{
  "c6": "room-c6@0.1",
  "kind": "command",
  "scene_id": "lab-store-c6@0.1",
  "session_id": "run-0007",
  "request_id": "enc-0042",
  "actor_id": "customer",
  "op": "move",
  "args": { "destination_spot_id": "N_customer", "timeout_ms": 30000 }
}
```

`actor_id` may be `null` only for the session-wide `restore` command. The permitted operations and **exact `args` keys** are:

| `op` | Required `args` | Outcome and guard |
|---|---|---|
| `bind` | `body_id`, `character_pack_id`, `controller` (`human`/`rules`), `start_spot_id`, **`present` (Boolean)**, `camera_self_mesh_hidden` (Boolean), **`scene_sha256` (64-digit lowercase hex)** | Stable init/Development only. **The scene hash is checked here.** A present actor starts physically at the verified unoccupied spot; an absent actor records its validated future return spot without occupying it. No fake spot entry. Normal play requires one human; Stage A rules-only test fixture may have none. Camera rebind beyond existing customer view waits for Stage B. |
| `move` | `destination_spot_id`, `timeout_ms` (integer 1–30000 for this store by default) | **Rules-controlled, present** actor only; a human-controlled actor gets immediate `rejected/wrong_controller`. ROOM finds and checks the path; one final result. No caller-supplied waypoint list. |
| `face` | `target` object containing **exactly one** of `actor_id`, `spot_id`, or `heading_deg` | Rules-controlled actor only. Human `face` is immediately rejected as `wrong_controller`; the human uses free look. |
| `gesture` | `pose`, `mode` (`return`/`hold`/`loop`), `timeout_ms` | Play an existing art pose; finite/releasable. Does not perform a transaction or transfer. |
| `release_gesture` | `target_request_id` (the active `gesture` ID) | Release a held/looping pose. The target gesture receives its one final result. |
| `set_idle` | `pose` | Select existing resting pose only; no meaning/state effect. |
| `cancel` | `target_request_id` | Rules-controlled pending command only; ends the specified active request with `cancelled`. Human-held gestures use `release_gesture` instead. Cancelling a final request does not replace its result. |
| `set_presence` | `present` (Boolean), `spot_id` (named outside return spot when showing; `null` when hiding) | **Administrative**, stable exit/return only. Showing validates the outside arrival spot, body clearance and occupancy; hiding requires a finalized previous move and verified exit. An absent actor does not occupy any spot. Self-mesh hiding is separate. |
| `restore` | `physical_snapshot` (including the saved scene fingerprint), `new_session_id` | **Administrative** stable session boundary; **the scene hash is checked here**. All-or-nothing validation. New event session, no invented arrival event. |

**Initial binding example (the only ordinary command that supplies a scene fingerprint):**

```json
{
  "c6": "room-c6@0.1", "kind": "command",
  "scene_id": "lab-store-c6@0.1", "session_id": "run-0007",
  "request_id": "enc-bind-001", "actor_id": "customer", "op": "bind",
  "args": {
    "body_id": "body_customer", "character_pack_id": "mannequin_slim_female",
    "controller": "human", "start_spot_id": "N_arrival", "present": true,
    "camera_self_mesh_hidden": true,
    "scene_sha256": "<64 actual lowercase hex characters>"
  }
}
```

For an **absent customer**, use the same bind shape with `controller:"rules"`, `present:false` and `start_spot_id:"N_arrival"`. The start spot is then a **planned return location**, not a physical placement. The `<...>` string above is a documentation placeholder only; an actual bind must supply the fingerprint of the frozen scene.

**No `place(x,y)`, `walk(points)`, unrestricted teleport, or arbitrary graph import is exposed for normal Lab play.** Any developer initial placement must pass the same `bind`/restore validation. Only ROOM reads the graph.

### 10.4 Request receipt and terminal result

For an asynchronously starting operation, `submit()` returns a **non-final receipt**:

```json
{
  "c6": "room-c6@0.1", "kind": "receipt", "session_id": "run-0007",
  "scene_id": "lab-store-c6@0.1",
  "request_id": "enc-0042", "op": "move", "actor_id": "customer",
  "status": "accepted", "final": false
}
```

A final result is **exactly one of** `completed`, `blocked`, `cancelled`, `interrupted`, `timed_out`, or `rejected`:

```json
{
  "c6": "room-c6@0.1", "kind": "result", "session_id": "run-0007",
  "scene_id": "lab-store-c6@0.1",
  "request_id": "enc-0042",
  "actor_id": "customer", "op": "move", "final": true,
  "status": "completed", "reason": null,
  "result_id": "run-0007/enc-0042/final",
  "final_state": {
    "spot_id": "N_customer", "edge_id": "e_counter",
    "x": 3.35, "y": 3.05, "story": 0, "facing_deg": 0, "present": true
  }
}
```

The fingerprint appears only at binding and in the saved/restore snapshot. When used there, it must be the actual verified SHA-256—not a literal placeholder. Rejection is final **immediately in the same call**, for example `status:"rejected",reason:"unknown_spot"`. It must not first return `accepted`. A move obstructed by a person waits through the 5,000 ms no-progress allowance then returns `status:"blocked",reason:"occupied"`. A known wall or closed door returns `blocked` with that reason. Only a stall without a known cause or the movement deadline yields `timed_out`. In each case, final state identifies the last legal location, not the intended destination.

**Allowed physical reason codes:** `unknown_actor`, `unknown_spot`, `unknown_body`, `bad_binding`, `wrong_controller`, `invalid_request`, `duplicate_id_conflict`, `scene_mismatch`, `stale_session`, `unsupported_version`, `no_path`, `bad_topology`, `unsupported_story`, `blocked_geometry`, `wall`, `closed_door`, `occupied`, `hidden`, `busy`, `no_pose`, `already_final`, `cancelled_by_owner`, `scene_stopped`, `no_progress`, `deadline`, `unread_events`, `invalid_snapshot`, `not_at_named_spots`, `not_linked_for_reach`. Producers may add diagnostics, but cannot silently substitute a vague successful status.

**Exactly-one-result rule:** this is one **logical terminal result** per unique `(session_id, request_id)`; polling or retrying may deliver the same result again with the **same `result_id`**, never create another. The Lab bridge deduplicates before Encounter records a consequence. The result does not independently transfer goods or advance Encounter's step clock.

### 10.5 Query envelope and read-only replies

```json
{
  "c6": "room-c6@0.1", "kind": "query", "scene_id": "lab-store-c6@0.1",
  "session_id": "run-0007",
  "query_id": "q-0014", "op": "check_reach",
  "args": { "actor_a": "clerk", "actor_b": "customer", "method": "named_spots" }
}
```

Supported read-only queries and replies:

| `op` | Required `args` | Required reply data |
|---|---|---|
| `inspect` | `actor_ids` (subset of `clerk`,`customer`; empty means both) | `actors` with body ID, present/controller, graph edge or vertex, plan position/facing, current named-spot memberships; `scene_id` (but **no repeated scene fingerprint**); physical occupancy/door facts as available. |
| `check_reach` | `actor_a`, `actor_b`, `method:"named_spots"` | `reachable` Boolean, `spot_a`, `spot_b`, `reach_pair_id` if matched, `reason` (`null`, `not_at_named_spots`, `not_linked_for_reach`, `wall`, `occupied`, etc.). No asset or money changes. |
| `snapshot` | `last_applied_seq` (integer ≥0; latest event fully processed by the Lab bridge) | Stable physical snapshot per §9 **only if** no commands are active and `last_applied_seq` equals ROOM's latest emitted `seq`. Otherwise `ok:false,reason:"busy"` or `ok:false,reason:"unread_events"`. The successful snapshot contains the bound scene fingerprint and consumed cursor. |

All query replies share:

```json
{
  "c6": "room-c6@0.1", "kind": "query_result", "session_id": "run-0007",
  "scene_id": "lab-store-c6@0.1",
  "query_id": "q-0014", "op": "check_reach", "ok": true,
  "data": {
    "reachable": true, "spot_a": "N_cashier", "spot_b": "N_customer",
    "reach_pair_id": "counter-handover", "reason": null
  }
}
```

`ok:true` means the **query was valid**, not that reach was permitted; `data.reachable` answers the physical question. This distinction avoids mistaking a valid “no” for an API error.

### 10.6 Event records for both movement sources

`poll()` returns ordered records. Every record contains these common keys:

```json
{
  "c6": "room-c6@0.1", "kind": "event", "scene_id": "lab-store-c6@0.1",
  "session_id": "run-0007",
  "seq": 18, "event_id": "run-0007:18", "name": "spot_entered",
  "actor_id": "customer", "source": "player", "request_id": null,
  "spot_id": "N_customer", "route_edge_id": "e_counter",
  "travel_direction": "toward_v_counter",
  "position": { "x": 3.35, "y": 3.05, "story": 0, "facing_deg": 0 }
}
```

Required event names and additional fields:

| `name` | Required data | When emitted |
|---|---|---|
| `spot_entered` | `spot_id`, `route_edge_id` or nearest graph location, `travel_direction`, physical position, `source`, `request_id` (`null` for player) | Once when a bound present actor **crosses into** an authored named spot's enter radius. |
| `spot_left` | Same fields | Once after the actor **crosses outside** the corresponding exit radius. |
| `command_final` | `request_id`, `op`, and a `result` object in the exact §10.4 terminal-result shape | Once for each command's terminal outcome, including an immediate rejection. |
| `player_blocked` | `reason`, position and blocking actor/fixture ID where known; `request_id:null` | Optional developer diagnostic, emitted on a **new physical block contact**, not every frame a key is held. Never used as an invented commanded-move result. |

The same named-spot transition events apply to **NPC bodies** too; only their `source` and `request_id` differ. Repeated frames spent inside a spot emit no extra enter event. Leaving and truly coming back produces a new enter event with a new ID.

**The event stream is physical evidence, not Encounter history.** Encounter/A1 records only observations legitimately received, after applying its own rules. A character does not suddenly know what ROOM privately inspected.

### 10.7 Simple, permanent event history for each session

`poll` request:

```json
{
  "c6": "room-c6@0.1", "kind": "event_query",
  "scene_id": "lab-store-c6@0.1", "session_id": "run-0007",
  "after_seq": 17, "max_events": 100
}
```

Reply:

```json
{
  "c6": "room-c6@0.1", "kind": "event_batch",
  "scene_id": "lab-store-c6@0.1", "session_id": "run-0007",
  "events": [], "next_seq": 17, "latest_seq": 17
}
```

ROOM retains **every event in order for the entire live session**, without dropping, recycling, truncating or pruning it. `after_seq` is the last sequence the Lab bridge **successfully applied**, not merely displayed. `poll` returns up to `max_events` later events in increasing order. `next_seq` is the highest sequence **returned** (or the supplied `after_seq` when the batch is empty); `latest_seq` is ROOM's most recently emitted sequence, which can be higher if more events remain to read. The bridge advances its **own** cursor only after it applies events in order. Repeated polling may return an already-seen event; the bridge ignores the duplicate by `session_id` and `event_id`. A session restart uses a new ID; old-session events never change a new run.

**There is no `ack` method, `event_gap` error, acknowledgement cursor stored by ROOM, or event-pruning step.** The UI and physical logic run in the same page; keeping one full ordered session log is simpler and makes it impossible to lose an event through a capped buffer. The consumer manages its own reading position.

**Saving guard:** the bridge calls `query` with `op:"snapshot"` and `args:{"last_applied_seq":...}` only after it has processed outstanding event batches. ROOM compares that value to its current `latest_seq` in the same operation. If any event is unread, it returns `ok:false,reason:"unread_events"`; the bridge must poll/apply and try later. **Why:** a just-arrived character must be recorded before a save is permitted.

## 11. One official ROOM stand-in and **one shared contract test suite**

**Stand-in name:** `ROOM_C6_STANDIN_v0_1` (future, test-only; not created now). **Owner:** Codex A4, under its later separate authorization. **Real interface owner:** Nova, under separately authorized ROOM repair. The Lead pins the approved prose and test fixtures; A7 reviews results independently. No other agent may invent a private ROOM imitation.

Both implementations must expose the identical **production-facing three-method interface** `submit(commandEnvelope)`, `query(queryEnvelope)`, and `poll(eventQuery)`, with the exact same message forms and statuses defined in §10. For deterministic non-browser contract tests, each adapter additionally supplies the **same explicitly test-only fixture driver** that can: `reset_fixture(fixture_id)`, `advance_room_ms(milliseconds)`, `drive_player_input(steps)` using the normal player-control path, and apply named scripted obstructions or interruptions defined in a frozen test fixture. These test-only controls **do not ship** and are never a gameplay movement API. The real adapter must use the genuine Lab geometry/occupancy and actual route execution logic; it cannot return fabricated successes to satisfy a fixture.

**One unchanged non-browser test file:** `tests/contracts/c6_contract.test.mjs` (to be authored by **Nova** only after separate Stage A repair authorization, and reviewed by A7 under its later testing authority). Codex A4 must use the exact same test file bytes and record its SHA-256 when testing the stand-in; no agent forks or edits the shared expectations for its own implementation. It imports **only a supplied C6 adapter/fixture driver**, not implementation-private ROOM variables or stub-specific internals. Its expectations and fixture names are identical for the stand-in and real logic; the runner chooses the implementation through an external adapter entry point (for example the `C6_ADAPTER_MODULE` environment setting). **No conditional expected results, no separate “real” and “fake” copies of the test, and no test rewrites between adapters.** Every shared case must pass on both. If a test cannot be expressed through the common interface and fixture driver, revise the contract for owner review, not quietly add an implementation-specific escape hatch.

Common fixtures include: customer starts human-controlled; a separate Stage A rules-only customer; blocked wall/fixture; another actor physically in the path; customer entry/exit at named spots; counter handover and wall reach; closed door; cancellation/interruption; injected no-progress; duplicate/old result; unread event at snapshot; absent customer/return; and stable/invalid restore. The same named scene/actor/spot identities apply to both adapters. Timers use a controlled test clock so a 5-second block or 30-second timeout can be exercised without waiting in real time.

**Stand-in proof is not real ROOM proof.** Report both outcomes separately (`STANDIN_CONTRACT_PASS` and `REAL_LOGIC_CONTRACT_PASS`). The stand-in cannot prove browser rendering, actual first-person camera behavior, or compatibility with older art; those have distinct browser tests.

**Why:** the independent Codex developers and ROOM repair author should have one set of observable expectations, not two subtly different interpretations of the prose.

## 12. Repair plan — two separately authorized stages, two stops

**The contract does not authorize either stage.** Any later repair takes place in a new versioned candidate copied from the selected Combat Room baseline and using reviewed portions of Claude's overlay. Original archives and other producer histories remain intact.

### Stage A — movement, physical results, and spot events

**Before writing repair code:** independently run the baseline Node and browser suites on the unchanged original and on Claude's overlay. Run the scene audit on the tested original scene and **report every failing route/spot before changing the scene or checks**. Confirm a fixed candidate scene ID strategy.

**Authorized scope *if* separately approved later:** Lab-only geometry checker (without changing `core.js`), graph path selection/execution for rule-driven clerk/customer in an isolated fixture, the existing human-controlled customer's equivalent physical validations, named-spot entry/leave events, request tracking, cancellation, person-occupied blocking after the no-progress allowance, timeout, **full ordered session event retention without acknowledgements**, the shared non-browser contract suite, check-reach via named pair, and narrow door-closed-before-crossing check. Add `N_store_inside` by directly editing the frozen tested scene into a new version with new hash; never regenerate. New code should be testable in Node; thin browser hooks only.

**Stage A evidence and stop:** changed-file diff, original/candidate checksums, actual scene validation table for every graph edge and named spot, **the identical shared non-browser contract file run against the real logic and the official Codex stand-in when both are available**, unchanged legacy non-browser suites, baseline and repaired browser evidence, and a list of unresolved defects. **Stop for Teddy's review. Do not begin Stage B automatically.**

### Stage B — clerk/customer camera, control binding, and stable restore

**Authorized scope *if* separately approved after Stage A review:** bind either persistent actor to the existing first-person camera/controller at its legal start, prevent duplicate body/input ownership, verify both start locations, support stable snapshot/restore and hide/show for confirmed exit/return, and retain the Stage A safety/results under both controllers. Do not introduce a citywide player-possession architecture.

**Stage B evidence and stop:** the Stage A tests rerun, the identical shared contract tests against the stand-in and real logic, new camera/identity/restore tests, older character-pack render regressions, both perspectives in browser, build/source/scene hashes, the independent browser report and a precise list of exceptions. **Stop for Teddy's review. Do not promote the candidate to accepted ROOM or trigger Codex integration automatically.**

### Delivery after each future repair stage — changed-files overlay only

Stage A and Stage B each deliver a **small overlay, not a complete copied original archive**:

1. `changed_files/` reproduces each added or modified file **at its exact Room Creator relative path** (including the versioned scene if changed). List deletions explicitly if any are authorized.
2. `originals_of_changed_files/` includes the **untouched Combat Room baseline version** of each modified file at the same relative path; newly added files are identified as additions with no original. For Stage B, also include the **pre-Stage-B candidate copy** when a file had already been changed in Stage A. Originals are never rewritten.
3. `ASSEMBLY_MANIFEST` records the pinned original archive SHA-256, the stage input candidate identity, every changed path and SHA-256, and the **fingerprint of the fully assembled Room Creator tree** computed reproducibly from sorted relative paths and their content hashes. Include built HTML SHA-256 values where applicable and the new frozen scene SHA-256.
4. Include test logs, exact commands, failures, environment, and an assembly/reverification procedure. Assemble the overlay on top of the original and any preceding stage in a disposable copy and verify the result before declaring a candidate.

**Why:** we can review and move only the actual changes without repeatedly distributing a huge archive or losing the ability to reconstruct and verify the exact tested result.

**Why split this way:** safe physical movement can be proved independently of first-person camera re-binding. This reduces the chance of confusing a camera bug with a collision or event bug.

## 13. Acceptance matrix — every test labeled by where it must run

All items below are **NOT RUN for a C6 repair candidate**. Step 1's existing baseline test results are historical evidence, not proof that new C6 code exists.

**Legend:** **NB** = non-browser Node/pure-logic test; **BR** = actual browser test against a rendered ROOM page; **BR+WIN** = browser and native-Windows owner/release acceptance. The later independent agent A7 may repeat tests in its own environment.

| ID | Test | Required environment | Pass condition |
|---|---|---|---|
| C6-01 | Every authored graph edge passes Lab geometry checks | **NB** | No edge crossing forbidden furniture, solid wall, unsupported story, or illegal opening; fail IDs reported. |
| C6-02 | Every named spot is valid/reachable | **NB** | All `routeNet.nodes` pass or owner-approved exceptions are identified *before* editing scene/checker. |
| C6-03 | Same physical rules for player and NPC | **NB + BR** | Equivalent obstructions/spot occupancy produce equivalent physical outcomes for each input type. |
| C6-04 | Customer moves entrance → register | **NB + BR** | ROOM chooses graph route; body visibly reaches `N_customer` and result carries original request ID. |
| C6-05 | Route across shelf or counter | **NB + BR** | Illegal crossing is rejected or blocked; body never clips through. |
| C6-06 | Unsupported between-story shortcut | **NB** | Refused as `unsupported_story`, never treated as a normal path. |
| C6-07 | Physical player/NPC overlap | **NB + BR** | A body cannot occupy another body's physical footprint. Player cannot stand at an already occupied named spot's standing point; directed walker waits the no-progress allowance and ends `blocked/occupied`. No extra “exclusive spot” class. |
| C6-08 | Player named-spot arrival | **NB + BR** | Exactly one `spot_entered` event per real entry, no fake keypress request. |
| C6-09 | Player named-spot departure | **NB + BR** | Exactly one `spot_left` event after real exit; no repeated spam while inside/outside. |
| C6-10 | NPC named-spot transition | **NB + BR** | NPC results and named-spot events have distinct IDs, correctly linked to the command. |
| C6-11 | Outside door vs inside marker | **NB + BR** | Door approach isn't mistaken for entry; crossing produces inside event; exit is directionally confirmed. |
| C6-12 | Door closed *before* crossing | **NB + BR** | Door approach remains available; actual gated crossing returns `blocked/closed_door`. |
| C6-13 | Door closes mid-walk (conditional) | **NB + BR if feasible** | Safe stop/result if supported without large door change; otherwise named documented exception submitted for owner decision. |
| C6-14 | Cancel active movement | **NB + BR** | One `cancelled` terminal; actor stays in last legal position. |
| C6-15 | Stuck movement expires | **NB**, BR spot check | Fake-clock deterministic `timed_out` for unexplained no progress/overall deadline, **but** identified person obstruction after 5,000 ms yields `blocked/occupied`; neither advances Encounter's clock. |
| C6-16 | Repeated request/result/event | **NB** | Same IDs yield one logical terminal and one Encounter effect; no double arrival or action. |
| C6-17 | Late event after scene restart | **NB** | Old `session_id` is ignored/reported, never attributed to current run. |
| C6-18 | No session event is ever dropped | **NB** | Emit more than 500 physical events, read from older `after_seq` values, and verify every event remains present in exact order until that session ends. No `ack`/`event_gap`. |
| C6-19 | Check reach across low counter | **NB + BR** | `N_cashier`↔`N_customer` succeeds despite low counter; does not move any item. |
| C6-20 | Check reach through solid wall | **NB + BR** | A wall blocks interaction, including an erroneously linked pair. |
| C6-21 | Gesture play, release, interruption | **NB + BR** | Poses report exactly once; playback never changes money, item ownership or history. |
| C6-22 | Correct human start, customer | **BR** | View follows correct physical customer, clerk NPC appears once. |
| C6-23 | Correct human start, clerk | **BR** | View starts behind counter on clerk body, customer NPC appears once. |
| C6-24 | No double controller or duplicate visible body | **NB + BR** | Stage A human customer rejects `move`/`face`, accepts the three gesture commands; separate rules-only customer fixture can `move`. Stage B human-control/camera ownership is exclusive; self-mesh hiding preserves collision. |
| C6-25 | Hide after confirmed exit; show on return | **NB + BR** | No early disappearance or appearance inside another body; same identity restored. |
| C6-26 | Stable save and restore | **NB + BR** | Snapshot refused if any bridge event remains unread (`unread_events`), bound frozen scene hash checked on restore, both actors restore at legal positions; no invented entry/purchase. |
| C6-27 | Invalid/mismatched restore | **NB** | Whole restore rejected; no partial positions or controller change. |
| C6-28 | Older character packs still draw correctly | **BR** | Existing pre-Lab packs render and walk as before; no regressions in left/right facing, head fallback or stride. |
| C6-29 | Legacy movement regression | **NB + BR** | Original player Route Walk, NPC lane scenes and combat previews still pass their existing tests; `core.js` unchanged. |
| C6-30 | No unwanted changes to old scene/source | **NB** | Byte-exact original archive and source comparison; approved changes delivered as path-preserving overlay with untouched originals, plus assembled-tree fingerprint. |
| C6-31 | Source/browser/scene evidence provenance | **NB + BR** | Every executed test has exact command, exit status, assertion counts, environment, source and scene hash. |
| C6-32 | Frozen scene regeneration avoided | **NB** | Candidate scene derived by controlled direct edit, IDs stable, new SHA checked only at bind/restore; entrance/outside spot circles remain entirely on their own sides of the store boundary. |
| C6-33 | One shared contract test suite against both implementations | **NB** | The **same unchanged test file** passes with `ROOM_C6_STANDIN_v0_1` and real Lab logic. Same fixtures and expectations; results recorded separately. |
| C6-34 | Initial presence and named returns | **NB + BR** | Bind present clerk/customer legally; absent customer has no physical footprint or fake entry, shows only at an unoccupied outside return spot, and enters later normally. |
| C6-35 | Two human-command restrictions and allowed gestures | **NB + BR** | Human `move` and `face` rejected `wrong_controller`; `gesture`, `release_gesture`, `set_idle` accepted when valid. Rule-controlled customer moved only in separate Stage A fixture. |

**Stage A must complete:** C6-01–21 as applicable **including the replaced C6-18**, C6-29–35 as applicable, the shared non-browser contract suite, and existing regressions. **The same unchanged suite must pass on both the real Lab logic and the official stand-in before the joint contract gate can be marked PASSED.** If Codex's stand-in is not yet authorized or available, Stage A may deliver its overlay and stop for review, but must mark this joint gate **OPEN — STAND-IN NOT TESTED**; it cannot claim full C6 acceptance or proceed to Stage B automatically. Stage A uses customer-human/clerk-rules normal play and a separate customer-rules fixture, and does not claim Stage B's clerk-camera proof. **Stage B must complete:** all Stage A proofs again and C6-22–28 and C6-33–35. `BR+WIN` is the eventual Lab delivery acceptance beyond this ROOM repair, and is **not** claimed by the ROOM candidate's non-browser tests.

## 14. Browser-test plan and time allowances

### Who runs what

- **Nova (repair author):** non-browser baseline and candidate suites, code/scene diff, pure-logic tests, local browser checks where technically possible. **Nova cannot presently certify browser tests** in its restricted environment.
- **Claude (different repair author, but original overlay author):** the agreed independent **browser executor for C6**. Claude must run untouched **original and overlay baselines before any repair**, then the Stage A candidate and later Stage B candidate, in an environment that allows `file://` navigation. Claude must not modify the test scripts just to obtain a pass. Claude's authorship of the original overlay is disclosed; this is independent verification of Nova's *repair*, not independent authorship of the overlay.
- **Codex A7:** independently checks C6 contract compliance and regressions later **only under its own authorized build/testing scope**. It does not quietly accept Claude's report instead of examining the candidate.
- **Teddy:** final personal native-Windows playthrough of the exact delivered Lab artifact remains a separate release gate.

### Exact existing scripts to run

All commands are run from the selected Room Creator test root (`rc/`) with the **unchanged scripts and corresponding source page**. Save the original and overlay baseline outputs separately; Stage A and Stage B each get separate logs. `tests/lab/...` exists in Claude's overlay/candidates, **not** in the untouched original.

**Non-browser — on original, overlay, Stage A, and Stage B:**

```text
node tests/block_layout.test.js
node tests/vehicle_world_v2_5_two_block_transit.test.js
node tests/vehicle_graph_examples_diff.js
python tests/asset_intake_test.py
[every existing top-level tests/*.test.js script, run separately and report each exit]
[additional C6-... non-browser test scripts, once written in an authorized repair]
```

**Browser — unchanged original and overlay baseline:**

```text
python tests/combat/combat_playtest.py
python tests/route/route_smoke.py
python tests/route/route_keys.py
python tests/route/characters_smoke.py
```

**Additional browser tests on Claude's overlay, then on Stage A and Stage B:**

```text
python tests/lab/lab_play_page.py
python tests/lab/lab_store_playtest.py
```

**Additional targeted original browser regressions as appropriate to changed hooks** (report any unavailable/missing script explicitly):

```text
python tests/route/characters_walk.py
python tests/route/route_eval.py
python tests/route/route_perf.py
python tests/encounter_movement_preview_browser.py
python tests/movement_network_editor_browser.py
python tests/movement_network_r2_browser.py
python tests/movement_network_r3_browser.py
python tests/movement_network_r4_browser.py
```

Newly authored **C6 browser tests** must cover human spot transitions, occupancy, low-counter reach, wall reach, stopped movement, both cameras, physical save/restore and legacy visual packs. They may be named `tests/lab/c6_*.py` only in a separately approved repair, not in this documentation step.

### What each browser report must include

For **every** individual script: exact source package/revision SHA-256, scene fingerprint, target page path, command/cwd, OS, Python and Playwright versions, browser name and **browser binary version**, timeout allowance, exit code (or timeout/sandbox error), assertion names, passed/failed/skipped counts, screenshots or logs where generated, and any missing assets/dependencies. A screenshot is useful evidence, not a replacement for an assertion report. Baseline and each candidate must be identified separately.

**If a browser test cannot start:** record **NOT RUN** (or **BLOCKED BEFORE ASSERTIONS**), not PASS, and preserve the error. If neither Nova nor Claude can run required tests, **do not accept the ROOM candidate** without a new owner instruction; find a suitable Windows/browser test machine or request an explicit documented exception. A7's later independent review is still required under its own authorization.

### Recommended execution allowances

These are **runner wall-time limits**, separate from the 30-second **in-game commanded movement** budget:

| Existing test / test group | Step 1 observed | Minimum runner allowance recommended | Why |
|---|---|---|---|
| `tests/block_layout.test.js` | ~40.95 s original / ~42.20 s overlay | **120 s per run** | The prior short-limit timeout did not reproduce with adequate allowance. |
| `tests/vehicle_world_v2_5_two_block_transit.test.js` | ~24 s per copy | **90 s per run** | Expensive transit graph work needs room for a slower host. |
| Complete top-level non-browser Node suite | 42 original / 43 overlay suites | **20 minutes overall** (also retain per-script limits) | Dozens of sequential suites plus the slow cases. |
| Each targeted browser play/smoke script | Browser blocked before assertions here | **240 s per script**; at least **60 s startup/page allowance** | Software rendering, browser launch and screenshots vary by machine. |
| Browser performance/screenshot-heavy scripts | Not measured in Step 1 | **300 s per script** to begin; report actual time | Use a higher limit without pretending unrun tests passed. |
| New isolated pure-logic C6 tests | Not implemented yet | **60 s per test file**; simulated clock for timeout cases | A stuck-move test should not need 30 real seconds. |

A timeout is reported with the exact limit and elapsed time; only a **new successful rerun** may change the status to pass. A failed browser navigation is a tooling/blocker result, not proof of either pass or gameplay defect.

---

## 15. Keep the three levels of truth separate

| Level | Owner | Example | Why separate |
|---|---|---|---|
| **Physical position and possibility** | ROOM | “Customer is at `N_customer`; clerk is at `N_cashier`; a handover across their low counter is physically reachable.” | That is what the bodies and obstacles actually permit. |
| **Observation and information receipt** | Encounter | “Customer was looking at the shelf and has a legitimate reference to a bottle and its marked price.” | Mere physical proximity does not guarantee that a person learned something. |
| **Memory, opinion and meaning** | Encounter | “The clerk remembers the customer's missed pickup and now trusts them less.” | A renderer or physical move cannot invent a relationship fact. |

**No physical event by itself creates a purchase, promise, ownership transfer, trust change or knowledge of hidden stock.** Encounter receives physical evidence, determines what was legitimately perceived, and commits consequential events. Face/gesture rendering is downstream and cannot change authoritative history.

**Why:** C6 must be a bridge between the physical world and the social world, not a second world-state engine.

## 16. Explicit exclusions and final stop

**Not in C6 v0.1:** merging movement systems; citywide traffic/pathfinding; general occupancy arbitration; arbitrary actor or vehicle possession; detailed hand physics; universal line-of-sight or arbitrary range reach; combat, theft or social AI; inventory/money/KeyWrapping logic inside ROOM; new door-state machinery; altering shared `core.js` route checking; regenerating the store; moving the Encounter clock when a body walks.

**C6 status after delivery:** **WRITTEN FOR REVIEW, NOT APPROVED OR IMPLEMENTED.** Only this Markdown contract is delivered. There are **no ROOM source changes, no new frozen scene, no C6 stand-in code, no repaired browser pages, no agent launch**, and no claim that Stage A or Stage B tests were run.

**STOP. Await Teddy's review and approval of this contract. A separate command is required before any repair.**
