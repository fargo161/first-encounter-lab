# A7 independent review of Headless v0.3 Part A

**Result: PASS** for A0–A4 on candidate `ef18d2f31f5407405d586b71de9b2fe588602f00`, tree `5f4fcd1cd42d2c6be3117ebfe17ac388cbb99846`. The clean export passed the 91 existing candidate tests and 11 new independent probes on Node v24.22.1. All exits were 0, with zero failures, cancellations or skips. The original v0.1 runner independently passed its 29 historical tests. The review found no Part A defect requiring a production correction.

The clean export archive SHA-256 was `274ddb3c308c97fc363e22904f8da133deb7dacee41b40a20fd3f6813b3b52fa`. A7 checked 21 changed, production and dependency paths against committed Git blobs before adding the probes. After testing, 35 unique tracked paths, including all candidate tests and v0.2 evidence in the generalization run folder, matched their committed blobs. The independent probe file's SHA-256 is `4b9fd16fd767a5149147e66b20562ddd3c80f9294ec44ec68af1c5126389b17a`. A7 wrote the probes and this report in the disposable export and authored no production code.

| Protected file | SHA-256 on the reviewed candidate |
|---|---|
| Approved Room C6 contract | `55c8094417ead764421825aa19706d26137c456bbb9f2484f40c7d2d47d7afd2` |
| Original source lock | `63936852e774aa8a3ecc59b07d76948a9bf233651c45ac8050549dbcd1caff06` |
| Historical setup manifest | `aab1be793dd6b41d72600cff004ea60ee03f35ee96baf6056aec3e21ce6e87bb` |
| Authored delivery cues | `ed64f5cfdd5680702f5cebc3a08e47a6768a9589a329a7599a9a2cd0f9c3517c` |

Git diff from the v0.2 delivery baseline `c77a19c5d2cf294279d1be9208343497bbb3246f` showed identical frozen vendor dependencies and protected files above. The A4 checkpoint changes the worked document and README only. The draft is still awaiting the owner's meaning decision. The review covers the authorized headless scope and the A4 paper artifact.

## Commands and outcomes

Each command used Node v24.22.1 from the root of its respective export.

| Run | Exit | Pass | Fail | Skip |
|---|---:|---:|---:|---:|
| Candidate suite before adding independent probes | 0 | 91 | 0 | 0 |
| Candidate suite and A7, with frozen v0.2 save inputs | 0 | 102 | 0 | 0 |
| A7 alone with ordinary portable inputs | 0 | 11 | 0 | 0 |
| Historical v0.1 at `9088cd2fd9bf162319e745853930f8ea2cc40375` | 0 | 29 | 0 | 0 |

The combined command was

    node --test tests/unit/core/purchase.test.mjs tests/unit/communication/purchase-meaning.test.mjs tests/unit/decisions/clerk.test.mjs tests/unit/decisions/shopper.test.mjs tests/independent/headless-purchase.test.mjs tests/independent/headless-part-a.test.mjs

For the initial 91-test check, omit `tests/independent/headless-part-a.test.mjs`. The portable A7-only command is `node --test tests/independent/headless-part-a.test.mjs`. The historical v0.1 command was

    node --test tests/unit/core/purchase.test.mjs tests/unit/communication/purchase-meaning.test.mjs tests/unit/decisions/clerk.test.mjs tests/independent/headless-purchase.test.mjs

The combined run set `LAB_A7_PART_A_V02_SAVE` to the frozen v0.2 loop save and `LAB_A7_PART_A_V02_RUNNER` to the v0.2 export's `core/purchase.mjs`. The concrete 32,794-byte save has SHA-256 `c386f433faf55969fcd6a78e220133a925609df97d77453c3be65dee32292aed`. The historical runner accepted it and saved identical bytes. Part A raised `INCOMPATIBLE_SAVE_VERSION`, named the historical v0.2 commit and preserved the live Part A save byte for byte. For the portable run the test exercised the same version gate using an in-memory old envelope. The live Part A schema was `lab-headless-generalization-save@2` and its expression label remained `kw-expression@1`.

## Independent probes

| Probe | Observed result |
|---|---|
| A7-01 | Four same-version attempts, including after restore, produced one receipt. Replaying the exact command yielded a replay result, and a distinct proposal could ask separately. |
| A7-02 | A previous version's question, a forged digest, a copied receipt and a foreign actor were rejected without state changes. An accepted answer targeted the current version, and replay introduced no duplicate event. |
| A7-03 | A human could Refuse a missing-price offer before and during a pending question. The recorded refusal targeted the original version and closed its question. |
| A7-04 | Both human roles could choose Decline irrespective of their evidence. For each role, outward words, framing, reason and missing-fact tag matched the known and unknown runs. A rule-controlled asker followed with one refusal naming the missing fact. |
| A7-05 | A rule-controlled addressee told its observed value or declined with the no-evidence line. A manually supplied answer choice was rejected. The rule-controlled asker followed with agreement or refusal according to what it received. |
| A7-06 | The customer opened at 250, the clerk received a price-only Tell of 250, and the native run recorded an agreement to the exact version. Actual price 300 blocked payment with `ACTION_UNAVAILABLE`. Both actor views and the entire ledger stayed identical across the rejection, and no payment or handover was recorded. |
| A7-07 | A $2 clerk opening was blocked by the hard floor. The customer could Accept a $4 offer, pay 400 once and settle the handover. Across both controller assignments a Counter changed the exact same negotiation to $3 and the next assent targeted the delivered counter receipt. |
| A7-08 | The authorized clerk saw a custom till of 711 and separate own cash of 45. The buyer and observer received neither the till nor its amount, including through guessed IDs. Removing `take_payment` in an isolated configuration process removed the clerk till while keeping personal cash. |
| A7-09 | The old @1 route and live-state preservation worked with both the portable envelope and the real archived save. |
| A7-10 | The canonical format and matrix copy had identical origins sections. Both grouped hold expressions were rejected by the current validator. The conceptual request, counter and assent carried exact digests, and the draft balance, refund and release arithmetic matched the owner terms. |
| A7-11 | An initial price question resolved to a distinct stock question. The rule-controlled actor could Tell an observed false stock value, and the two questions both recorded their individual answer state. |

## Field and A4 review

A7 checked the complete expression checker and its origin inventory against the accepted function, force, temporal and reply branches, exact reference scope, both Pay and Give action shapes, and the Tell and Decline additions. The matrix shows 65 named field and path entries and 33 literal entries, with variable domains and pending question records stated separately. It identifies the M3 package reference wire fields, the Lab hash derivation, the Lab's exact proposal/version and observation references, and the distinct paper Tell shape. The authored compatibility tests in the 91-test suite also rechecked the frozen v0.2 trace digest and all 18 distinct expressions.

The A4 paper artifact carries the draft warning, outlines the express-release and separately paid refund, includes the C07–C09 and C12 checklist and treats the cutoff as inclusive under G10. Its tree terms and draft clock are clearly marked for owner approval. No grade is given here for the future hold runtime, ROOM, C6 integration, browser acceptance, remaining delivery styles, standalone information requests or future obligation support.
