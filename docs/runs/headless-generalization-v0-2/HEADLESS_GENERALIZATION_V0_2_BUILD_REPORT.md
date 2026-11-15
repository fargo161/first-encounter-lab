# Headless Generalization v0.2 build report

Teddy authorized local Steps 1–5 and approved kw-expression@1 for new Lab runs. The branch is codex/headless-generalization-v0-2. The exact candidate and identification of the handoff are recorded in the [evidence index](HEADLESS_GENERALIZATION_V0_2_EVIDENCE_INDEX.md). The project is at Teddy and Nova’s review gate. [Run scope](RUN_SCOPE.md)

## Source safety

- The independent Lab started at historical delivery 9088cd2fd9bf162319e745853930f8ea2cc40375, which contains the tested v0.1 ancestor 27b7f93a40fecccd139007204b3ce04580409dd2. Local main and cached origin/main retained the previously verified public baseline 1278b705302da2b1bbd8b0edcca62d63a66fc866. Work stayed local.
- The reviewed Step 0 documents matched their approved SHA-256 values and were recorded separately as e71043d66c45239b7a9db5b2851fad58db592515. The attached final prompt matched its prompt-pack checksum.
- First Encounter Game stayed at cc8371c3c497edcdcfb8a73ec7da9dad4663847a. Its tracked worktree and index matched HEAD, and all 16 pre-existing untracked fixture bytes matched their Step 0 hashes. Step 0 reconstructed the earlier +56,639 display from committed differences and those files. The exact earlier display configuration remains unverified.
- The three imported M3 blobs equal the producer blobs at 76a92fd82ac5ec6f10748f0b439a5d661fff5ea5. The protected hashes include SOURCE_LOCK.json 63936852e774aa8a3ecc59b07d76948a9bf233651c45ac8050549dbcd1caff06, historical setup manifest aab1be793dd6b41d72600cff004ea60ee03f35ee96baf6056aec3e21ce6e87bb and approved C6 contract 55c8094417ead764421825aa19706d26137c456bbb9f2484f40c7d2d47d7afd2. The prior frozen design, reports, receipts, setup and tests at their historical checkout stay reproducible. [Source inventory](HEADLESS_GENERALIZATION_V0_2_SOURCE_MANIFEST.json)

## Implementation

1. Generalized the M3-derived Lab scenario to stable actors with independent cash, a separate store till, individual stock title and custody, and separate negotiations. Exact assent creates agreement only. A successful Pay claims the unit for that purchase until Give. The native journal still records both actions separately and conserves assets. A versioned save reconstructs exact expressions, receipts and effects by validated replay. [Expression mapping](HEADLESS_GENERALIZATION_V0_2_KEYWRAPPING_MAPPING.md)
2. Delivered Accept and Refuse as Remarks, Counter as a new Offer and Clarify as a Request for specifically missing stock or marked-price information. Reply records cite the actual addressed hearing and exact versions. Earlier versions remain visible in history, and G05 caps Counters for each actor in each chain. Character data supplies reply cues. An ambiguous or stale reference cannot bind anything.
3. Applied decision v0.2 section 7.1 as a price floor. At a 300-cent price, 200 cannot be accepted, while 300 and 400 enter ordinary scoring. A separate adverse 400 case still yields refusal. Action-resolution evidence is admitted through the trusted session, outside actor capabilities, and the external fixture only creates that evidence. A failure after payment survives serialization and reload. A new Give attempt fulfills the same paid sale once. Blind failures expose a generic action outcome.
4. Stored directed warmth and trust within −2…+2. A first completed purchase supplies one shared event cause with separate participant receipts. The delayed recipient can learn the original event later, even when a second sale completes first. Received emphatic cues can affect warmth once under their approved limits. Trust does not increase from immediate payment. The developer card records role and personality factors, passing delivery, known observations, warmth, trust, risk and all considered choices. The immediate exchange has no future exposure, so its risk points are zero.
5. Authored shopper wants and budgets in the scenario. The rules-driven customer ranks legitimately observed products and sends its own Offer through the ordinary delivery path. Its trigger names no product, price or offer. A human clerk can accept with the same menu and ledger effects as in a separate human-customer comparison. [Transaction trace](HEADLESS_GENERALIZATION_V0_2_TRACE.json)

## Limits and outstanding acceptance

The candidate uses scenario-domain observations and the bounded headless purchase language. The immediate shopper opening is Buy or Leave. Clarify is a reply to a received version. Standalone information requests, group execution, Defer, acknowledgment lifecycle, held deposits, future obligations and return visits remain outside this subset. Each run uses one authored currency. The imported M3 canonical record size bound applies. This headless pass treats each directed pair as one continuous conversation for negative emphatic-cue deduplication.

The shared Nova C6 suite and an approved real ROOM candidate are still needed. Claude’s matched browser baseline is unavailable. Physical execution, the official stand-in, art, interface, portable HTML delivery and native Windows browser acceptance remain gated. T1–T17, B01–B26 and the C6 acceptance rows retain their existing status. The full producer M3, ROOM and browser suites were not rerun. IR3-25 remains the one qualified historical M3 failure. [Acceptance matrix](../../testing/ACCEPTANCE_MATRIX.md) · [A7 review](HEADLESS_GENERALIZATION_V0_2_A7_REVIEW.md)

## Local checkpoints

All checkpoints used Node v24.22.1 and completed with exit 0 before committing.

| Step | Local commit | Applicable unit tests | Exact paths |
|---|---|---|---|
| 1 | `26caf0bc74daa668f13bb0812980ebbbbe944341` | 24 pass, 0 fail, 0 skipped | `AGENTS.md`, `README.md`, `communication/purchase-meaning.mjs`, `core/purchase.mjs`, `core/scenario.mjs`, `docs/architecture/KW_EXPRESSION_V0_2_FORMAT.md`, `docs/runs/headless-generalization-v0-2/HEADLESS_GENERALIZATION_V0_2_KEYWRAPPING_MAPPING.md`, `docs/runs/headless-generalization-v0-2/RUN_SCOPE.md`, `tests/unit/communication/purchase-meaning.test.mjs`, `tests/unit/core/purchase.test.mjs` |
| 2 | `af3d313a8fbd04949d7ca75b93e7b44ddd53aca5` | 35 pass, 0 fail, 0 skipped | `README.md`, `communication/purchase-meaning.mjs`, `content/personalities.json`, `content/roles.json`, `core/purchase.mjs`, `core/scenario.mjs`, `decisions/clerk.mjs`, `docs/architecture/KW_EXPRESSION_V0_2_FORMAT.md`, `tests/unit/communication/purchase-meaning.test.mjs`, `tests/unit/core/purchase.test.mjs`, `tests/unit/decisions/clerk.test.mjs` |
| 3 | `fef3527c5f10fcfa45c90adebed7324ea13113b4` | 39 pass, 0 fail, 0 skipped | `README.md`, `content/roles.json`, `core/purchase.mjs`, `core/scenario.mjs`, `decisions/clerk.mjs`, `tests/support/action-resolution.mjs`, `tests/unit/core/purchase.test.mjs`, `tests/unit/decisions/clerk.test.mjs` |
| 4 | `376e5d00f3c775c02d05edfcbc86501158c86c1d` | 45 pass, 0 fail, 0 skipped | `README.md`, `core/purchase.mjs`, `core/scenario.mjs`, `decisions/clerk.mjs`, `tests/unit/core/purchase.test.mjs`, `tests/unit/decisions/clerk.test.mjs` |
| 5 | `41ee3357d381bbbd029fe670cdddf9f340de6017` | 54 pass, 0 fail, 0 skipped | `README.md`, `core/purchase.mjs`, `core/scenario.mjs`, `decisions/shopper.mjs`, `docs/architecture/KW_EXPRESSION_V0_2_FORMAT.md`, `docs/runs/headless-generalization-v0-2/RUN_SCOPE.md`, `docs/runs/headless-generalization-v0-2/generate-trace.mjs`, `tests/unit/core/purchase.test.mjs`, `tests/unit/decisions/shopper.test.mjs` |
| 5 review correction | `4fbd313529bc23771d4c629eb452239110001348` | 55 pass, 0 fail, 0 skipped | `README.md`, `decisions/shopper.mjs`, `tests/unit/decisions/shopper.test.mjs` |

A7 reproduced an unavailable-item selection failure on the original Step 5 commit. A3 kept the product ranking and corrected the immediate opening to consider the next ranked item when a known restriction blocks the first. A7 reran the same probes on the corrected commit. The expression contract and assent rules stayed the same.

The final active suite passed 67 tests, including 12 independently authored A7 probes, with 0 failed and 0 skipped. The original checkout passed all 29 historical tests separately. The new suite covers the purposes of the original 29 checks and records the changed exact-price expectation and external fault fixture. [Regression map](HEADLESS_GENERALIZATION_V0_2_REGRESSION_MAP.md)

## Stop status

```text
HEADLESS_V0_2_SCOPE_AUTHORIZED: true
KW_EXPRESSION_V0_2_FORMAT_APPROVED: true
HISTORICAL_V0_1_PRESERVED: true
V0_2_TESTS_PASS: true (67 pass, 0 fail, 0 skip)
V0_2_A7_VERDICT: PASS
INTEGRATED_LAB_A_COMPLETED: false
REAL_ROOM_C6_ACCEPTED: false
ROOM_STANDIN_IMPLEMENTED: false
PLAYABLE_UI_IMPLEMENTED: false
HOLD_DEPOSIT_RETURN_IMPLEMENTED: false
PUBLIC_PUSH_AUTHORIZED: false
NEXT_ACTION: STOP_FOR_TEDDY_AND_NOVA_REVIEW
```
