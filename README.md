```yaml
phase: headless_v0_3_part_a_stopped_for_review
authorization: part_a_executed_review_only
latest_reviewed_source: c77a19c5d2cf294279d1be9208343497bbb3246f
tested_implementation: ef18d2f31f5407405d586b71de9b2fe588602f00
test_evidence: "Node v24.22.1, 102 passing (11 new A7), 0 failures or skips"
latest_report: docs/runs/headless-v0-3-part-a-2026-11-15/HEADLESS_PART_A_BUILD_REPORT.md
c6_status: approved_contract_real_runtime_and_shared_suite_pending
stand_in_status: unbuilt
next_owner_gate: teddy_nova_a4_meaning_review
publication: github_review_branch_only
review_branch: codex/headless-v0-3-part-a-2026-11-15
part_a_evidence_commit: 4310b3bc8832495fdc2586906f86b2c03eb7750b
implementation_scope: headless_immediate_purchase_and_part_a_dialogue
hold_deposit_meaning: draft_pending_owner_approval
part_b_authorized: false
```

# First Encounter Lab

First Encounter Lab is a Trapstar gameplay tile. Actors keep separate knowledge, cash and judgments. KeyWrapping records what a character communicated. Encounter records agreement and the distinct payment and handover effects.

## Headless capabilities

- Customer and clerk can both initiate an immediate Pay-for-Give deal. Independent negotiations, exact versions, split settlement, safe failure/retry and deterministic save replay share the one native journal.
- A missing stock or price fact can prompt one exact Clarify. The addressee can Tell a legitimately held fact or Decline. The asker learns only the attributed report and applies R1/R2 as authorized. Actual checkout checks canonical price, assets and control of the item.
- A human shopper can Accept a price above marked list or Counter at the observed price. The clerk's below-list floor remains a hard restriction. The scoped clerk can see the store till through take_payment, with a separate personal cash account.
- New saves use lab-headless-generalization-save@2 with kw-expression@1. Replay old @1 generalization saves with the v0.2 runner at c77a19c5d2cf294279d1be9208343497bbb3246f. The original v0.1 runner is at 9088cd2fd9bf162319e745853930f8ea2cc40375.

## Reproduce

Use Node v24.22.1 in the independent Lab checkout.

    node --test tests/unit/core/purchase.test.mjs tests/unit/communication/purchase-meaning.test.mjs tests/unit/decisions/clerk.test.mjs tests/unit/decisions/shopper.test.mjs tests/independent/headless-purchase.test.mjs tests/independent/headless-part-a.test.mjs

## Source and scope

- [Lab decision register](docs/decisions/DECISION_REGISTER.md) · [Format and field origins](docs/architecture/KW_EXPRESSION_V0_2_FORMAT.md) · [Previous v0.2 handoff](docs/runs/headless-generalization-v0-2/HEADLESS_GENERALIZATION_V0_2_BUILD_REPORT.md)
- Native M3 remains pinned at 76a92fd82ac5ec6f10748f0b439a5d661fff5ea5 with the historical IR3-25 qualification. The First Encounter Game producer stays at cc8371c3c497edcdcfb8a73ec7da9dad4663847a. [Original source lock](docs/provenance/SOURCE_LOCK.json)
- The approved C6 contract, actual ROOM candidate, shared suite, matched browser baseline, official stand-in, UI and art have distinct gates. Claude's matched baseline is unavailable. [C6 receipt](docs/decisions/ROOM_C6_OWNER_APPROVAL_RECEIPT_2026-11-15.md) · [Remaining gates](docs/decisions/OPEN_APPROVALS.md)
- The $5 hold and refundable deposit are a worked draft. The step clock, future obligations, holds, deposits and returns await separate authority. [A4 hold draft](docs/architecture/HEADLESS_HOLD_DEPOSIT_EXPRESSION_WORKED_EXAMPLE_v0_3_DRAFT.md)

[Part A build report](docs/runs/headless-v0-3-part-a-2026-11-15/HEADLESS_PART_A_BUILD_REPORT.md) · [Trace](docs/runs/headless-v0-3-part-a-2026-11-15/HEADLESS_PART_A_TRACE.json) · [Test output](docs/runs/headless-v0-3-part-a-2026-11-15/HEADLESS_PART_A_TEST_RESULTS.txt) · [A7 review](docs/runs/headless-v0-3-part-a-2026-11-15/HEADLESS_PART_A_A7_REVIEW.md)

## GitHub review workflow

Completed, tested Lab development checkpoints are committed and pushed to their dedicated GitHub review branches under Teddy’s standing approval. Verify the Lab root, remote and test results before pushing, then confirm the remote branch matches the local commit. The review branch is the publication target. Merging into main and starting a new phase are separate owner decisions. [Repository working rules](AGENTS.md) · [Part A review branch](https://github.com/fargo161/first-encounter-lab/tree/codex/headless-v0-3-part-a-2026-11-15)

Part A is stopped for Teddy and Nova’s review. The A4 hold/deposit meaning awaits their approval. Part B is on hold, and ROOM Stage A requires separate authorization.
