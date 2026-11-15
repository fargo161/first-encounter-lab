# KeyWrapping storage compatibility review

**Step 0 · 15 November 2026 · Decision for Teddy**

**Recommendation.** Approve one versioned KeyWrapping expression tree for new v0.2 runs, using `kw-expression@1` as the proposed format name. It would record who says what, who must do each part, and the exact terms each person received. Preserve the v0.1 runner and saves as they are. Have v0.2 explicitly reject a v0.1 save and direct the user to v0.1 to replay it. Start a fresh run in v0.2. No format was approved or changed in Step 0.

## The same $3 drink deal, side by side

Current values come from an actual v0.1 run inspected in memory. The right column illustrates the proposal. Its field and sense names need your approval. Short IDs stand for references qualified within the same saved run and package, so two separate stories cannot accidentally share an item or a proposal.

| Part of this deal | v0.1 storage today | Recommended expression |
|---|---|---|
| Offer | `schema: "lab-purchase-message@0.1"`, `outward.family: "Offer"`, `act: "propose_exchange"`, customer `senderId: "actor_0001"`, clerk `recipientIds: ["actor_0002"]`. | `schema: "kw-expression@1"`, `function: "OFFER"`, customer `speaker: "actor_0001"`, clerk `addressees: ["actor_0002"]`, `force: "proposal"`, `time: {stance: "future"}`. The offer is spoken now. The promised acts come later at settlement. |
| What is traded | `outward.terms.exchange: [{act: "Pay", amountMinor: 300}, {act: "Give", productId: "subject_0001", unitId: "unit_0001"}]`. The runtime assigns the roles and treats the amount as the scenario's minor units. | `body: {node: "exchange", offered: Pay term, requested: Give term}`. **Offered** is an action with term ID `pay`, actor customer, destination the store till `store_0001`, and quantity `{amount: 300, unit: "cent"}` for this $3 fixture. **Requested** is an action with term ID `give`, actor clerk acting for the store, recipient customer, and item `unit_0001` of type `subject_0001`, transferring title and custody. |
| When it happens | Array position identifies Pay and Give. The runtime separately requires payment before handover. No deadline or condition field lives in the offer. | The two named sides form a single exchange. Record the settlement order explicitly as Pay then Give, with no agreed deadline for this example. The transfer still needs its own validated effect. |
| Exact acceptance | `proposalId: "proposal_0001"`, `version: 1`. Clerk sends a linked `Remark` with `act: "accept_exchange"`, `contextMessageId: "message_0001"`, and a copy of those terms. | Linked `REMARK` with `force: "currentSelfPerformance"`, `time: {stance: "current"}`, and an Accept action by the clerk targeting `proposal_0001` version 1 and its exact received expression revision. Record the buyer's own offered undertaking under the approved Lab D3 rule. The seller's assent must still be delivered and valid. |
| What each person receives | The clerk's `encounter-observation@2` record `observation_0003` links to `message_0001` and contains the outward terms. `privateComposition` and the decision score stay in trusted data. Payment and handover have separate event IDs. | Keep expression, message delivery, recipient receipt and actual effects distinct. An acceptance cites the clerk's received terms. A reference to the exact expression cannot expose any part the holder did not receive. Keep private delivery intent and scoring in trusted data and retain the effect and receipt IDs for replay. |

For all three Functions, store the purpose of the speech separately from the action described. A **Request** can ask the other person to act, an **Offer** proposes reciprocal terms, and a **Remark** can accept those exact terms or describe something that already happened. v0.1 emits only the purchase Offer and acceptance Remark. It distinguishes them with fixed act tags and handlers. It has no general stored field for force or time. The proposed tree can store an action or an explicit group as a child of either side. It can also say exactly what an AND, IF or time condition applies to. Stored nesting by itself gives the composer and engine no new permission to use or execute it.

## What v0.1 actually saves

- The top-level `lab-headless-purchase-save@1` has `schema`, `scenario` and `run`. The scenario stores `buyerCashMinor`, `clerkStockObservation`, `failFirstHandover`, `humanId`, `runId`, `stock` and `tillMinor`.
- The `encounter-run@2` contains `id`, `packageRef`, `revision`, `data` and `journal` in addition to its schema. The saved data contains `actors`, `catalog`, `decisions`, `events`, `judgments`, `ledger`, `messages`, `observations` and `proposals`. The journal records each committed `encounter-command@2` and its receipt. Command ID, session, expected revision and exact payload identify the accepted operation. An exact retry returns the original receipt.
- A stored message keeps its schema, message ID, command ID, sequence, context message link, private composition and outward fields. Outward fields include the function and act, sender and recipients, subject IDs and scope, content, cues, prominence and exact terms. A single `proposal_0001` has successive versions. The frozen material fields are ID/version, buyer, seller, product, unit, amount and offer message. Status and links for agreement/payment/handover record what happened afterward.
- Restore reconstructs the run using the old scenario, journal and handlers, verifies each receipt and the whole rebuilt state, then replaces the active run. The inspected v0.1 save restored byte-for-byte in memory. Its journal retained the separate payment and failed handover, with buyer cash 700, till 300 and stock still 1. No save file was created.

## What the change buys and costs

**Gain.** The proposer can be the clerk or customer without changing which party owes each action. New supported deals can use the same shape. An exact version and its received terms can survive a counteroffer without relying on array order, prose or a hard-coded buyer-first convention. The ledger and M3 journal stay authoritative.

**Cost.** The one $3 fixture can be translated if its pinned scenario supplies the missing parties, money unit and rules. The old array alone cannot recover those fields or express missing timing, role or grouping choices. Rewriting it inside a save would also change the messages and receipts the v0.1 replay expects. A new format needs validation of roles, units, references, actual receipt and exact-version assent, plus a save-version boundary. Keep one durable meaning record per expression revision. Derive readable text and scoped views from it, retaining evidence of what was delivered. Avoid a second writable terms format or a second ledger. Leave old saves on the original runner rather than creating a migration that guesses.

## Evidence

[Lab interaction design D4](../../design/FIRST_ENCOUNTER_LAB_INTERACTION_DESIGN.md#d4-how-complicated-can-one-message-be), D3, D6 and the approved Lab formation policy govern current scope. I compared them with the following KeyWrapping design files at First-Encounter-Game commit `cc8371c3c497edcdcfb8a73ec7da9dad4663847a`. They describe the general model and paper examples. They provide no installed JSON serializer or ratified spellings.

- `EXPRESSIONS_COMPATIBILITY.md`, Proposed meaning nodes and Function, force, time and target. SHA-256 `d6f0250105d8de64dc0385fedef24ad9e20c75bbaf2dca17b4978eadfd78594d`.
- `TRANSACTIONS_COMMITMENTS.md`, §§2–5 and C01–C09. SHA-256 `26c04efeaf6131d6a0cbf58098c910312ed71e893fa6af740b37d0857e337684`.
- `JSON_RECORD_FAMILY.md`, notation, record family and grouped warehouse example. SHA-256 `5e05d3670ce1d65062dbc39b15a32bf22c8d9ec3e2faf287a2750d7702a3690e`.

Checked [message compiler](../../../communication/purchase-meaning.mjs), [purchase journal and restore](../../../core/purchase.mjs), and [reviewed v0.1 trace](../headless-purchase-2026-11-15-v0-1/HEADLESS_PURCHASE_TRACE.json). The separate in-memory paid-but-unfulfilled save inspected here had SHA-256 `176073470c24f11619ee1652e18bfaf53c122a5397aef655077d9192bcdeaa46`. The two intended outcomes are historical v0.1 replay and a separately approved v0.2 format. This report does not authorize a loader change or Steps 1–5.
