# Phase 0 evidence index

Run **2026-11-15-c6-v2**. [Report](FIRST_ENCOUNTER_LAB_AGENT_RUN_PREFLIGHT_REPORT.md) · [Input manifest](AGENT_RUN_SOURCE_MANIFEST.json) · [Report SHA-256](PREFLIGHT_REPORT.sha256) · [Document checksums](PREFLIGHT_DOCUMENT_MANIFEST.sha256)

| Report sections | Source or verification |
|---|---|
| A, D, P, R | [M01–M06 approval](../../decisions/FIRST_ENCOUNTER_LAB_OWNER_APPROVALS_M01_M06_2026-11-14.md), [C6 receipt](../../decisions/ROOM_C6_OWNER_APPROVAL_RECEIPT_2026-11-15.md), and [current gates](../../decisions/OPEN_APPROVALS.md). R is a draft. |
| B, C, Q | [Source inventory](AGENT_RUN_SOURCE_MANIFEST.json), [C6 input fingerprints](../../provenance/ROOM_C6_INPUT_FINGERPRINTS_2026-11-15.md), [document checksums](PREFLIGHT_DOCUMENT_MANIFEST.sha256), and the verified Lab commit/tree. The review ZIP adds path-free identity and document validation output. |
| E, H, M | Pinned producer paths and hashes in the [manifest](AGENT_RUN_SOURCE_MANIFEST.json). [First preflight reuse ledger](../FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md#e-claude-checkpoint-reuse-ledger), [source reconciliation](../FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md#g-designsource-reconciliation), frozen [interaction design](../../design/FIRST_ENCOUNTER_LAB_INTERACTION_DESIGN.md) and [decision v0.2](../../design/FIRST_ENCOUNTER_LAB_DECISION_SPEC_v0_2.md). The state/language audit read the actual pinned source. |
| F, I, O | [Approved revised C6](../../architecture/ROOM_C6_PHYSICAL_CONTROL_CONTRACT_v0_1_REVISED.md) §§1–14, [Step 1](../../architecture/ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md) §§1–8 and Appendix A, [Lab acceptance matrix](../../testing/ACCEPTANCE_MATRIX.md), and the decision/C6 audit's source reads. The review ZIP includes a path-free scene-member inspection. |
| G | [First preflight test record](../FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md#f-baseline-test-results) and [Step 1 test record](../../architecture/ROOM_C6_STEP1_READ_ONLY_INSPECTION_REPORT.md#8-test-execution-and-evidence). The review ZIP includes a labeled selection of actual Step 1 summary fields. |
| J, K, L, N | [Current v2 runbook](../../runbooks/FIRST_ENCOUNTER_LAB_CODEX_AGENT_TEAM_RUN_v2.md) §§6–8 and 10, [existing ownership table](../../architecture/AGENT_OWNERSHIP_AND_HANDOFFS.md), [checkpoints](../../architecture/BUILD_CHECKPOINTS.md), [README](../../../README.md), and independent audit findings. |

## Evidence retained outside Git

- The supplied prompt pack and its ten-member checksum manifest, plus the exact runbook. The registered public runbook replaces one machine-specific checkout path.
- `ROOM_C6_STEP1_TEST_EVIDENCE.zip` (107 entries) with the original/overlay Node summaries and test logs, four original and six overlay browser-attempt logs, and browser summaries. The ZIP is pinned in the manifest. Its raw traces include environment-local paths. The review ZIP includes only selected path-free fields and labels them inherited.
- First preflight raw logs, owner-supplied source archives and disposable inspection locations. These stay at their original locations. Paths shown in historical documents remain historical.
- Claude's matched browser baseline, the stand-in, Nova's shared suite, accepted real C6 candidate and a final Windows artifact are unavailable. There are no logs for these gates in this run.

Audit reports and validations refer to documentation or source inspection. No behavior execution occurred in Phase 0.
