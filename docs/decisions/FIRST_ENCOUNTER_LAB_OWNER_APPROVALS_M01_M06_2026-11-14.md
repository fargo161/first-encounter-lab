# First Encounter Lab — Owner approval record for M01–M06

**Date:** November 14, 2026 (America/New_York)  
**Authority:** The project owner explicitly responded **“approve these six recommendations as written”** to Nova's M01–M06 recommendations in ChatGPT.  
**Standing:** The six **design and governance choices are approved** with the implementation prerequisites below. **This is not authorization to launch a multi-agent build, modify protected sources, distribute assets, or release the game.**

This record supersedes the `NEEDS_OWNER_DECISION` status of M01–M06 in the historical preflight and repository-setup snapshots. Preserve those historical records intact.

## M01 — ROOM interface and source ownership

**Approved:** Nova/ChatGPT owns Room Creator source repairs, under a separately agreed implementation scope and review. Codex Agent A4 owns only the **Lab-side adapter** to an approved ROOM interface, and must not modify authoritative ROOM source.

Before repairs start, define and review a versioned **C6 physical-control contract** for binding actors and stations, inspecting physical state, legal walking, facing, gestures, cancellation, restoration, and correlated event/results. Accepted movement requests are not proof of arrival. Require stable IDs and reliable outcomes; test wall/counter obstruction, occupancy, interruptions, stale responses, camera from both playable characters, saved-state restore, old renderer compatibility and the prior test timeout.

**Still pending:** A separately authorized ROOM repair, a complete C6 contract, and an immutable, independently tested ROOM candidate. Independent Encounter implementation may proceed in parallel only after its **own explicit build authorization**; physical integration waits for the tested ROOM interface.

## M02 — Versioned Encounter adaptation

**Approved:** A separately versioned **M3-derived Lab adaptation in the independent Lab repository**, preserving accepted M3 v3 and its IR3-25 qualification unchanged. The Lab must have one authoritative Encounter history, not a competing social engine. Support two persistent character identities with assignable human control, extended roles, money, stock, distinct owning/holding, exact proposals and agreements, observations, persistent relationships and portable saves.

**Still pending:** Exact permitted implementation paths and an explicit separate launch instruction. This approval alone authorizes no code changes.

## M03 — Five gameplay interpretations

- **G04 — Knowledge-safe menus:** Filter only on facts the actor knows. Unknown world facts must be checked at authoritative execution and communicated only through legitimate outcomes.
- **G05 — Counteroffer limit:** In this **Lab**, apply the **two-Counter maximum per proposal chain to both human-controlled and autonomous characters**, with the same candidate eligibility. Retain T6/T8 original test wording.
- **G07 — Deposits/no-shows:** A **$5** item held for a **$2** deposit leaves **$3** owed. All reservation, pickup-deadline, payment and refund terms must be visible and frozen. If pickup is missed, the clerk may expressly release the item from reservation. On release of an unfulfilled hold, the deposit remains **refundable**; until refunded, it is a recorded obligation to the customer, with **no hidden forfeiture**. Missing pickup can reduce trust upon legitimate observation with unique causal evidence; never erase the original agreement or the late/missed event. A refundable deposit does not remove all clerk risk, so reconcile the worked decision scorecard. Keep the accepted KeyWrapping structure general; any special Lab template must be a supported presentation/handling shape, not a new grammar.

  Scorecard reconciliation: for the Lab's revised hold policy, a refundable deposit leaves a small exposure, scored the same as a hold without a deposit. Case 1 Counter changes from +2 to 0, and Case 4 Counter changes from −4 to −6. Cases 2 and 3 remain unchanged. All four selected outcomes remain unchanged. These are approved Lab scoring adjustments; the original specification and historical test wording remain preserved.

- **G10 — Exact deadline:** Completing a part **at** its due tick is on time. Ensure deterministic catch-up ordering and persisted watermarks so penalties cannot replay.
- **G12 — Spoken reason:** An NPC should state the actual factor that **flipped the decision**, if identifiable; otherwise its largest negative consideration with stable ties. Do not reveal the private scorecard.

These are bounded Lab rules and do not silently redefine the wider game.

## M04 — Source selection and provenance

**Approved:** Use the five original source archives and three foundation revisions verified under preflight **`2026-11-14-lab-pf-952b4`** and `docs/provenance/SOURCE_LOCK.json`, plus the selected corrected interaction design and decision v0.2. Preserve original archives and accepted producer histories; retain Claude's ROOM overlay as **candidate evidence**, not approved runtime. Select a final tested, pinned ROOM candidate only after M01. Use fixed scene IDs or explicitly approve an immutable scene. Preserve art quality. Check original-image and source vocabulary rights **before any public redistribution**; hashes do not establish licenses.

## M05 — Agent roles, concurrency and file ownership

**Approved:** **One Lead plus seven specialists (A1–A7)**, with a maximum of **four concurrent slots including the Lead**, subject to available capability. One accountable writer per file; the Lead coordinates integrations and changes to shared contracts. Specialist agents own their own component/unit tests. A7 owns **independent integrated/regression/release tests**, not production repairs.

Unassigned areas are allocated as follows:

| Role | Accountable ownership |
|---|---|
| Lead | Integration, release bundling, source/provenance record maintenance, contracts and current agent-file plan. Reuse canonical `docs/architecture/SYSTEM_CONTRACTS_C1_C8.md` and `docs/provenance/SOURCE_LOCK.json`; do not create duplicate `docs/contracts.md` or `docs/source-lock.json`. |
| A1 | M3-derived Lab runtime/import, authoritative identity and persistent state, economy, stock, knowledge receipt persistence, **stored warmth/trust and causal updates**, clock/save, and unit tests. |
| A2 | BASED and KeyWrapping message semantics, learned references and proposal/arrangement *meanings*, cue mapping and tests. No competing history or memory store. |
| A3 | Pure NPC decisions, scoring, personality and autonomous routines, and tests. May read stored judgments but never mutate authoritative state directly. |
| A4 | Lab-side ROOM bridge, stable scene descriptors and bindings, movement-result integration tests. No protected ROOM source edits. |
| A5 | Derived mannequin/portrait art integration, performance mapping, asset provenance, renderer and tests. Original art locked. |
| A6 | Development/Play interfaces, composer/control views and UI tests. |
| A7 | Independent contract, regression, dual-perspective, offline Windows and release proof. |

**Scheduling:** Independent Encounter/communication/decision work can proceed **in parallel** with a separately authorized Nova ROOM repair, against the agreed physical contract. The integrated physical milestone waits for the actual tested ROOM implementation.

## M06 — Windows acceptance and delivery

**Approved:** A7 performs automated and actual native-Windows offline testing on the **exact hashed delivered HTML** with external network dependencies blocked, tests both perspectives and portable save export/import, and records evidence. The owner then personally plays that **same delivered artifact** for final approval. The release must be directly downloadable and workable without developer tools; retain intended art quality.

## Remaining authorization boundaries and housekeeping

1. **M01–M06 choices are approved, not implemented or independently passed.** All current T1–T17 and B01–B26 integrated checks remain future work.
2. **No gameplay build authorization yet.** `AGENTS.md`'s production hold remains until a later explicit owner launch command names source revision, permitted paths, current lock, owners and checkpoints.
3. **No ROOM source changes yet.** They require a separate approved C6 contract and repair assignment to Nova.
4. Keep the original preflight and setup reports and `REPOSITORY_SETUP_MANIFEST.sha256` as historical snapshots. When preparing production, reference this newer decision record and produce a separately versioned current build source lock; do not falsely rewrite historical snapshots.
5. Repo visibility, sensitive metadata in public history, and backup of preflight logs are separate housekeeping tasks. A public repository or original asset possession does not grant redistribution rights.
