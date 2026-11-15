# Headless v0.3 worked example for the $5 hold and refundable deposit

**PROPOSED / NOT IMPLEMENTED / NOT YET OWNER APPROVED**

This paper fixture models the approved G07 money terms and the G10 inclusive boundary. Its activation, deadline anchor and draft wire spellings still need Teddy's A4 sign-off. The example uses customer actor_0001, clerk actor_0002 acting for store_0001, and one labeled $5 item subject_04a0/unit_04a0. Its proposed pickup deadline is **the tenth Lab step after this exact agreement forms, including that step**. The duration is an illustrative authored quantity. The anchor event and the future clock supply the due tick.

## Plain speech and corresponding records

| Spoken or observable step | Proposed expression or Encounter evidence |
|---|---|
| Customer asks, “Hold this $5 item for me through the tenth step after we agree.” | REQUEST, proposal_04a0 v1. The requested clerk reservation names the precise unit and inclusive end of the promised pickup window. The request creates no payment or binding agreement. |
| Clerk counters, “I’ll hold it when your $2 deposit is paid. That deposit goes toward the $5, so bring $3 at pickup. I can release it if you miss pickup. If I release it without filling the order, I owe you the $2 back. I can still honor a late pickup before I release it.” | OFFER, proposal_04a0 v2. The actual clerk hearing of v1 is recorded, and the Counter references it exactly. The new version freezes all terms together. V1 and its hearing remain in history. |
| Customer hears the Counter and says, “I accept v2 as you just offered it.” | REMARK with current self-assent, actual hearing observation_04a2 and the exact v2 digest. Under Lab P2 the clerk's Offer counts for the clerk's undertaking. The received exact customer acceptance forms the agreement. |
| Customer pays $2 at the opening. The clerk sets aside that unit. | Recheck that the unit can be reserved before charging. Record the actual successful $2 cash transfer and credit it to the principal once. The authorized reservation then makes the unit unavailable to competing buyers while title and custody remain with the store/clerk. The customer owes $3 toward the same $5. |
| Customer arrives and pays $3 by the inclusive cutoff. The clerk gives the unit. | The pickup record identifies the still-reserved unit. A separate $3 transfer closes the balance. The separate handover moves title and custody and fulfills the reservation. The one price obligation has been credited $2 + $3. |
| Customer misses the cutoff and the clerk expressly releases the unfulfilled reservation. | The overdue or missed fact is independently recorded from the proof available at the boundary. The reservation stays active until an authorized explicit release or fulfillment. Once released, the paid deposit creates a distinct $2 refund obligation against the store, still owed until separately paid. |
| Before release the clerk honors a late pickup and the buyer pays. | The retained original deadline makes the later performance both done and late. Once the part is performed it no longer contributes outstanding overdue exposure. The historical miss stays recorded. |
| Store actually repays the $2 after the authorized release. | A new store-to-customer money transfer satisfies the refund duty. Its validated effect has its own ID and credits only the refund. The opening $2 transfer and its original effects remain in history. |

## Complete illustrative expressions

The three records below share the same draft package/run scope. Digests identify the hypothetical canonical JSON values. Observation IDs stand for hypothetical addressed hearings by the indicated addressees. The paper chain uses the existing expression envelope as a proposal. **The complete trees and sequence are conceptual.** The current headless compiler rejects unsupported shapes as a whole. The wired Clarify Request, immediate Pay/Give Offer, and exact Accept support do not execute this example.

- **Conceptual nodes here** are AND, IF, BEFORE, AFTER and UNTIL, and the associated group, timing, condition and attachment fields. The paper KeyWrapping already describes these group types. The current Lab recognizes exchange with two direct immediate action children.
- **Conceptual senses and handlers here** are Reserve, authorized release, marked late pickup, clause-bound deposit and balance allocation, contingent handover and payout by Pay from the store to the customer. Pay and Give already exist in the immediate sale subset. Their use under these new groups, action routes and duties is conceptual.
- **Conceptual added fields here** include groupId/items, phase/condition/consequence, anchor/offset/boundary/endpoint, price/pickup, releasePolicy/retention, allocation/timing and from/refundOfTermId. The draft request's future stance and Counter to a Request also require later admission. They do not change the meaning of accepted Part A Offer and reply records.

### Draft v1 Request

```json
{
  "schema": "kw-expression@1",
  "id": "message_04a1",
  "version": 1,
  "scope": {
    "producer": "first-encounter-lab",
    "runId": "run_04a0",
    "packageRef": {
      "id": "package_04a0",
      "revision": 1,
      "digest": "064049445d68e71f43c6a89f281730ce974c033055eb1fa1a0fc85950ff59a98"
    }
  },
  "function": "REQUEST",
  "speaker": "actor_0001",
  "addressees": [
    "actor_0002"
  ],
  "force": "request",
  "time": {
    "stance": "future"
  },
  "proposal": {
    "id": "proposal_04a0",
    "version": 1,
    "parent": null
  },
  "body": {
    "node": "UNTIL",
    "body": {
      "node": "action",
      "act": "Reserve",
      "termId": "reserve",
      "actor": "actor_0002",
      "for": "store_0001",
      "recipient": "actor_0001",
      "item": {
        "productId": "subject_04a0",
        "unitId": "unit_04a0"
      },
      "releasePolicy": "express_clerk_release_after_missed_pickup",
      "retention": "until_fulfilled_or_expressly_released"
    },
    "condition": {
      "clock": "lab_step_clock",
      "anchor": "applies_to_this_agreement_formed",
      "offset": {
        "amount": 10,
        "unit": "step"
      },
      "inclusive": true
    },
    "endpoint": "timely_pickup_window"
  }
}
```

### Draft v2 Counter

```json
{
  "schema": "kw-expression@1",
  "id": "message_04a2",
  "version": 1,
  "scope": {
    "producer": "first-encounter-lab",
    "runId": "run_04a0",
    "packageRef": {
      "id": "package_04a0",
      "revision": 1,
      "digest": "064049445d68e71f43c6a89f281730ce974c033055eb1fa1a0fc85950ff59a98"
    }
  },
  "function": "OFFER",
  "speaker": "actor_0002",
  "addressees": [
    "actor_0001"
  ],
  "force": "proposal",
  "time": {
    "stance": "future"
  },
  "proposal": {
    "id": "proposal_04a0",
    "version": 2,
    "parent": {
      "scope": {
        "producer": "first-encounter-lab",
        "runId": "run_04a0",
        "packageRef": {
          "id": "package_04a0",
          "revision": 1,
          "digest": "064049445d68e71f43c6a89f281730ce974c033055eb1fa1a0fc85950ff59a98"
        }
      },
      "id": "message_04a1",
      "version": 1,
      "digest": "7f2c5e42b8d3b759f45924e524960ead5f010a27bfe370c2ba251a85bcf53333"
    }
  },
  "reply": {
    "target": {
      "proposalId": "proposal_04a0",
      "proposalVersion": 1,
      "expression": {
        "scope": {
          "producer": "first-encounter-lab",
          "runId": "run_04a0",
          "packageRef": {
            "id": "package_04a0",
            "revision": 1,
            "digest": "064049445d68e71f43c6a89f281730ce974c033055eb1fa1a0fc85950ff59a98"
          }
        },
        "id": "message_04a1",
        "version": 1,
        "digest": "7f2c5e42b8d3b759f45924e524960ead5f010a27bfe370c2ba251a85bcf53333"
      },
      "observationId": "observation_04a1"
    },
    "reason": "The refundable deposit is credited to the marked price."
  },
  "body": {
    "node": "exchange",
    "offered": {
      "node": "AND",
      "groupId": "clerk_terms",
      "items": [
        {
          "node": "IF",
          "phase": "obligationActivation",
          "condition": {
            "termId": "deposit",
            "criterion": "credited_successful_transfer"
          },
          "consequence": {
            "node": "UNTIL",
            "body": {
              "node": "action",
              "act": "Reserve",
              "termId": "reserve",
              "actor": "actor_0002",
              "for": "store_0001",
              "recipient": "actor_0001",
              "item": {
                "productId": "subject_04a0",
                "unitId": "unit_04a0"
              },
              "releasePolicy": "express_clerk_release_after_missed_pickup",
              "retention": "until_fulfilled_or_expressly_released"
            },
            "condition": {
              "clock": "lab_step_clock",
              "anchor": "applies_to_this_agreement_formed",
              "offset": {
                "amount": 10,
                "unit": "step"
              },
              "inclusive": true
            },
            "endpoint": "timely_pickup_window"
          }
        },
        {
          "node": "AFTER",
          "anchor": {
            "termId": "price",
            "criterion": "fully_credited"
          },
          "body": {
            "node": "IF",
            "phase": "obligationActivation",
            "condition": {
              "termId": "reserve",
              "criterion": "eligible_pickup_recorded_while_reserved"
            },
            "consequence": {
              "node": "action",
              "act": "Give",
              "termId": "handover",
              "actor": "actor_0002",
              "for": "store_0001",
              "recipient": "actor_0001",
              "item": {
                "productId": "subject_04a0",
                "unitId": "unit_04a0"
              },
              "transfer": {
                "title": true,
                "custody": true
              }
            }
          }
        },
        {
          "node": "IF",
          "phase": "obligationActivation",
          "condition": {
            "termId": "reserve",
            "criterion": "expressly_released_after_a_missed_unfulfilled_pickup"
          },
          "consequence": {
            "node": "action",
            "act": "Pay",
            "termId": "refund",
            "actor": "actor_0002",
            "for": "store_0001",
            "from": "store_0001",
            "recipient": "actor_0001",
            "quantity": {
              "amount": 200,
              "unit": "cent",
              "currency": "USD"
            },
            "refundOfTermId": "deposit"
          }
        }
      ]
    },
    "requested": {
      "node": "AND",
      "groupId": "buyer_terms",
      "items": [
        {
          "node": "AFTER",
          "anchor": {
            "event": "agreement_formed",
            "criterion": "this_exact_version"
          },
          "body": {
            "node": "action",
            "act": "Pay",
            "termId": "deposit",
            "actor": "actor_0001",
            "recipient": "store_0001",
            "quantity": {
              "amount": 200,
              "unit": "cent",
              "currency": "USD"
            },
            "allocation": {
              "principalTermId": "price",
              "part": "deposit"
            },
            "timing": {
              "during": "opening_settlement",
              "noLaterThan": {
                "clock": "lab_step_clock",
                "anchor": "applies_to_this_agreement_formed",
                "offset": {
                  "amount": 10,
                  "unit": "step"
                },
                "inclusive": true
              }
            }
          }
        },
        {
          "node": "BEFORE",
          "anchor": {
            "clock": "lab_step_clock",
            "anchor": "applies_to_this_agreement_formed",
            "offset": {
              "amount": 10,
              "unit": "step"
            },
            "inclusive": true
          },
          "boundary": "inclusive",
          "body": {
            "node": "action",
            "act": "Pay",
            "termId": "pickup_balance",
            "actor": "actor_0001",
            "recipient": "store_0001",
            "quantity": {
              "amount": 300,
              "unit": "cent",
              "currency": "USD"
            },
            "allocation": {
              "principalTermId": "price",
              "part": "pickup_balance"
            }
          }
        }
      ]
    },
    "price": {
      "termId": "price",
      "total": {
        "amount": 500,
        "unit": "cent",
        "currency": "USD"
      },
      "depositCredit": {
        "amount": 200,
        "unit": "cent",
        "currency": "USD"
      },
      "balanceAtPickup": {
        "amount": 300,
        "unit": "cent",
        "currency": "USD"
      }
    },
    "pickup": {
      "deadline": {
        "clock": "lab_step_clock",
        "anchor": "applies_to_this_agreement_formed",
        "offset": {
          "amount": 10,
          "unit": "step"
        },
        "inclusive": true
      },
      "lateBeforeRelease": "clerk_may_honor",
      "afterRelease": "refund_remains_due"
    }
  }
}
```

### Draft acceptance of v2

```json
{
  "schema": "kw-expression@1",
  "id": "message_04a3",
  "version": 1,
  "scope": {
    "producer": "first-encounter-lab",
    "runId": "run_04a0",
    "packageRef": {
      "id": "package_04a0",
      "revision": 1,
      "digest": "064049445d68e71f43c6a89f281730ce974c033055eb1fa1a0fc85950ff59a98"
    }
  },
  "function": "REMARK",
  "speaker": "actor_0001",
  "addressees": [
    "actor_0002"
  ],
  "force": "currentSelfPerformance",
  "time": {
    "stance": "current"
  },
  "proposal": {
    "id": "proposal_04a0",
    "version": 2,
    "parent": {
      "scope": {
        "producer": "first-encounter-lab",
        "runId": "run_04a0",
        "packageRef": {
          "id": "package_04a0",
          "revision": 1,
          "digest": "064049445d68e71f43c6a89f281730ce974c033055eb1fa1a0fc85950ff59a98"
        }
      },
      "id": "message_04a1",
      "version": 1,
      "digest": "7f2c5e42b8d3b759f45924e524960ead5f010a27bfe370c2ba251a85bcf53333"
    }
  },
  "body": {
    "node": "action",
    "act": "Accept",
    "actor": "actor_0001",
    "recipient": "actor_0002",
    "target": {
      "proposalId": "proposal_04a0",
      "proposalVersion": 2,
      "expression": {
        "scope": {
          "producer": "first-encounter-lab",
          "runId": "run_04a0",
          "packageRef": {
            "id": "package_04a0",
            "revision": 1,
            "digest": "064049445d68e71f43c6a89f281730ce974c033055eb1fa1a0fc85950ff59a98"
          }
        },
        "id": "message_04a2",
        "version": 1,
        "digest": "729b425144adb40dd1c1982b119a6997acf74330f93c8519f94373d1ea18a05b"
      },
      "observationId": "observation_04a2"
    }
  }
}
```

## Arrangement, credit and causal evidence after the words

The expressions govern agreed parties, amount, item, time, conditions and conditional refund. Encounter owns each observed communication, the formation event, movement of money and title/custody, exclusive reservation, due evaluation and credited performance. A native save would preserve evidence and then reconstruct derived state. This is the illustrative arrangement immediately after an authorized missed-pickup release, before any subsequent refund.

```json
{
  "exampleStatus": "paper_only",
  "agreement": {
    "eventId": "event_04a4",
    "proposalId": "proposal_04a0",
    "version": 2,
    "offerMessageId": "message_04a2",
    "affirmativeMessageId": "message_04a3",
    "offerHearing": "observation_04a2",
    "assentHearing": "observation_04a3"
  },
  "deadline": {
    "clock": "lab_step_clock",
    "anchorEventId": "event_04a4",
    "offsetSteps": 10,
    "inclusive": true
  },
  "price": {
    "termId": "price",
    "debtor": "actor_0001",
    "creditor": "store_0001",
    "currency": "USD",
    "requiredMinor": 500,
    "credits": [{ "effectId": "event_04a5", "part": "deposit", "quantityMinor": 200 }],
    "unpaidAtReleaseMinor": 300,
    "pickupBalanceDone": false,
    "collectionDisposition": "released_with_unfulfilled_sale",
    "pickupMissEventId": "event_04a7"
  },
  "reservation": {
    "unitId": "unit_04a0",
    "activationEventId": "event_04a6",
    "depositCreditEffectId": "event_04a5",
    "holder": "actor_0002",
    "owner": "store_0001",
    "releaseEventId": "event_04a8",
    "releaseAuthority": "actor_0002",
    "releaseCauseId": "event_04a7",
    "handoverEventId": null
  },
  "refund": {
    "obligationId": "obligation_04a1",
    "sourceTerm": "refund",
    "activatedByEventId": "event_04a8",
    "originalDepositEffectId": "event_04a5",
    "debtor": "store_0001",
    "beneficiary": "actor_0001",
    "currency": "USD",
    "dueMinor": 200,
    "paidMinor": 0,
    "paymentEffectId": null
  }
}
```

At this explicit release the reservation is available for a new sale. Under the draft release treatment, the old unpaid balance and miss stay visible in history, and the store stops collecting that balance. Replay cannot credit the same deposit transfer again, repeat the release or record duplicate refund debt. A later valid refund has its own effect and credit. In the alternative late-pickup path the release never happens and the original deposit remains credited toward the sale. In that path the $3 payment is a new credit with a late marker against the original due limit, followed by a distinct handover.

## Named paper checks

The references use the producer pin cc8371c3c497edcdcfb8a73ec7da9dad4663847a.

| Rule | Example treatment |
|---|---|
| TRANSACTIONS_COMMITMENTS.md C07 | Part-paid, outstanding balance, missed pickup, release authority, custody, title and refund due are independent facts. The common branch can be part-paid and overdue at the same time. |
| C08 | The future Lab step clock determines timing. The actual formation event anchors the relative 10-step quantity. Both expressions and arrangement specify the inclusive endpoint. No simulated clock reading is claimed. |
| C09 and following paragraph | The unique $2 transfer credits the opening deposit exactly once toward the $5 principal, like the paper's 10-of-30 coin example. An actual later $3 transfer can finish the price while retaining the missed deadline in history. |
| C12 and Restitution/repair row | The refund duty comes from the explicit unfulfilled release. A separately authorized store-to-customer $2 transfer satisfies it. The earlier deposit and consequences survive. |
| EXPRESSIONS_COMPATIBILITY.md UNTIL row and G10 | Performance at the due tick is on time. At the boundary check actual recorded qualifying pickup/performance under that inclusive rule. If the qualifying part is missing, record the miss and leave the reservation in place. The cutoff governs timely pickup, and only a later authorized express Release can free unfulfilled stock. |

## Grammar and owner decisions

The general action tree can express this draft with AND groups, IF duty activation, exchange, BEFORE inclusive deadline, AFTER conditions and UNTIL timely window. The worked example needs typed Reserve and Release meaning, scoped pickup and durable reservation state, term selectors and conditions, a credited price with two allocations, time and activation handlers, and a separately authorized refund payment. These are executable action/record and validation choices. The example does not need a new general node kind.

Teddy's review is needed on the exact tree and draft spellings, whether deposit and reservation activate together in the opening settlement, how the opening precheck handles an intervening buyer, the modeled pickup proof and ten-step anchor, the clerk's express late-before-release option, and the release/refund authority and remaining-balance treatment. This worked path assumes the $3 pickup balance was unpaid when released. A failed handover after a credited balance needs its own resolved evidence path before any release or refund treatment is generalized. These confirmations define the smallest remaining hold decision. The current release authority covers the paper example alone.

## Pre-B verification plan

All entries below are planned observations. The [owner-approved G07 score reconciliation](../decisions/FIRST_ENCOUNTER_LAB_OWNER_APPROVALS_M01_M06_2026-11-14.md#m03--five-gameplay-interpretations) amends the frozen [decision v0.2 §14](../design/FIRST_ENCOUNTER_LAB_DECISION_SPEC_v0_2.md#14-worked-example). Required totals use order Accept / Counter / Refuse.

| Case | Expected scores | Outcome |
|---|---|---|
| Stranger, three in stock | −1 / 0 / −6 | Counter |
| Trusted customer | +3 / +2 / −8 | Accept |
| Same trusted customer, disliked delivery | +1 / +2 / −6 | Counter |
| Stranger, last in stock | −7 / −6 / −3 | Refuse |

Use an authored known-stock fixture for each case. Verify exact request, list, exposure, role, personality, actual delivery, cause-backed warmth/trust, candidate scores and the private deciding row. A refundable deposit leaves small exposure, producing the amended Counter values in Cases 1 and 4. At release, reconcile the paid deposit, debt and actual successful refund separately.

Verify exclusive unit allocation, attempted competing purchase, same-tick pickup, later honored pickup with preserved miss, missed pickup without release, explicit authority and refund, duplicate credits/release/refund, save/reload, and absent or improperly scoped observation. The future order from decision v0.2 §11 is proposal expiry, due-part checks, then scheduled events, each behind a persisted watermark. The historical fourth rule concerns eligible deferred decisions at the next meeting and needs its own authorization. Capture that boundary without adding Defer to this plan. Use same-tick committed proof before marking a due performance missed. Trial fixtures specify actual event order and retain owner G10.

For the separately authorized B5 later, use two independent continuous histories. In the first, start from the same authored store/relation facts with no trusted history. Observe the original deposit Counter, then actual committed kept parts and a completed sale with recorded evidence. The clerk's legitimate receipts drive directed trust changes before an equivalent hold is accepted without deposit. In the second, record an actual missed pickup, legitimate clerk awareness and a worse equivalent choice. Author enough units or scheduled delivery to make compared stock known and comparable, and preserve actual stock transition events. A causal ledger trace must record each original on-time or missed part ID and observation ID, directed adjustment, scorecard and before/after decision. Trust +1 for an observed on-time promised part is once per part. For a miss the approved temper sets −1 or −2 within the −2…+2 range. Later performance remains late and brings no second change. Replayed or hidden causes and immediate cash-and-carry payment supply no trust gain. Controlled history replaces synthetic trust edits. These probes need a later explicit owner build command.
