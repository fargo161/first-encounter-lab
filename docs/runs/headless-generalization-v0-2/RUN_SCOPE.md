# Headless generalization v0.2 run scope

Teddy authorized local Steps 1–5 on 15 November 2026 with AUTHORIZE_FIRST_ENCOUNTER_LAB_HEADLESS_V0_2_STEPS_1_TO_5. The command and final prompt SHA-256 d9c4dc8b8132ef8e0601cdcd622f6dc43b8efc732ba2a0e9e0cbe764479058b4 govern this pass. Teddy approved a single stored format for new runs, [kw-expression@1](../../architecture/KW_EXPRESSION_V0_2_FORMAT.md), after the [storage review](KEYWRAPPING_STORAGE_COMPATIBILITY_REVIEW.md). The [Step 0 record](HEADLESS_V0_2_STEP0_BLOCKER_REPORT.md) and storage review were committed separately in e71043d66c45239b7a9db5b2851fad58db592515.

Reviewed historical Lab delivery is 9088cd2fd9bf162319e745853930f8ea2cc40375. Tested v0.1 ancestor is 27b7f93a40fecccd139007204b3ce04580409dd2. Public Lab baseline is 1278b705302da2b1bbd8b0edcca62d63a66fc866. First Encounter Game producer is cc8371c3c497edcdcfb8a73ec7da9dad4663847a. Frozen M3 import is 76a92fd82ac5ec6f10748f0b439a5d661fff5ea5. Historical IR3-25 remains a qualified failure. The [original lock](../../provenance/SOURCE_LOCK.json) and adopted design inputs remain frozen.

| Owner | Paths for this authorization |
|---|---|
| Lead | AGENTS.md, README.md, the expression format documentation, this run folder's checkpoint, trace and integration evidence, and the new dated build-source lock. |
| A1 | core/scenario.mjs, core/purchase.mjs, tests/unit/core/purchase.test.mjs and external test-only action-resolution support. |
| A2 | communication/purchase-meaning.mjs and tests/unit/communication/purchase-meaning.test.mjs. |
| A3 | decisions/clerk.mjs, role and personality content used by the headless runner, and tests/unit/decisions/clerk.test.mjs. |
| A7 | tests/independent headless generalization probes and corresponding independent findings, following a clean committed candidate export. |

Assign any additional path to one of these owners before creating it. The Lead coordinates interfaces and local commits. Four active slots include the Lead. A7 reviews after the implementation lanes finish.

Each runnable step has its own local commit after passing Node 24.x tests. The run ends after Step 5 with independent review evidence, or at a documented blocker. A material change to the approved meaning requires a separate Teddy decision. The next gate is Teddy and Nova's review.

The frozen v0.1 runner, traces and saves remain available from their historical checkpoint. This authorization excludes old-save migration, ROOM, C6, the stand-in, interface, art, holds, deposits, Defer, return visits and publication. Local documentation and the named headless lanes are the full build authority granted by this command.
