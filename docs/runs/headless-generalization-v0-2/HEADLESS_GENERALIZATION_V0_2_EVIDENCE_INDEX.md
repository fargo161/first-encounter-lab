# Headless generalization v0.2 evidence index

Tested production candidate 4fbd313529bc23771d4c629eb452239110001348. Its Git tree is ce2589dc9b1bfdcd9d61662964cd23570a554415. The later evidence commit adds this handoff and A7 tests with the same production bytes. Read the final local revision with git rev-parse HEAD on codex/headless-generalization-v0-2.

| Evidence | What it records |
|---|---|
| [Build report](HEADLESS_GENERALIZATION_V0_2_BUILD_REPORT.md) | Local checkpoint commits, exact paths, results and remaining gates |
| [Format](../../architecture/KW_EXPRESSION_V0_2_FORMAT.md) and [$3 mapping](HEADLESS_GENERALIZATION_V0_2_KEYWRAPPING_MAPPING.md) | Versioned meaning, actual receipt and separate effects. Historical save SHA and replay proof |
| [Trace](HEADLESS_GENERALIZATION_V0_2_TRACE.json) | Actual journals from separate scenarios. SHA-256 43580bb583f3e1f198a1ebd6ad8b60fc885fb7515849836e62315416680042f4 |
| [A7 review](HEADLESS_GENERALIZATION_V0_2_A7_REVIEW.md) and [probes](../../../tests/independent/headless-purchase.test.mjs) | Independent clean-export results, findings and retest |
| [Regression map](HEADLESS_GENERALIZATION_V0_2_REGRESSION_MAP.md) and [test output](TEST_RESULTS.txt) | All 29 historical purposes, original run and active result |
| [Candidate source manifest](HEADLESS_GENERALIZATION_V0_2_SOURCE_MANIFEST.json) and [dated build-source lock](../../provenance/build-locks/2026-11-15-v0-2.json) | Exact Git blob and SHA-256 identities. Preserved historical pins |
| [Scope](RUN_SCOPE.md) and [Step 0 report](HEADLESS_V0_2_STEP0_BLOCKER_REPORT.md) | Authorization, file ownership and initial safety evidence |

Recreate the trace with Node v24.22.1 from the candidate checkout.

    node docs/runs/headless-generalization-v0-2/generate-trace.mjs

The local ZIP contains the bounded v0.2 changes and safe evidence, with a per-file SHA-256 manifest. Use this intact local branch, or apply the file paths over the separately committed Step 0 evidence at e71043d66c45239b7a9db5b2851fad58db592515. The archived v0.1 runner, producer corpus and existing dependencies stay in their original checkouts. Step 0 is available on its separate commit and retains its historical workspace paths.
