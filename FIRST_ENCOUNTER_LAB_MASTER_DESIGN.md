# First Encounter Lab master design

## 1. Identity and status

First Encounter Lab is Trapstar's first reusable gameplay tile within the First Encounter Game program. It uses a small store to prove rules that should also work in other places. This new repository holds the design and source locks. Its evidence baseline is preflight `2026-11-14-lab-pf-952b4`. Gameplay build authority is pending a separate owner command. [Preflight report](docs/preflight/FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md)

## 2. Player experience

Enter a small convenience store in first person. One character keeps the store and the other shops. The customer can notice a product, ask about it, offer to buy it, ask for a hold, come back, and refer to what was agreed. A clerk can respond, hand over stock, or handle an agreement that is still open or overdue. A sale changes actual balances, stock, ownership, and who holds the item. A promise to pay later leaves something to do.

Use Request, Offer, and Remark. BASED changes how a message comes across. KeyWrapping lets an actor refer to a specific product, event, or exact agreement they learned about. A return visit can reflect past dealings and unfinished obligations. There is no required win state. Both characters can act by rules, and the first proof plays the customer before proving clerk control while the customer shops autonomously. [Interaction design, §§2–5](docs/design/FIRST_ENCOUNTER_LAB_INTERACTION_DESIGN.md#2-already-decided)

## 3. Development Mode versus Play Mode

In Development Mode, pause at a safe boundary to assign either actor, inspect reasons, edit supported test parameters, and rerun from a clean comparison branch. Edits have their own record. Control changes preserve each actor's identity, memories, money, goods, obligations, and relationships. Returning an actor to rule control resumes their role.

In Play Mode, the assignment is fixed. Both roles use the same composer and action rules. The view presents what the controlled actor knows, with permissions determined by role and context. The rules can maintain an internal assessment for a human-controlled actor without disclosing it or constraining the player's choice. [Interaction design, D7 and D11](docs/design/FIRST_ENCOUNTER_LAB_INTERACTION_DESIGN.md#d7-what-changes-on-screen-when-you-control-a-different-character) · [Decision spec, §13](docs/design/FIRST_ENCOUNTER_LAB_DECISION_SPEC_v0_2.md#13-developer-inspection)

## 4. Scope and exclusions

Target one offline HTML file that opens by double-click and supports portable run files. Use plain boxes for fixtures and the original-quality slim male and female bodies from Arcade Cast v0.12, with Goose and Brifern in a separate talking-head view. Room Creator Combat Room v0.1.1 is a proposed input, with combat and shooting disabled for the Lab. Selection and the movement interface remain open.

City simulation, driving, combat, theft, job systems, eavesdropping, live AI, online services, multiplayer, new missions, and ZANT expansion are outside the Lab scope. Modular source can make a later Unity port easier. Unity has a separate authorization gate. [Source provenance](docs/provenance/SOURCE_PROVENANCE.md)

## 5. Architecture in everyday words

Encounter owns gameplay identities, agreements, balances, possessions, history, consequences, and who knows what. ROOM describes the physical space and supplies evidence about a move, obstruction, or arrival. Encounter decides what that result means for the game. Character presentation turns a committed record into words, faces, and gestures. The Lab interface projects the controlled actor's knowledge and offers the separately scoped Development tools. Atlas supplies descriptive read-only projection. A reference to another package grants no authority to write it.

Use one shared set of gameplay rules for both characters and reuse the accepted rules for references, exact assent, and consequences where they fit. Store-specific products, roles, and permissions belong in scenario data. [System contracts](docs/architecture/SYSTEM_CONTRACTS_C1_C8.md)

## 6. Approved interaction language

The selected interaction design records Teddy's 14 November acceptance of D1–D10 with four refinements. It carries D11 and additional guards as review-backed, and its stale amendment status is annotated in the decision register. The checkpoint reports later assent to A1–A5. These are scoped design records.

| Decision | What it means in play |
|---|---|
| D1 | Pick a known subject. Seeing it or being told earns a reference. The viewed subject can come first. |
| D2 | Choose a word suitable for the subject. Track what can be expressed and what can be carried out. A request for an act needs a supported act. |
| D3 | Address a person and refer to one exact numbered offer or request. Counter creates new terms, Defer leaves a version open, and ambiguity calls for clarification. Assent must match the same open version. |
| D4 | Store general KeyWrapping expressions. The Lab composer and handling cover one statement or the supported two-part exchange and later shapes. Reject an unsupported shape as a whole. |
| D5 | Explain known impossibility and role restrictions separately. Hidden facts must never affect what the player sees in the menu. |
| D6 | Say changes communication and commitments. Do attempts a world action. Settle checks both performances and records payment and handover separately. A recovery such as a refund is a new effect. A promise can precede available funds. |
| D7 | Use one actor-scoped interface and role-based permissions for both controls. Preserve background judgments and developer edit provenance. |
| D8 | A conversation, a proposal, and an arrangement have independent lifetimes. A conversation can pause or end while an open proposal or unpaid part remains. Keep superseded and stale history. A part can be both fulfilled and late. |
| D9 | A logical step clock advances on agreed events and on return from a chosen absence. Timing comes from recorded steps. |
| D10 | Warmth and trust are distinct lasting judgments supported by observable causes. A passing delivery reaction belongs to the exchange. Logged, causal changes can inform future decisions. |
| D11 | Demonstrate both roles using the same grammar, rules for money/title/holding, and shared history. The assigned role, its permissions, and its knowledge determine available play. |
| A1–A5 | A1 makes supersession and exact assent explicit. A2 uses accepted KeyWrapping expression structure. A3 prevents menu leakage. A4 keeps settlement effects and refunds separate. A5 preserves overdue obligations. |

[Selected interaction design, §§1 and 3–5](docs/design/FIRST_ENCOUNTER_LAB_INTERACTION_DESIGN.md#1-status-of-each-decision) · [Decision register](docs/decisions/DECISION_REGISTER.md)

## 7. NPC decision model status

The selected v0.2 describes five steps. Read the trigger, actor-scoped facts, and received cues. Find the available responses and exclude what the actor knows they cannot do or may not do. Score the remaining replies using role priorities, personality, warmth, trust, risk, and circumstances. Choose by score with a stable tie order. Record the decision and its effects before performing it.

Accept and Refuse are Remarks, Counter is an Offer, Defer names a pending fact, Clarify requests a missing term, and Acknowledge records receipt without assent. A character can be unwilling even if an act is possible and permitted. The listener receives cues and prominence. The selected BASED label and private reasoning stay private. A cue can shift this exchange's warmth input, while legitimate observed events and stable cause IDs govern lasting judgments.

In Development Mode the inspector shows candidate exclusions, weights, sources, tie reasons, and the hypothetical rule choice for a controlled actor. Clerk and shopper routines use the same legal decisions and wait for confirmed movement. M3 currently has fixed human/NPC roles, exactly `service`, `privacy`, and `verification` profile keys, and only three authored BASED deliveries. The future compatibility decisions cover role widening, privacy and candidate parity, deposit terms, the due-time edge, and the spoken reason in worked Case 4. v0.2 is a design specification. [Decision spec, §§3–16](docs/design/FIRST_ENCOUNTER_LAB_DECISION_SPEC_v0_2.md#3-step-1-what-is-happening) · [Open approvals](docs/decisions/OPEN_APPROVALS.md)

## 8. Authority and provenance

M3 `76a92fd82ac5ec6f10748f0b439a5d661fff5ea5` is the Encounter foundation candidate. Economy and EA-IE at `cc8371c3c497edcdcfb8a73ec7da9dad4663847a` and the KeyWrapping design at `22c06dc179e3a0739a5ce1e747d0a46dc114fab5` are bounded references. The consolidation authority record is `2c9a2e4406418ff432ab169ef9565ce3d302dea4`. Canonical ROOM v0.14.1 remains held. The separately supplied Combat Room archive and Claude's modified overlay have separate identities. The Lab repository carries references to these originals. The authoritative source and history remain with their producers.

The overlay replaces `source/ui-route.js` and `source/build.py`, adds `source/ui-lab.js`, and includes rebuilt pages and test evidence. It shows a physical candidate preview. Safe movement, camera/restore, and a gameplay integration require later proof. The two chosen design files are exact checkpoint members. The same-named loose copies differ. The source lock records pins, fresh verification scope, excluded alternates, and inherited limits. Art reuse and distribution require review of rights. [Provenance](docs/provenance/SOURCE_PROVENANCE.md) · [Source lock](docs/provenance/SOURCE_LOCK.json)

## 9. C1–C8 handoff contracts

All are proposed for build review.

| Contract | Owner and handoff | Critical proof |
|---|---|---|
| C1 | Lead and independent reviewer turn exact pins and allowed paths into a preservation audit. Only the authorized lane can write its candidate. | Reject wrong hashes and out-of-scope writes. |
| C2 | Encounter takes identity, role, and a paused assignment and yields one controller and scoped view. The switch leaves gameplay records intact. | Both starting roles, preserved identity, exclusive input. |
| C3 | Communication validates known subjects and supported exact terms, then Encounter records the sealed receipt. Private draft data stays with its author. | No stale assent, partial handling, or hidden menu leak. |
| C4 | NPC policy reads scoped knowledge and returns a reasoned choice to Encounter. Encounter alone commits it. | Identical inputs yield identical choice, reasons, and ties. |
| C5 | Encounter validates exact assent, money, title, holding, and stock before recording unique effects and fulfilled parts. | Duplicate and failed actions cannot repeat value or erase obligations. |
| C6 | An approved ROOM implementation takes a bound motion request and returns a correlated physical result to the Lab bridge. Social and economic facts remain Encounter's responsibility. | Legal routes, interruption, occupancy, restore, stale result rejection. |
| C7 | Presentation reads committed cues and drives portrait and body playback. Playback cannot write gameplay history. | Neutral fallback and inert skip, cancel, or replay. |
| C8 | Encounter owns logical time and saved state. UI exposes scoped views, and the Lead builds the offline bundle. | Validate imports atomically, catch up once, and double-click the exact offline file. |

[Detailed contracts](docs/architecture/SYSTEM_CONTRACTS_C1_C8.md)

## 10. Agent team plan

The Lead coordinates locks and integration. Seven future specialists cover state and economy, communication and KeyWrapping, NPC decisions, the physical bridge, character presentation, UI, and independent testing. The proposed one-writer file plan and four-slot schedule require approval. A4's work is limited to the Lab-side bridge consuming an approved ROOM interface. Nova/ChatGPT handles ROOM source through the owner's separate process. [Agent ownership and handoffs](docs/architecture/AGENT_OWNERSHIP_AND_HANDOFFS.md)

## 11. Milestones and evidence

A proves safe foundations and stable bindings for both identities. B demonstrates one real customer-controlled purchase and reload. C proves earned memories, arrangements, and a return, including late performance. D proves clerk-control parity with a rule-driven customer. E reviews the exact offline package with independent tests and a native Windows launch. Each milestone requires evidence from the same state and rules. [Build checkpoints](docs/architecture/BUILD_CHECKPOINTS.md)

## 12. Unresolved decisions and implementation risks

Teddy must resolve M01 (ROOM source and safe movement), M02 (versioned Encounter scope), M03 (the five v0.2 seams), M04 (adopt exact inputs), M05 (ownership and concurrency), and M06 (final Windows acceptance). The decision register maps G01–G17 to the affected owners, recommended treatment, and stop condition.

The motion prototype can cross a counter, accepts cross-story segments, and does not correlate safe terminal results. Older renderer paths need regression proof. The fresh preflight ROOM runs had a timeout, browser coverage remained incomplete, and IR3-25 remained one specific actual failure. Frozen test wording and the source authority remain available for review. [Open approvals](docs/decisions/OPEN_APPROVALS.md) · [Decision register](docs/decisions/DECISION_REGISTER.md#preflight-reconciliation-g01g17)

## 13. Acceptance and portability

Require T1–T17 and B01–B26. Both actors must see only legitimately learned information. Duplicate input, replay, reload, or rendering must never duplicate or forge purchases, memories, or completion. Demonstrate the same real simulation through both control assignments, including failures and portable run import/export. Keep the inspector inert on reads and isolate developer edits. An offline Windows double-click of the exact hashed HTML with networking blocked is a separate acceptance gate. Keep simulation and assets modular for a future port. [Acceptance matrix](docs/testing/ACCEPTANCE_MATRIX.md)

## 14. How changes are approved

Documentation corrections cite their source and preserve locked evidence. Teddy's decisions should record exact choices and scope. Protected-source changes need named authority, a versioned candidate, and owner-reviewed limits. Candidate implementation requires that future scope and an evidence trail. Independent review may recommend acceptance of an exact candidate after testing, followed by owner acceptance. A private repository or documentation commit grants only setup standing. [Document authority](docs/provenance/DOCUMENT_AUTHORITY.md)

## 15. Immediate next action

Teddy and Nova review this design, the setup report, and the open approvals. Build activity stays paused pending a separate, scoped owner command. [Setup report](docs/setup/REPOSITORY_SETUP_REPORT.md) · [Open approvals](docs/decisions/OPEN_APPROVALS.md)
