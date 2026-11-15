# Headless Purchase v0.1 build report

**Run** `2026-11-15-v0-1` · **Review branch** `codex/headless-purchase-v0_1-2026-11-15`
**Reviewed source baseline** `1278b705302da2b1bbd8b0edcca62d63a66fc866` · **Tested implementation commit** `27b7f93a40fecccd139007204b3ce04580409dd2`

## Scope and source

Teddy authorized one local headless exchange. Nova's review recommended that scope. The prompt pack's two listed members matched. Reviewed Phase 0 report SHA-256 `6b997bfe01db9c8090017c0be219ad8780dcf6dd406cb1110dfeb9d1a198dfb7`. The local and public baseline matched before edits. Source lock SHA-256 `63936852e774aa8a3ecc59b07d76948a9bf233651c45ac8050549dbcd1caff06` and exact C6 contract SHA-256 `55c8094417ead764421825aa19706d26137c456bbb9f2484f40c7d2d47d7afd2` were checked and preserved. [Run scope](RUN_SCOPE.md) · [Exact source inventory](HEADLESS_PURCHASE_SOURCE_MANIFEST.json)

The imported M3 subset from `76a92fd82ac5ec6f10748f0b439a5d661fff5ea5` is dependency-closed and byte-identical. `runtime.mjs` owns staged command validation, idempotent receipt return and journal installation. `contracts.mjs` supplies exact fields, typed IDs, canonical JSON and invariants used by the new modules. `views.mjs` projects grants and returns recipient history. Economy/EA-IE and KeyWrapping remain bounded design references. [Build-input record](../../provenance/build-locks/2026-11-15-v0-1.json)

| Owner | Changes |
|---|---|
| A1 | `core/purchase.mjs` owns offer, assent, separate effects and replay. `core/scenario.mjs` and `content/products.json` supply validated actors, scoped observation grants and ledger. A1 verified the three native import modules and authored core component tests. |
| A2 | `communication/purchase-meaning.mjs` compiles the exact Offer and delivered, version-linked Remark. `content/based-cues.json` uses the pinned M3 EA/SE cue kind, wording and template identifiers. Native projection gives the recipient outward cues and terms. A2 authored communication tests. |
| A3 | `decisions/clerk.mjs`, role and personality data rank the eligible options from clerk observations and outward cues. Scores, evidence IDs, explanations and tie policy remain available to the trusted inspector. A3 authored policy tests. |
| A7 | Separately designed the cross-component checks in `tests/independent/`, executed the exact candidate from a clean Git export and wrote the independent findings. |
| Lead | Created the review branch, kept the README and narrow AGENTS scope current, integrated and verified component tests, generated the trace, inventory, evidence and review ZIP. |

## Purchase trace and ledger

This is a scenario-domain fixture. Customer `actor_0001` receives scoped catalog observation `observation_0001`. The authorized clerk `actor_0002` receives the listing and availability in `observation_0002`. The unknown product produces `UNKNOWN_REFERENCE`. The sale is one sealed drink, exact unit `unit_0001`, for **300 minor units**. The clerk receives offer `message_0002` as `observation_0003`, with authored outward cues and frozen proposal `proposal_0001` v1. The role and scoped observations lead to Accept score 5, Refuse score −5, and Clarify ineligible. Reasons cite `observation_0003` and `observation_0002`. No scorecard or private BASED intent is sent as a message.

| Step | Command / recorded event | Buyer cash | Store till | Available stock | Title / holding |
|---|---|---:|---:|---:|---|
| Start | Scenario receipt `event_0001` | 1000 | 0 | 1 | `store_0001` / `actor_0002` |
| Exact assent | `command_0004`, `event_0003`, linked acceptance Remark `message_0004` | 1000 | 0 | 1 | store / clerk |
| Payment | `command_0005`, `event_0004` | 700 | 300 | 1 | store / clerk |
| Injected handover failure | `command_0006`, `event_0005`; recorded paid, unfulfilled | 700 | 300 | 1 | store / clerk |
| Partial save + payment replay | Restored rev 4 and replayed `command_0005` to the same receipt | 700 | 300 | 1 | store / clerk |
| Handover retry | `command_0007`, `event_0006` cites payment; fulfilled | 700 | 300 | 0 | buyer / buyer |
| Final save + handover replay | Restored rev 5 and replayed `command_0007` to the same receipt | 700 | 300 | 0 | buyer / buyer |

The failed handover retained payment and goods. Retry changed stock, title and holding once and granted the clerk's causal warmth change from `observation_000a`. Save validation rebuilds the run by replaying committed commands, compares receipts and rebuilt state, and swaps the active run only after validation. The comparison run assigns the human to the clerk and routes their exact assent through the same eligibility and ledger operations. Actor IDs, scoped facts, ranking and terminal balances match the same sale. [Machine-readable trace](HEADLESS_PURCHASE_TRACE.json)

## Fresh tests

Native Windows · Node **24.22.1** (bundled runner). No dependencies were installed. Execute the following commands from the review checkout with Node 24.22.1 selected. The initial Windows archive converted line endings in 11 module files. Lead regenerated the same commit with Git line-ending conversion disabled, verified all 51 files against their committed blobs, and used that exact export for the final A7 rerun. The review ZIP contains the original committed bytes.

| Actor | Command | Result |
|---|---|---|
| Lead | `node --test tests/unit/core/purchase.test.mjs tests/unit/communication/purchase-meaning.test.mjs tests/unit/decisions/clerk.test.mjs` | Exit 0. 20 pass, 0 fail, 0 skip. |
| Lead | `node docs/runs/headless-purchase-2026-11-15-v0-1/generate-trace.mjs` | Exit 0. Exact traces for both assignments and interrupted settlement. |
| A7 | `node --test tests/independent/headless-purchase.test.mjs` | Exit 0. 9 pass, 0 fail, 0 skip. |

**A7 verdict: PASS.** [Independent findings](../../../docs/reviews/HEADLESS_PURCHASE_A7_REVIEW_2026-11-15.md) · [Evidence index](HEADLESS_PURCHASE_EVIDENCE_INDEX.md)

Producer M3 48/48 and the one qualified IR3-25 failure are historical evidence from the preserved first preflight. Producer tests, browser tests and any C6 suite were outside this pass. Full acceptance matrix statuses retain their earlier scope.

## Limits and stop

The test covers one item, one exact exchange and two authored BASED deliveries. It covers retry of the outstanding handover. Compound hold/deposit/no-show, refunds, wider conversation paths and customer routines remain future work. Rules-only non-accepting decisions do not send a full outward conversational response in this slice. Real ROOM candidate, shared C6 suite and Claude browser baseline remain unavailable.

The implementation commit named above is the one A7 reviewed, with the independent tests and handoff material added in a separate local delivery commit. The delivery file inventory includes the final Git SHA, clean status, diff check and producer-byte checks. Implementation was not pushed. Teddy and Nova review this one headless proof before any later scope.

```text
HEADLESS_PURCHASE_BUILD_AUTHORIZED: true (THIS NARROW SCOPE ONLY)
HEADLESS_PURCHASE_IMPLEMENTED: true
HEADLESS_PURCHASE_A7_VERDICT: PASS
INTEGRATED_LAB_A_COMPLETED: false
ROOM_C6_RUNTIME_IMPLEMENTED: false
ROOM_STANDIN_IMPLEMENTED: false
UI_OR_OFFLINE_HTML_IMPLEMENTED: false
PUBLIC_PUSH_AUTHORIZED: false
NEXT_ACTION: STOP_FOR_TEDDY_AND_NOVA_REVIEW
```
