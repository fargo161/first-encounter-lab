# Headless v0.3 Part A build report

The independent Lab branch codex/headless-v0-3-part-a-2026-11-15 is at the Teddy/Nova review stop. A1–A3 update immediate headless dialogue and projection. A4 is a proposed hold meaning and paper test plan. The exact production/documentation candidate is ef18d2f31f5407405d586b71de9b2fe588602f00, Git tree 5f4fcd1cd42d2c6be3117ebfe17ac388cbb99846. The local evidence commit adds this handoff and the independently authored probes.

## A0 and sources

- The supplied ZIP was readable and matched SHA-256 50a79499163df9322c93e7422222f4805776acf42db1c68b43929b6aef149798. Its four files included the owner-rules prompt and code/field review, which matched d56cf5cb1424dc2ddb2b34bc9baf02d426371438338a962a19ca2df618f9f057 and 1f02f2dd339e07fc7a7dc229888a6c362a370ed4a47f4da2c56db8fd944f7fe9. Teddy's message supplied the authority.
- The Lab Git root and origin resolved to the standalone first-encounter-lab repository. It started clean at c77a19c5d2cf294279d1be9208343497bbb3246f, with reviewed production ancestor 4fbd313529bc23771d4c629eb452239110001348. The 12 runtime and 20 protected v0.2 manifest hashes matched before work. Node v24.22.1 passed all 67 v0.2 tests and, in a separate historical export, all 29 v0.1 tests.
- The First Encounter Game branch codex/economy-substrate-v0.1-accepted-baseline remained at cc8371c3c497edcdcfb8a73ec7da9dad4663847a. Its tracked working tree and index matched HEAD. All 16 pre-existing untracked fixture files matched the Step 0 hashes. Selected paper inputs matched their Git blobs at that pin. The inherited +56,639 reconstruction remains 55,376 committed additions plus 1,263 untracked fixture lines.
- M3 stays pinned at 76a92fd82ac5ec6f10748f0b439a5d661fff5ea5, with the native validation, observation projection, receipts and journal and the historical IR3-25 qualification. The historical source lock (63936852e774aa8a3ecc59b07d76948a9bf233651c45ac8050549dbcd1caff06), setup manifest (aab1be793dd6b41d72600cff004ea60ee03f35ee96baf6056aec3e21ce6e87bb) and approved C6 contract (55c8094417ead764421825aa19706d26137c456bbb9f2484f40c7d2d47d7afd2) retain their exact bytes. [Source manifest](HEADLESS_PART_A_SOURCE_MANIFEST.json)

## What changed

- **A1.** The unmodified v0.2 probe committed four distinct questions against proposal_0001 v1. Part A binds one question to the asker, missing fact and exact offer version, with the actual recipient and hearing. Pending questions survive save/reload. A repeated rule response waits, with no new question or decision. A human can Refuse while the fact is missing under R1. Answering requires the exact recipient, question and hearing. A human can Tell a legitimately held fact or Decline. Human Decline produces identical outward wording with or without the fact. A rules addressee Tells when it has the fact and otherwise Declines without scoring. A rules asker re-decides after Tell or delivers one Refuse naming the missing fact after Decline under R2. [Decision register](../../decisions/DECISION_REGISTER.md#owner-approved-part-a-amendments-r1-and-r2)
- **A2.** In the frozen defect probe the human buyer's menu for a clerk's $4 offer on a known $3 item was Refuse/Counter. The customer's authored highest acceptable listed price now supplies a negotiable insisted term. Accept, Refuse and a $3 Counter remain eligible. The decision computes role weights, observed marked price, authored budget, personality, received delivery and directed judgment. The G05 limit and G12 reason rule still apply. A true $4 acceptance pays and settles $4. The clerk's hard $3 floor stays in place, including for authoritative checkout.
- **A3.** The format origin register derives from each actual accepted shape. The status block is back at the top of README. The actor view derives one separate storeTill projection from the existing authored take_payment permission. Personal cash remains separate. The unauthorized view exposes neither a ledger/account list nor a getter keyed by a guessed account ID. A permission-removal test uses an isolated runtime with that role capability absent. [Field and value origins](HEADLESS_PART_A_KW_FIELD_ORIGIN_MATRIX.md)
- **A4.** The hold draft covers the exact $5 item, $2 credited deposit, $3 balance, deadline, stock reservation, explicit release, refundable debt and separate transfer. The JSON draft links exact request, counter and acceptance hashes. A documentation check calculated the hashes, verified credit and inclusive edge, and verified the current compiler refuses the unsupported Request/Counter. Whole runtime and independent tests remain on immediate purchases. [A4 paper draft](../../architecture/HEADLESS_HOLD_DEPOSIT_EXPRESSION_WORKED_EXAMPLE_v0_3_DRAFT.md)

## Recorded clarification conversation

The exact outward text and stored meanings below come from the deterministic trace. Tell and Decline are two separate runs. Each has its own run-qualified references. [Short trace](HEADLESS_PART_A_TRACE.json)

| Actual communication | Recipient hearing |
|---|---|
| What is the list price? I need to know the marked price of this item. | Tell run, clerk to customer, observation_0004 |
| As far as I know, the list price is 250 minor units. | Tell run, customer to clerk, observation_0005 |
| I decline to answer. | Decline run, customer to clerk, observation_0005 |
| Refuses proposal proposal_0001, version 1. I cannot decide without list_price. | Decline run, one rules Refuse of the original offer, observation_0006 |

### Complete stored Ask and its pending state

```json
{
  "addressees": [
    "actor_0001"
  ],
  "body": {
    "act": "Clarify",
    "actor": "actor_0002",
    "missing": "list_price",
    "node": "action",
    "reason": "I need to know the marked price of this item.",
    "recipient": "actor_0001",
    "target": {
      "expression": {
        "digest": "3e009aeacdf94334beff2f10d1363a28ecc0ebe908a850d00037fd296c71e9b1",
        "id": "message_0001",
        "scope": {
          "packageRef": {
            "digest": "22457aed6a08d9ac64654f7b2800d1a2e2b5d63d7a304fde001ac018df24b78d",
            "id": "package_0001",
            "revision": 3
          },
          "producer": "first-encounter-lab",
          "runId": "run_0331"
        },
        "version": 1
      },
      "observationId": "observation_0003",
      "proposalId": "proposal_0001",
      "proposalVersion": 1
    }
  },
  "force": "request",
  "function": "REQUEST",
  "id": "message_0002",
  "proposal": {
    "id": "proposal_0001",
    "parent": null,
    "version": 1
  },
  "schema": "kw-expression@1",
  "scope": {
    "packageRef": {
      "digest": "22457aed6a08d9ac64654f7b2800d1a2e2b5d63d7a304fde001ac018df24b78d",
      "id": "package_0001",
      "revision": 3
    },
    "producer": "first-encounter-lab",
    "runId": "run_0331"
  },
  "speaker": "actor_0002",
  "time": {
    "stance": "current"
  },
  "version": 1
}
```

```json
{
  "askerId": "actor_0002",
  "recipientId": "actor_0001",
  "missing": "list_price",
  "messageId": "message_0002",
  "observationId": "observation_0004",
  "status": "pending"
}
```

### Complete stored Tell

```json
{
  "addressees": [
    "actor_0002"
  ],
  "body": {
    "act": "Tell",
    "actor": "actor_0001",
    "fact": {
      "productId": "subject_0001",
      "unitId": "unit_0001",
      "value": 250
    },
    "missing": "list_price",
    "node": "action",
    "recipient": "actor_0002",
    "target": {
      "expression": {
        "digest": "fafd0589608625f650393c28e9128100a36053eb77865399877d0f5877e96829",
        "id": "message_0002",
        "scope": {
          "packageRef": {
            "digest": "22457aed6a08d9ac64654f7b2800d1a2e2b5d63d7a304fde001ac018df24b78d",
            "id": "package_0001",
            "revision": 3
          },
          "producer": "first-encounter-lab",
          "runId": "run_0331"
        },
        "version": 1
      },
      "observationId": "observation_0004",
      "proposalId": "proposal_0001",
      "proposalVersion": 1
    }
  },
  "force": "currentSelfPerformance",
  "function": "REMARK",
  "id": "message_0003",
  "proposal": {
    "id": "proposal_0001",
    "parent": null,
    "version": 1
  },
  "schema": "kw-expression@1",
  "scope": {
    "packageRef": {
      "digest": "22457aed6a08d9ac64654f7b2800d1a2e2b5d63d7a304fde001ac018df24b78d",
      "id": "package_0001",
      "revision": 3
    },
    "producer": "first-encounter-lab",
    "runId": "run_0331"
  },
  "speaker": "actor_0001",
  "time": {
    "stance": "current"
  },
  "version": 1
}
```

### Complete stored Decline (separate run)

```json
{
  "addressees": [
    "actor_0002"
  ],
  "body": {
    "act": "Decline",
    "actor": "actor_0001",
    "missing": "list_price",
    "node": "action",
    "reason": "I decline to answer.",
    "recipient": "actor_0002",
    "target": {
      "expression": {
        "digest": "821c3bf80be422edd6bf50854096405a66cc8632690dc4f083d5993c35ce2501",
        "id": "message_0002",
        "scope": {
          "packageRef": {
            "digest": "22457aed6a08d9ac64654f7b2800d1a2e2b5d63d7a304fde001ac018df24b78d",
            "id": "package_0001",
            "revision": 3
          },
          "producer": "first-encounter-lab",
          "runId": "run_0332"
        },
        "version": 1
      },
      "observationId": "observation_0004",
      "proposalId": "proposal_0001",
      "proposalVersion": 1
    }
  },
  "force": "currentSelfPerformance",
  "function": "REMARK",
  "id": "message_0003",
  "proposal": {
    "id": "proposal_0001",
    "parent": null,
    "version": 1
  },
  "schema": "kw-expression@1",
  "scope": {
    "packageRef": {
      "digest": "22457aed6a08d9ac64654f7b2800d1a2e2b5d63d7a304fde001ac018df24b78d",
      "id": "package_0001",
      "revision": 3
    },
    "producer": "first-encounter-lab",
    "runId": "run_0332"
  },
  "speaker": "actor_0001",
  "time": {
    "stance": "current"
  },
  "version": 1
}
```

The Decline run has its own identical pending-state shape and its own exact Clarify expression, both present in the trace. The actual question and answer IDs are persisted in the appropriate proposal entry. The authoritative journal records the actual communication, receipt and any follow-up in sequence through the same native command boundary.

### Paper Tell comparison

The pinned JSON_RECORD_FAMILY.md Illustrative sense crosswalk uses tell.content and roles.actor, roles.recipient, contentTopic, reportMode and truthWarranty. Its Partial fulfillment example stores tellReport, selectedContent with claim/attribution, tellEmission.actualSource and tellReceipt. The Lab uses act Tell with flat actor/recipient IDs, the requested fact name and concrete product/unit/value, and the exact received Clarify target with offer-version provenance. The body carries only the one selected fact, and the speaker identifies its origin. The single report mode and lack of warranty are fixed behavior. The trusted answer event points to the source observation. The addressed native hearing supplies the listener's evidence. The chosen local field names follow the scoped meaning of the paper rather than assigning a new cross-game wire contract.

### Told $2.50, actual price $3

The customer started with a 250-minor-unit observation and offered 250. The clerk knew availability and lacked the price. After its one question and the customer's legitimate Tell, the clerk's price reference pointed to the received observation_0005 and showed 250. Its deterministic reply accepted the exact original offer. Actual checkout compared with the canonical 300 price and returned ACTION_UNAVAILABLE to the actor. Both actor views and all assets stayed unchanged after the attempt. No payment or handover event or receipt was committed. The original proposal's status is **agreed**, with agreementEventId event_0006, no paymentEventId and no handoverEventId. The existing agreement and its attributed basis are durable. The true 300 amount appears here as privileged review evidence.

### Save and expression compatibility

New saves identify lab-headless-generalization-save@2. Versioned replay now includes question state and revised policies and still reconstructs state from the single native journal. The loader gives explicit historical-runner guidance and rejects the old generalization @1 before replacing live state. A real 32,794-byte @1 prior save produced and restored at c77a19c has SHA-256 c386f433faf55969fcd6a78e220133a925609df97d77453c3be65dee32292aed. Part A rejected those exact bytes as INCOMPATIBLE_SAVE_VERSION and left its live save unchanged. The original v0.1 loader boundary remains historical and separately tested.

The expression format remains **kw-expression@1**. The added Tell and Decline meanings are scoped replies. Original field meanings and supported forms are preserved. A compatibility test checked the frozen trace's exact SHA and accepted all 18 distinct v0.2 expressions, covering ordinary Offers, Counter, Accept, Refuse and Clarify. The initial capability test enumerated only the three prior actor methods. The successor enumerates the exact addition questionMenu and retains the privileged-access checks. Price and capped-customer tests explicitly replace the old prohibition expectation while preserving Counter, independent version, price-floor and privacy purposes.

## Checkpoints and tests

| Step | Commit | Checkpoint suite (Node v24.22.1, exit 0) | Changed paths |
|---|---|---|---|
| A1 | 99b64c362bcc9f86b8e7635c7179a707aff728ae | 83 pass, 0 fail, 0 skip | `communication/purchase-meaning.mjs`, `core/purchase.mjs`, `core/scenario.mjs`, `decisions/clerk.mjs`, `docs/decisions/DECISION_REGISTER.md`, `tests/independent/headless-purchase.test.mjs`, `tests/unit/communication/purchase-meaning.test.mjs`, `tests/unit/core/purchase.test.mjs`, `tests/unit/decisions/clerk.test.mjs` |
| A2 | 5989e0511bbf1f67ba238c175b0bceeb836be7ac | 89 pass, 0 fail, 0 skip | `content/roles.json`, `core/purchase.mjs`, `decisions/clerk.mjs`, `tests/unit/core/purchase.test.mjs`, `tests/unit/decisions/clerk.test.mjs` |
| A3 | 6c55f2abfbc4691725e96b45592a955bf80d78d8 | 91 pass, 0 fail, 0 skip | `README.md`, `core/scenario.mjs`, `docs/architecture/KW_EXPRESSION_V0_2_FORMAT.md`, `docs/runs/headless-v0-3-part-a-2026-11-15/HEADLESS_PART_A_KW_FIELD_ORIGIN_MATRIX.md`, `tests/unit/core/purchase.test.mjs` |
| A4 | ef18d2f31f5407405d586b71de9b2fe588602f00 | 91 pass, 0 fail, 0 skip | `README.md`, `docs/architecture/HEADLESS_HOLD_DEPOSIT_EXPRESSION_WORKED_EXAMPLE_v0_3_DRAFT.md` |

The final suite passed 102 tests, including 11 new independent A7 probes, with 0 failed and 0 skipped. A7 verified the exact clean export, with archive SHA-256 274ddb3c308c97fc363e22904f8da133deb7dacee41b40a20fd3f6813b3b52fa. A7 authored its own new probes and did not write the reviewed production code. [Test output and commands](HEADLESS_PART_A_TEST_RESULTS.txt) · [Independent findings](HEADLESS_PART_A_A7_REVIEW.md)

## Pending approval and limits

Teddy's remaining decision is the A4 representation and its exact proposed meanings, including activation after deposit, endpoint and clock anchor, pickup proof, late pickup, express release, and store refund authority. These draft choices are recorded in the worked example. The report does not request broader authority. The next action is Teddy/Nova review. The actual ROOM runtime and shared C6 suite, Claude's matched browser baseline, stand-in, UI, artwork, remaining delivery styles, deadlines, held stock, deposits, refund execution and return flows stay outside Part A. The frozen acceptance matrix is retained.

PART A COMPLETE — A4 HOLD MEANING NOT YET APPROVED — PART B NOT AUTHORIZED — STOP FOR TEDDY/NOVA REVIEW.
