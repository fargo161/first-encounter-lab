# Headless Purchase v0.1 evidence index

Run `2026-11-15-v0-1`. [Build report](HEADLESS_PURCHASE_BUILD_REPORT.md) · [Report SHA-256](HEADLESS_PURCHASE_REPORT.sha256) · [Exact source inventory](HEADLESS_PURCHASE_SOURCE_MANIFEST.json)

| Proof | Evidence |
|---|---|
| Authority, review branch and first-slice limit | [Run scope](RUN_SCOPE.md) and [input record](../../provenance/build-locks/2026-11-15-v0-1.json). |
| State, messages, policy and anti-duplication | [A1 core tests](../../../tests/unit/core/purchase.test.mjs), [A2 communication tests](../../../tests/unit/communication/purchase-meaning.test.mjs), and [A3 policy tests](../../../tests/unit/decisions/clerk.test.mjs); fresh [unit runner output](UNIT_TEST_RESULTS.txt). |
| Actual Pay-for-Give, failed handover and completed retry | [Domain API trace](HEADLESS_PURCHASE_TRACE.json), reproducible using [trace generator](generate-trace.mjs). Records scenario observations, command receipts, canonical effects and both controller assignments. |
| Independent exact-commit reproduction | [A7 findings](../../../docs/reviews/HEADLESS_PURCHASE_A7_REVIEW_2026-11-15.md), [independent tests](../../../tests/independent/headless-purchase.test.mjs) and [fresh A7 output](../../../evidence/independent/27b7f93/test-results.txt). |
| Earlier producer and physical evidence | [First preflight test baseline](../../preflight/FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md#f-baseline-test-results) and [Phase 0 report](../../preflight/agent-run-2026-11-15-c6-v2/FIRST_ENCOUNTER_LAB_AGENT_RUN_PREFLIGHT_REPORT.md#g-test-and-browser-evidence). These are historical. The current headless run asserted no UI, ROOM, browser, C6 or delivery claim. |

The review ZIP contains the bounded changed tree and a path-free delivery record naming both the exact tested implementation and final local head. The original producer repositories and the public Lab baseline were preserved.
