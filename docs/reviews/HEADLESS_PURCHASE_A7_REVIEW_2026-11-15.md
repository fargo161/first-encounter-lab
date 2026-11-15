# Independent A7 review — Headless Purchase v0.1

**Verdict: PASS for the authorized headless purchase proof.**

Candidate `27b7f93a40fecccd139007204b3ce04580409dd2` on `codex/headless-purchase-v0_1-2026-11-15`. Reviewed 15 November 2026.

I wrote the cross-component cases independently against the public domain operations and trusted audit reads. The first fresh Git archive export passed all nine checks, with Windows line-ending conversion in 11 files. I reran the same assertions on an LF-preserving export of the same commit, for which the Lead verified all 51 files against the Git blobs. I checked the archive commit comment, matched the 51 exported files to its entries, and confirmed the first export differed solely in line endings. The final exact-export run removed one trailing blank line from the independent test for the delivery whitespace check. No assertions, runtime code, or component tests changed.

## Verification run

| Runner | Command | Exit | Passed | Failed | Skipped |
|---|---|---:|---:|---:|---:|
| Initial Windows export, Node `v24.22.1` | `node --test tests/independent/headless-purchase.test.mjs` | 0 | 9 | 0 | 0 |
| Exact Git-blob export, Node `v24.22.1` | `node --test tests/independent/headless-purchase.test.mjs` | 0 | 9 | 0 | 0 |

[Independent test source](../../tests/independent/headless-purchase.test.mjs) · [Actual test output](../../evidence/independent/27b7f93/test-results.txt)

To reproduce, export the candidate with `git -c core.autocrlf=false -c core.eol=lf archive --format=zip -o candidate.zip 27b7f93a40fecccd139007204b3ce04580409dd2` from the local Lab repository. Extract to a new directory, copy the independent test from the review branch to the same relative path, and run the command above from the export root using Node 24.22.1. The test file SHA-256 is `e1928d13faa39f2908db97f5298eef27206f61c5067f89848c2b17982edeb6a7`.

## Findings

| Boundary | Independent outcome |
|---|---|
| Repeatability and reasons | Two fresh runs produced byte-identical canonical saves and equal decision and causal receipts. Calling the pure decision entry point left state unchanged. Ranked evidence rows and the selected rationale referred to the clerk's own product and offer observations. |
| Knowledge and outward delivery | An unreceived catalog ID and a nonexistent ID both rejected as unknown references. Changing authoritative buyer funds and actual stock while retaining the same observed stock left the clerk decision identical. The intended recipient heard the authored cue and exact terms. Both actor views omitted private BASED intent and policy diagnostics. |
| Exact agreement | A newer offer superseded version 1. The old version, missing/partial reference, wrong proposal, wrong recipient, and wrong actor/controller actions changed no state. The valid Remark linked to the delivered version 2 Offer and preserved its terms. |
| Payment and handover | Assent left funds, stock, title and holding unchanged. In the independent fixture, 830 + 75 minor units became 530 + 375 on payment. A distinct subsequent handover moved the one item into the buyer's title and holding. The clerk's scoped receipt cited the payment cause and updated warmth once. |
| Execution rejects | An agreed offer could still fail payment for 299 units of buyer funds or actual stock of zero, even with a prior observed in-stock listing. Neither case moved funds or stock. The buyer cannot hand over for the clerk, and the clerk cannot pay out of the customer's cash. |
| Partial state recovery | Injected failure committed a failure event and preserved the paid ledger. Restoring the partial save into another instance with a different starting run ID restored the original run exactly. Replaying payment and failure returned their original receipts. A new handover alone transferred the item and linked back to the single payment. |
| Save integrity and deduplication | Invalid JSON, incompatible schema, rebalanced but tampered ledger, altered journal receipt, and reassigned observation failed without state replacement. Re-importing the good save was byte-stable. A stale revision, other session, changed-payload command ID and submitted receipt did not create effects. |
| Controller parity | Customer-human and clerk-human comparisons preserved identities and scopes, produced identical pure eligibility and rankings, and applied identical settlement and observation histories through the authorized role operations. Each starting controller survived reload. |

## Limits and disposition

The test exercises one accepted Pay-for-Give path, with source-projected observations from scenario and transaction events. The injected failure is a ledger-side test fixture. The configured stock observation can lag authoritative stock, which is checked during payment. The replay check validates reconstruction and causal evidence within this local save format. It establishes no network authentication or signed-save guarantee.

Physical ROOM presence, collision and handover, C6 runtime and stand-in, UI and delivery HTML, compound offers/holds, actual household gameplay, and full cue and policy coverage remain outside this proof. Producer regressions and the known IR3-25 failure remain historical. The A7 run exercised only this candidate's independent suite, on both exports.

The requested headless stop point is satisfied. Teddy and Nova review before any next checkpoint.
