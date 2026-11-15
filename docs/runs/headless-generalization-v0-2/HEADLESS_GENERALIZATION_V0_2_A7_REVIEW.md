# A7 independent review of Headless Generalization v0.2

**PASS** for the authorized headless Steps 1–5 on commit `4fbd313529bc23771d4c629eb452239110001348`, tree `ce2589dc9b1bfdcd9d61662964cd23570a554415`. The fresh export passed 55 component tests and 12 independent probes on Node v24.22.1 on Windows. The isolated v0.1 export separately passed all 29 historical tests. Tests ran locally.

The initial Step 5 candidate `41ee3357d381bbbd029fe670cdddf9f340de6017` passed 11 independent probes and failed A7-12. Two products met a $5 drink budget, and the shopper had $11. It received facts that the $3 product was unavailable and the $3.50 product was available. It ranked the $3 product first and left. The existence of the eligible immediate $3.50 purchase made that decision wrong under the scoped Step 5 rule. The Lead routed the finding to A3, who corrected the eligible opening choice. The same independent probe passed on the corrected commit when the shopper authored and delivered an Offer for the $3.50 unit. The correction also passed the component check for an affordable alternative when the highest-ranked item costs more than the shopper holds. The correction preserves the product ranking evidence and keeps the existing expression, knowledge, assent and settlement semantics.

## Source checked

Both disposable exports came from clean Git trees using `git -c core.autocrlf=false -c core.eol=lf archive`. I read both tree identities directly from the independent Lab Git repository and checked each tested export against them. For all 17 production, content, imported M3 and component test or support files, I compared hashes and byte counts before and after testing with the source manifest derived from the committed blobs. The 13 production and support paths also matched Git's recursive tree output directly. A7 authored the independent suite in the disposable export. Its SHA-256 is `5765d8fc5e19df083bf30e91632fba11f315b4df45b8e3154ab9ea34c83da4e6`.

| Input | Git tree | Export archive SHA-256 |
|---|---|---|
| Initial Step 5 | `d3bcc9c9f21fbca4960f0f049dc4c14498ef4b0f` | `40f986ca6428fef387ce3d6be2d07ed0a228330f547bb4d4889bdc57f92f1daa` |
| Corrected Step 5 | `ce2589dc9b1bfdcd9d61662964cd23570a554415` | `3570b912da97837c2630b28156c6705e909c9b194a0cab87b6860162d43b4229` |
| Frozen v0.1 `9088cd2fd9bf162319e745853930f8ea2cc40375` | `f62837bd3df5c29f57254d56bcf10ba7d861fa3b` | `22bd950577b88673b0197a2c63eba3f68a00bdba08aaeb3344ce19671e5ad89e` |

## Commands and results

Select Node v24.22.1. Commands run from the root of the relevant export.

| Export and command | Exit | Passed | Failed | Skipped |
|---|---:|---:|---:|---:|
| Initial v0.2, `node --test tests/independent/headless-purchase.test.mjs` | 1 | 11 | 1 | 0 |
| Corrected v0.2, `node --test tests/unit/core/purchase.test.mjs tests/unit/communication/purchase-meaning.test.mjs tests/unit/decisions/clerk.test.mjs tests/unit/decisions/shopper.test.mjs tests/independent/headless-purchase.test.mjs` | 0 | 67 | 0 | 0 |
| Corrected v0.2, `node --test tests/independent/headless-purchase.test.mjs` with no external fixture inputs | 0 | 12 | 0 | 0 |
| Frozen v0.1, `node --test tests/unit/core/purchase.test.mjs tests/unit/communication/purchase-meaning.test.mjs tests/unit/decisions/clerk.test.mjs tests/independent/headless-purchase.test.mjs` | 0 | 29 | 0 | 0 |

The initial and corrected combined evidence used `LAB_A7_HISTORICAL_RUNNER` and `LAB_A7_HISTORICAL_SAVE` to point to the frozen runner's `core/purchase.mjs` and its independently replayed paid-but-unfulfilled save. The 14,116-byte old save had SHA-256 `c137c48f9c24a351ad0ae2f6d26174226736616c8765da895e7f36fb6abda16a`. A7-09 verified that the frozen runner re-emits those exact bytes and that v0.2 rejects them with historical-runner guidance and leaves its live state unchanged. With no external inputs, A7-09 still exercises the old schema rejection and the no-mutation assertion. The suite requires neither a machine-specific path nor a bundled v0.1 engine.

## Independent evidence

| Probe | What it established on the corrected commit |
|---|---|
| A7-01 | Two fresh sessions with equivalent inputs produced identical saved journals, decisions and judgments. Restoration and receipt replay preserved those bytes. |
| A7-02 | A clerk authored one offer and the buyer authored another. Both chains were open at once, and two distinct units sold in the same run. A received acceptance named the offer's exact observation, expression and version. Agreement held the ledger steady. Pay and Give committed separately. The two payments moved 650 minor units once, and both title and custody transferred once. |
| A7-03 | A 200 offer below the 300 list floor excluded Accept and produced a delivered Counter. Offers at 300 and 400 had Accept available and were accepted in this fixture. Outward delivery included the stated reason. The same offer exposed the same choices with either controller. |
| A7-04 | Two Counter turns per participant changed only the referenced chain and kept its earlier terms. The same cap held under both controller assignments. A Refuse reached the recipient after the cap. A separate Clarify asked for the missing stock fact without giving its value. Stale and ambiguous assent changed no state. |
| A7-05 | Actor handles expose only their own capabilities and view. Trying to impersonate the clerk, query another actor's proposal, or guess hidden and nonexistent items did not give privileges or extra knowledge. Addressed actors heard the correct terms and cues. The trusted inspector retained private composition and scores. |
| A7-06 | An already paid claim prevented another customer from paying for the same unit, both before and after handover. Actual withheld stock stopped the buyer's payment with a generic failure. The buyer's own insufficient funds had a specific safe reason. All three rejection paths held the balances steady. |
| A7-07 | A trusted external action-resolution fixture left a committed failure in the M3 journal. A gameplay actor could not invoke it. Restore replayed the failed handover and the original payment exactly. An authorized retry transferred the item and left the original payment amount and balance intact. |
| A7-08 | A corrupt save, a tampered ledger, a stale command, a reused command ID with different terms, and a copied command from another run changed no live state. |
| A7-09 | The historical save boundary rejected the v0.1 envelope. With the optional exact inputs, the frozen runner still restored and reproduced a real paid-but-unfulfilled save. |
| A7-10 | The private scorecard exposed all six considered choices, known facts and sources, and zero immediate-sale risk. Directed warmth and trust stayed bounded. Repeated emphatic courtesy gave no extra gain. A delayed listener received the first completion after the second and earned the first-completion change just once, from the original event with its own observation ID. Exact replay kept both sides' causes. |
| A7-11 | The rules-controlled shopper sent its own Offer from a command containing only the action and actor ID. The hidden cheaper item never entered its view. A separately initialized human-controlled shopper produced the same transaction, with the clerk's eligible choices and final ledger agreeing across control assignments. No funds produced Leave and no Offer. |
| A7-12 | The shopper selected the known affordable available alternative after excluding the known unavailable opening. This was the sole independent failure on the initial candidate, and it passed on the corrected revision. |

## Historical independent purposes

| Frozen v0.1 independent purpose | v0.2 counterpart |
|---|---|
| Determinism across fresh runs and replay | A7-01 |
| Unreceived catalog and authoritative facts stay out of actor scope and clerk policy | A7-05, A7-06, A7-11 |
| Only the addressed actor receives authored cues and exact terms | A7-02, A7-05 |
| Only newest exact delivered terms form an agreement | A7-02, A7-04 |
| Assent preserves the ledger and explicit settlement applies once | A7-02 |
| Actual funds and hidden stock prevent unsafe execution | A7-06 |
| Failed handover survives save and exact replay, then can retry | A7-07, A7-09 |
| Malformed saves and stale or copied commands never reapply effects | A7-08 |
| Both control assignments preserve identities, eligibility, privacy and settlement | A7-03, A7-04, A7-11 |

The v0.2 suite uses the marked price as a minimum for the clerk and places fault control in an external fixture. These are the two approved corrections to the historical expectations. The original saves, tests, traces and results remain available at their pinned v0.1 revision.

This verdict covers a local headless implementation from authored scenario observations. ROOM, C6, browser, UI and integrated acceptance were untested in this review. The headless evidence does not change T1–T17 or B01–B26 statuses or the inherited M3 IR3-25 qualification. The [independent tests](../../../tests/independent/headless-purchase.test.mjs) and [run scope](RUN_SCOPE.md) give the assessment's boundaries.
