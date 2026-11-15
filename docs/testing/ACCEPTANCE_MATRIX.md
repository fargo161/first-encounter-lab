# Acceptance matrix

These integrated Lab checks are future work. Preserve the original proof wording. Any approved interpretation of T3/T6/T8/T12 or other test must link to the corresponding owner decision. The exact artifact, state evidence and independent observations are required.

## T1–T17 behavioral checks

Source is [selected decision spec §16](../design/FIRST_ENCOUNTER_LAB_DECISION_SPEC_v0_2.md#16-checks-this-specification-must-pass).

| ID | Check | Integrated status |
|---|---|---|
| T1 | The same starting state and inputs give the same decisions, every run | NOT RUN / FUTURE BUILD |
| T2 | The four cases in section 14 give the results shown | NOT RUN / FUTURE BUILD |
| T3 | With every weight set to an extreme, nothing impossible or forbidden is ever chosen | NOT RUN / FUTURE BUILD |
| T4 | Every point in every record has a reason and a source. None is blank | NOT RUN / FUTURE BUILD |
| T5 | Changing only the delivery never changes which candidates survive section 5 | NOT RUN / FUTURE BUILD |
| T6 | No chain of offers contains more than two Counters from one character | NOT RUN / FUTURE BUILD |
| T7 | Defer never appears without a named fact and a time to look again | NOT RUN / FUTURE BUILD |
| T8 | A human-controlled character is offered exactly the candidates a rule-driven one would have had | NOT RUN / FUTURE BUILD |
| T9 | After time away, the four catch-up steps run once and in order, and returning again does not rerun them | NOT RUN / FUTURE BUILD |
| T10 | Opening the inspector changes nothing in the world | NOT RUN / FUTURE BUILD |
| T11 | A face with no picture for a name shows Neutral and logs the gap | NOT RUN / FUTURE BUILD |
| T12 | No menu entry is hidden or greyed for a reason the controlled character does not know | NOT RUN / FUTURE BUILD |
| T13 | The record exists before the performance starts. Skipping or replaying the performance adds nothing to the record | NOT RUN / FUTURE BUILD |
| T14 | Repeating the same pleasant exchange produces no second gain in warmth | NOT RUN / FUTURE BUILD |
| T15 | The private part of a message never appears in what a listener is given | NOT RUN / FUTURE BUILD |
| T16 | One hand-over is counted toward one arrangement part, once | NOT RUN / FUTURE BUILD |
| T17 | A part done late is recorded as both done and late. The arrangement does not end at the missed time | NOT RUN / FUTURE BUILD |

## B01–B26 build proofs

Source is §8.4 of the historical multi-agent prompt, SHA-256 `1ddde4a1d7807ae31f44c5be138ebabac63a528f97922f21e7fa18a199a1bae7`. Its production stage stays dormant.

| ID | Proof | Integrated status |
|---|---|---|
| B01 | Original archive/source preservation and exact changed-file inventory. | NOT RUN / FUTURE BUILD |
| B02 | Existing M3/ROOM qualified regression results retained; accepted known failures still reported. | NOT RUN / FUTURE BUILD |
| B03 | Human/NPC identity and profile compatibility, including approved type migration. | NOT RUN / FUTURE BUILD |
| B04 | Same valid request route for both control sources, without leaking private reasoning. | NOT RUN / FUTURE BUILD |
| B05 | All 20 exposed BASED vibes have authored outward cues; no empty/secret-label fallback. | NOT RUN / FUTURE BUILD |
| B06 | Action/subject filtering and hidden-fact noninterference: changing an unknown fact cannot leak through the menu. | NOT RUN / FUTURE BUILD |
| B07 | Unique proposal versions, ambiguous replies, counter supersession, defer/reconsider and stale acceptance. | NOT RUN / FUTURE BUILD |
| B08 | Payment/handover effects, stock/reservation/holding/ownership, no negative balances and no double-counting. | NOT RUN / FUTURE BUILD |
| B09 | Duplicate clicks, duplicate callbacks and replay/load cause no repeated payment or fulfillment. | NOT RUN / FUTURE BUILD |
| B10 | Injected failure between settlement effects preserves an honest partial record and an explicit recovery path. | NOT RUN / FUTURE BUILD |
| B11 | A promise can exist before execution; overdue and done-late remain distinct; partial waivers cannot accidentally erase unrelated obligations. | NOT RUN / FUTURE BUILD |
| B12 | Deadline edge/catch-up ordering follows the reviewed policy; repeated visits do not repeat time consequences. | NOT RUN / FUTURE BUILD |
| B13 | Knowledge/attitude updates require legitimate receipt and causal evidence; superficial repetition does not farm gains. | NOT RUN / FUTURE BUILD |
| B14 | Safe ROOM route, obstruction, interruption, station occupancy and stale result checks. | NOT RUN / FUTURE BUILD |
| B15 | Stable scene IDs on reproducible generation, or an explicitly approved immutable-scene workflow; no silent broken binding. | NOT RUN / FUTURE BUILD |
| B16 | Controlled-actor camera, clerk start, customer start and no duplicate body or concurrent AI input. | NOT RUN / FUTURE BUILD |
| B17 | True left/right gestures, headless-pack fallback, older-pack compatibility, all used gesture modes. | NOT RUN / FUTURE BUILD |
| B18 | Both portrait packs, side/gaze conventions, hearing/reply timing and missing-expression fallback. | NOT RUN / FUTURE BUILD |
| B19 | Animation skip/cancel/replay changes no authoritative outcome; named gesture is not a transfer. | NOT RUN / FUTURE BUILD |
| B20 | Shopper refusal/counter/defer/clarify paths, interrupted routines and no reply loops. | NOT RUN / FUTURE BUILD |
| B21 | Export/import/reset of open proposals, overdue obligations, judgments, positions and pending actions; malformed/incompatible save rejection. | NOT RUN / FUTURE BUILD |
| B22 | Inspector reads are inert; developer edits and comparison runs do not contaminate world history. | NOT RUN / FUTURE BUILD |
| B23 | Exact final HTML offline launch under `file://`, external requests blocked, no required helper or installed dev tools. | NOT RUN / FUTURE BUILD |
| B24 | Native Windows browser launch and run export/import; record OS/browser version and exact candidate hash. | NOT RUN / FUTURE BUILD |
| B25 | Fresh source rebuild reproduces the shipped candidate or explains approved nonsemantic differences. | NOT RUN / FUTURE BUILD |
| B26 | Visible full customer and clerk walkthroughs, with logs and screenshots tied to the delivered candidate. | NOT RUN / FUTURE BUILD |

## Distinct Windows gate

B23 and B24 require double-clicking the exact hashed HTML on native Windows, with the browser and OS recorded and network requests blocked. Execute the actual customer and clerk sequences and round-trip a portable save using the resulting file. Record the run files, screenshots and state assertions against the same artifact digest. Status **NOT RUN / FUTURE BUILD**. M06 assigns the operator and review process.

## Historical foundations

The 14 November preflight reported 48/48 bounded M3 tests. Independent IR3 had 24 passes, one actual qualified failure (IR3-25 inconsistent rectangle dimensions), and zero skips. ROOM overlay Node coverage was 42/43 exits successful, with one timeout and 18 Lab scene checks. Preflight browser reproduction lacked Playwright. Historical author tests and screenshots remain evidence with their recorded limits. None proves integrated Lab behavior.

[Preflight §F](../preflight/FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md#f-baseline-test-results) · [Open approvals](../decisions/OPEN_APPROVALS.md)
