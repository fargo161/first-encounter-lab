# Agent ownership and handoffs

This is the proposed future mapping from preflight §J. Paths are relative to the independent Lab root. The Lead and seven specialists are inactive. Teddy approves the actual path assignment and concurrency under M05 before a build starts.

| Role | Proposed sole write paths | Read-only input → handoff and proof |
|---|---|---|
| Lead | `docs/contracts.md`, `docs/source-lock.json`, `build/bundle.mjs`, `build/verify-offline.mjs`, `package.json`, `dist/First_Encounter_Lab.html` | Owner decisions and A1–A7 receipts → locked integration revision, bundle and digest. The proposed future contract/lock paths require reconciliation with this repo's canonical docs before any write. |
| A1 State and economy | `core/state.mjs`, `core/commit.mjs`, `core/types.mjs`, `core/clock.mjs`, `core/save.mjs`, `content/products.json` | Approved Encounter adaptation → state and commit boundary, cash/stock conservation and replay proof. |
| A2 Communication and KeyWrapping | `communication/meaning.mjs`, `communication/references.mjs`, `communication/proposals.mjs`, `content/actions.json`, `content/based-cues.json` | KeyWrapping, EA-IE and C3 → authored vocabulary, sealed meaning/assent and privacy tests. |
| A3 NPC decisions | `decisions/choose.mjs`, `decisions/routines.mjs`, `content/roles.json` | C2–C5 and reviewed decision seams → pure decision, scoped routine and T1–T9 evidence. |
| A4 Physical bridge | `room-bridge/bridge.mjs`, `room-bridge/bindings.json` | Approved ROOM API and immutable scene → bindings and confirmed motion results. Prove obstruction, cancel, camera and staleness. |
| A5 Character presentation | `presentation/performance.mjs`, `presentation/faces.mjs`, `content/portrait-mappings.json` | A4/A2 interfaces and art locks → inert timeline, RGBA source proof and T11/T13. |
| A6 UI | `ui/play.mjs`, `ui/development.mjs`, `ui/composer.mjs`, `ui/index.html`, `ui/style.css` | A1/A2 scoped operations → both control views, developer tools and file controls. Prove T8/T10/T12. |
| A7 Independent testing | `tests/independent/contracts.test.mjs`, `tests/independent/run-replay.test.mjs`, `tests/independent/windows-offline.md` | Locked candidate and independently chosen expectations → evidence, exact failures and acceptance recommendation. Production repairs return to owning lane. |

Nova/ChatGPT owns ROOM source work through a separately authorized process. A4 owns the Lab-side bridge only. All protected packages, neighboring files and repository rules remain outside a specialist's write paths. Use the lower of then-current capacity and four total slots as proposed, including the Lead. Queue work by dependencies and keep A7 independent.

Each handoff gives the source lock and candidate revision, exact changed paths, interface impact, commands with exits, evidence locations and limitations. When a shared interface must change, the Lead obtains the necessary decision and reopens affected lanes. Before continuation after a stop, rehash agreed inputs and preserve existing test and failure evidence.

[Preflight §J](../preflight/FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md#j-proposed-file-ownership-and-agent-plan) · [M05](../decisions/OPEN_APPROVALS.md#m05-ownership-and-concurrency)
