# First Encounter Lab

## Current status

- Scope is the local Headless Generalization v0.2 Steps 1–5 authorized by Teddy. The latest verified implementation checkpoint is Step 2. [Run scope](docs/runs/headless-generalization-v0-2/RUN_SCOPE.md)
- Review branch is codex/headless-generalization-v0-2. The previous reviewed v0.1 delivery is 9088cd2fd9bf162319e745853930f8ea2cc40375. Public baseline remains 1278b705302da2b1bbd8b0edcca62d63a66fc866.
- 35 Step 2 unit tests passed, 0 failed. Node 24.22.1 on Windows. The historical v0.1 runner passed 29 tests and retains its own saves and trace. [v0.1 report](docs/runs/headless-purchase-2026-11-15-v0-1/HEADLESS_PURCHASE_BUILD_REPORT.md)

First Encounter Lab is a Trapstar gameplay tile. A clerk and customer share one store state, while each only knows what they have legitimately received. BASED governs delivery. KeyWrapping records communicative meaning in one versioned expression, and Encounter records what happened.

## What works

- One immediate Pay-for-Give sale works with either initiator. Separate actor cash accounts, the till and individually owned and held units support multiple proposals and two different sales in one run. Pay and handover are separate native effects. Restore and exact receipt replay preserve the ledger.
- Accept, Refuse, Counter and Clarify reach the listener through the same scoped message path. Counter only replaces its linked version and each actor has a two-Counter limit per chain.

New headless saves use kw-expression@1. Open an old v0.1 save with the runner at 9088cd2fd9bf162319e745853930f8ea2cc40375. [Format](docs/architecture/KW_EXPRESSION_V0_2_FORMAT.md) · [$3 transaction comparison](docs/runs/headless-generalization-v0-2/HEADLESS_GENERALIZATION_V0_2_KEYWRAPPING_MAPPING.md)

## Reproduce

Select Node 24.22.1 and run from this review branch.

    node --test tests/unit/core/purchase.test.mjs tests/unit/communication/purchase-meaning.test.mjs tests/unit/decisions/clerk.test.mjs

Historical v0.1 tests and trace generator run from the v0.1 checkout.

## Source and integration gates

- M3 is pinned at 76a92fd82ac5ec6f10748f0b439a5d661fff5ea5. The Lab uses its native validation, journal, receipts and observation projection. The inherited IR3-25 result remains a qualified historical failure.
- First Encounter Game is verified at cc8371c3c497edcdcfb8a73ec7da9dad4663847a. [Original source lock](docs/provenance/SOURCE_LOCK.json) · [Master design](FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md) · [Owner decisions](docs/decisions/FIRST_ENCOUNTER_LAB_OWNER_APPROVALS_M01_M06_2026-11-14.md)
- The real ROOM candidate and Nova’s shared C6 suite are pending. Claude’s matched browser baseline is unavailable. The approved C6 contract is the input for those gates. The official stand-in, playable UI, art, holds, deposits and return visits are outside this scope. [C6 receipt](docs/decisions/ROOM_C6_OWNER_APPROVAL_RECEIPT_2026-11-15.md) · [Remaining gates](docs/decisions/OPEN_APPROVALS.md)
- A1 owns state, A2 expression and communication, and A3 policy. The Lead owns integration and this handoff. A7 independently reviews the committed Step 5 candidate. [Ownership plan](docs/architecture/AGENT_OWNERSHIP_AND_HANDOFFS.md)

The next permitted action is Step 3 of this run after the current checkpoint is green.
