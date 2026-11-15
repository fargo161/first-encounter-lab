# First Encounter Lab repository setup report

**Setup ID** `2026-11-14-lab-setup-01` · **14 November 2026, America/New_York**

## A. Result and authorization

The independent Lab repository is published on GitHub with verified private visibility. The published documentation includes the master design, source locks, proposed handoffs and six pending owner approvals. Teddy and Nova review the setup before any build authorization. [First Encounter Lab on GitHub](https://github.com/fargo161/first-encounter-lab)

```text
SETUP_COMPLETE: true
LOCAL_REPO_CREATED: true
REMOTE_REPO_CREATED: true
REMOTE_PRIVATE_VERIFIED: true
INITIAL_DOCS_COMMITTED: true
INITIAL_DOCS_PUSHED: true

REPOSITORY_SETUP_AUTHORIZED: true
GAMEPLAY_BUILD_AUTHORIZED: false
ROOM_SOURCE_EDIT_BY_CODEX_AUTHORIZED: false
ENCOUNTER_RUNTIME_ADAPTATION_AUTHORIZED: false
FULL_AGENT_BUILD_LAUNCHED: false
NEXT_ACTION: STOP_AND_WAIT_FOR_TEDDY_AND_NOVA
```

## B. Repository and old workspaces

| Item | Observed value |
|---|---|
| Coordinating Codex project, current directory and workspace root | **First Encounter Game**, `C:\Users\mcdon\Documents\ChatGPT\encounter and rc`. Git root resolves to that directory. |
| Coordinating Git identity | `fargo161/First-Encounter-Game`, checkout `codex/economy-substrate-v0.1-accepted-baseline` at `cc8371c3c497edcdcfb8a73ec7da9dad4663847a`. An existing untracked store-household design fixture remained in place. |
| New standalone local Git root | `C:\Users\mcdon\Projects\first-encounter-lab`, branch `main`. The path was absent before setup, with no ancestor Git marker or reparse points. |
| Initial documentation commit | `78ad119892e989878bbd3d7e279deff5729bfeb6`. The setup report and final checksum list are recorded in the subsequent setup commit. |
| GitHub repository | [fargo161/first-encounter-lab](https://github.com/fargo161/first-encounter-lab), verified private. |
| Local origin | `https://github.com/fargo161/first-encounter-lab.git`. Local `main` tracks `origin/main`. |
| Initial published `main` | `cbb1c8a23a61ab60f8c80e25c98d37a4ac147eda`, containing both original setup commits. |
| Prior Lab output inside dungeon-manager | `C:\Users\mcdon\Projects\dungeon-manager\artifacts\first-encounter-lab\preflight\2026-11-14-lab-pf-952b4`. Contains the report, evidence index, manifest, checksum, logs, and scratch ROOM/checkpoint copies. The prior setup chat located the setup pack in Downloads. No separate setup repository or setup deliverables were found under dungeon-manager. |

Setup wrote only staging artifacts and the independent Lab repository. No writes were made to either existing repository or its source. First Encounter Game's HEAD and status were checked before and after. The dungeon-manager HEAD ref was readable at `9e45fc6a9d824fe4fb05aa60de81ab4d4ff30d87`. Its full Git status could not be rerun under this workspace's sandbox. Its preflight outputs were inspected read-only.

## C. Preflight identity and limitations

- Report `2026-11-14-lab-pf-952b4` SHA-256 `f6ac958cd46a09d07cb849d29a915c78c103ecc22395ae2f1f1161ed1e3b2f7f`.
- Source manifest SHA-256 `c999d9cc03a1236cabdb1a900c9f9145acad28304d4f6e3e684e63a085fde912`.
- The setup pack and original preflight output agree on all four preserved files, including the report checksum sidecar. This setup also verified the five archive digests, exact checkpoint member bytes and both differing loose copies, the four commit objects, and the scoped foundation references in the source lock.
- The 14 November preflight reported 48 successful M3 checks, 24 independent IR3 passes with one actual IR3-25 failure, and a ROOM suite with one timeout. Browser reproduction lacked Playwright, native Windows launch was unobserved, and full regression coverage was incomplete. Historical log links in the frozen copies still refer to the original audit directory. See [preflight report](../preflight/FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md) and [evidence index](../preflight/PREFLIGHT_EVIDENCE_INDEX.md).

## D. Documents delivered

| Path | Purpose and provenance |
|---|---|
| [README.md](../../README.md) | Authored start page and review gate. |
| [AGENTS.md](../../AGENTS.md) | Authored scope, source authority and future agent controls. |
| [FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md) | Authored synthesis for Teddy, Nova and a future team. |
| [.gitignore](../../.gitignore), [.gitattributes](../../.gitattributes) | Ignore development outputs and preserve checked-out evidence bytes on Windows. |
| [Interaction design](../design/FIRST_ENCOUNTER_LAB_INTERACTION_DESIGN.md), [decision v0.2](../design/FIRST_ENCOUNTER_LAB_DECISION_SPEC_v0_2.md) | Exact unmodified selected checkpoint members. |
| [Decision register](../decisions/DECISION_REGISTER.md), [open approvals](../decisions/OPEN_APPROVALS.md) | Authored evidence and standing for recorded, pending and disputed choices. |
| [Contracts](../architecture/SYSTEM_CONTRACTS_C1_C8.md), [agent ownership](../architecture/AGENT_OWNERSHIP_AND_HANDOFFS.md), [build checkpoints](../architecture/BUILD_CHECKPOINTS.md) | Authored proposed boundaries, sole ownership and future proof gates based on preflight §§I–K. |
| [Source lock](../provenance/SOURCE_LOCK.json), [source provenance](../provenance/SOURCE_PROVENANCE.md), [document authority](../provenance/DOCUMENT_AUTHORITY.md) | Authored machine-readable pins, source standing and review precedence. |
| [Acceptance matrix](../testing/ACCEPTANCE_MATRIX.md) | Verbatim T and B definitions with future status and a native Windows gate. |
| [Preflight report](../preflight/FIRST_ENCOUNTER_LAB_PREFLIGHT_REPORT.md), [source manifest](../preflight/PREFLIGHT_SOURCE_MANIFEST.json), [evidence index](../preflight/PREFLIGHT_EVIDENCE_INDEX.md), [report checksum](../preflight/PREFLIGHT_REPORT.sha256) | Four exact unmodified setup pack copies. The separate logs and scratch directories remain in dungeon-manager. |
| [Setup report](REPOSITORY_SETUP_REPORT.md), [setup checksum manifest](REPOSITORY_SETUP_MANIFEST.sha256) | Authored verification, source access, remote outcome and reproducibility. |

## E. Master design coverage

1. [Identity and status](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#1-identity-and-status) establishes the reusable tile and the current gate.
2. [Player experience](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#2-player-experience) describes the two-role store and repeat visits.
3. [Development Mode versus Play Mode](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#3-development-mode-versus-play-mode) covers private actor views, control and developer edits.
4. [Scope and exclusions](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#4-scope-and-exclusions) fixes the intended platform, visual scope and boundaries.
5. [Architecture](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#5-architecture-in-everyday-words) assigns meaningful truth, physical evidence, read-only projection and presentation.
6. [Interaction language](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#6-approved-interaction-language) covers D1–D11 and A1–A5.
7. [NPC decision model](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#7-npc-decision-model-status) covers the five steps, six responses and compatibility gaps.
8. [Authority and provenance](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#8-authority-and-provenance) identifies candidate and canonical versions, competing inputs and rights.
9. [C1–C8](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#9-c1c8-handoff-contracts) summarizes proposed handoffs and boundaries.
10. [Agent team plan](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#10-agent-team-plan) records the inactive Lead and specialist roles.
11. [Milestones and evidence](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#11-milestones-and-evidence) gives the A–E sequence.
12. [Decisions and risks](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#12-unresolved-decisions-and-implementation-risks) connects M01–M06 and G01–G17 to future gates.
13. [Acceptance and portability](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#13-acceptance-and-portability) ties all proofs to the offline package and its saved state.
14. [Change approval](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#14-how-changes-are-approved) separates document, owner, candidate and release evidence.
15. [Immediate next action](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md#15-immediate-next-action) calls for Teddy and Nova review.

## F. Decision and authority status

D1–D10 have recorded owner acceptance. The review-backed D11 and guards keep the standing recorded in the selected design. The checkpoint reports later design assent to the 20 BASED vibes, A1–A5 and P1–P5. These scoped design records confer no source or gameplay implementation authority. M01–M06 are all pending. The material seams cover fixed M3 actor/profile/stock assumptions, known-fact filtering and Counter parity, the deposit and clause limit, exact due-time ordering, the spoken decision reason and ROOM's unsafe route/result interface. Nova/ChatGPT handles ROOM source through Teddy's separate process. The exact selected copies differ from the loose copies and the source lock keeps both identities.

[Decision register](../decisions/DECISION_REGISTER.md) · [Open approvals](../decisions/OPEN_APPROVALS.md)

## G. Proposed source reuse

Preserve the Combat Room v0.1.1 original and canonical ROOM v0.14.1 HOLD separately. The checkpoint overlay can inform a scene and presentation candidate. Its motion seam requires owner review before adoption. Preserve the Arcade Cast slim pair and Goose/Brifern sources as pinned art inputs, pending rights and scope. Preserve the Encounter M3 package, Economy/EA-IE, KeyWrapping and Stage 12 lineages. The EA-IE preflight tree hash covers the parent directory, with the narrower `0.1.0` tree separately verified. No engine, editor, overlay runtime, executable, ZIP, art or raw audit log was vendored.

[Source provenance](../provenance/SOURCE_PROVENANCE.md) · [Source lock](../provenance/SOURCE_LOCK.json)

## H. Setup validation

| Check or command | Outcome |
|---|---|
| `Get-Location`, `git rev-parse --show-toplevel HEAD`, `git remote -v`, app project and chat metadata | Confirmed the current project and repo before writing. Confirmed the Lab root, separate Git metadata and branch after initialization. |
| `Get-FileHash -Algorithm SHA256`, Python `hashlib.sha256` and `zipfile.ZipFile.read` | Verified the report, manifest, sidecar, archive hashes, selected and alternate design hashes, author documents and historical prompt. Compared preserved source copies byte for byte. |
| `git cat-file -t <commit>`, `git rev-parse <commit>:<path>`, `git show <commit>:<path>` | Confirmed all four commit identities and scoped trees. Compared the five named foundation documents against their pinned SHA-256 values. |
| `git status --short --branch --untracked-files=all`, `git rev-parse HEAD` | First Encounter Game retained its original HEAD and preexisting untracked files. The dungeon-manager Git worktree status was blocked by path access. Its ref and preflight directory were inspected read-only. |
| `python -B tools/repo.py doctor` in First Encounter Game | Reported that required Node 24.x was absent from PATH. The Lab documentation validation is independent of that prerequisite. No repository package build or gameplay test was run. |
| Python documentation audit and checksum manifest | Verified the 15 master sections, M01–M06, G01–G17, all 43 verbatim proof rows with future status, JSON, local links and fragments, and SHA-256 inventory. Historical frozen log links were checked against the original audit folder. |
| `git ls-tree -r --name-only HEAD`, `git show HEAD:<path>`, `git diff --check`, `git status --porcelain`, `git fsck --full` | Checked documentation/config-only content, committed byte identity, final Git integrity and a clean working tree. Historical inputs were kept byte-exact. |
| `gh repo view fargo161/first-encounter-lab`, `gh api` branch and tree inspection, `git remote get-url origin` | Verified private visibility and default branch `main`. The published branch matched local HEAD at publication, and its 22 tracked paths matched the local tree, including the master design, setup report, source lock, preflight report and open approvals. |

The setup checksum manifest covers the 20 foundation files. It excludes itself and this report so that report text and proof results do not feed back into their own checksums. Git covers the full tracked tree.

## I. GitHub access and publication

The restricted shell blocked GitHub DNS. Outside that restriction, approved network access reached `github.com` and `api.github.com`, and the existing GitHub CLI credential authenticated as `fargo161`. The GitHub connector exposed no repository-creation action. The in-app browser required sign-in.

The authenticated CLI returned HTTP 404 for the exact target before creation. It created `fargo161/first-encounter-lab` as a new private repository and verified the owner and visibility before publishing the existing `main` history. GitHub returned the expected commit and matching file inventory. The local working tree was clean after publication. First Encounter Game was accessed read-only. [Verified private repository](https://github.com/fargo161/first-encounter-lab)

## J. Review and stop

Teddy and Nova review the design, source lock, and six open approvals. A separate later owner command names the reviewed Git revision, exact inputs, approved boundaries and allowed implementation. Gameplay, ROOM edits, Encounter adaptation, production agents and Unity remain outside this setup.

[Master design](../../FIRST_ENCOUNTER_LAB_MASTER_DESIGN.md) · [Open approvals](../decisions/OPEN_APPROVALS.md)
