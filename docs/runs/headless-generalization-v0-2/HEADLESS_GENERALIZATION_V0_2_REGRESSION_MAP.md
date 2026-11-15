# Headless v0.2 regression map

The 29 historical tests passed unmodified on Node v24.22.1 at Git delivery 9088cd2fd9bf162319e745853930f8ea2cc40375. Their test paths and original source bytes remain at that checkpoint. The next table names every historical purpose and the active v0.2 proof. Line numbers use the original checkout.

- Core uses tests/unit/core/purchase.test.mjs.
- Communication uses tests/unit/communication/purchase-meaning.test.mjs.
- Decision uses tests/unit/decisions/clerk.test.mjs.
- Independent uses tests/independent/headless-purchase.test.mjs.

| Historical group and line | Historical purpose | Active counterpart |
|---|---|---|
| Communication 35 | One immutable typed Pay-for-Give offer | Typed $3 tree, reverse direction and immutable version tests |
| Communication 45 | No unknown subjects, unsupported terms or unauthored cues | Known reference and whole-expression rejection probes |
| Communication 52 | Recipient sees only outward cues, prominence and terms | Addressed hearing, speaker and bystander privacy |
| Communication 64 | Authorized recipient makes exact linked acceptance | Accept targets the offer digest and actual observation. Terms are referenced to their source. |
| Communication 73 | Ambiguous/stale assent, wrong party or absent hearing fails | Ambiguous and stale version, copied receipt and wrong run tests |
| Communication 80 | Matching ID/version cannot accept changed terms | Altered expression, quotation and receipt checks |
| Core 30 | Scenario grants knowledge from an actual receipt and scopes the response | Separate personal account and actor references |
| Core 42 | Stale and ambiguous assent have no world effect | Linked versions across two independent chains |
| Core 54 | Agreement leaves assets unchanged. Pay and handover each apply once | $3 effects, ledger conservation and exact replay |
| Core 79 | Wrong role, insufficient funds and hidden stock cannot move assets | Separate settlement checks and scoped failure reasons |
| Core 93 | A failed handover restores and retries after just one payment | External action-resolution fixture replaces the save switch |
| Core 117 | Tampered or malformed saves cannot replace live state | Replay validation, atomic failure and old envelope rejection |
| Core 130 | Command identity, revision and run binding reject conflicting requests | Duplicate, wrong-run and stale-revision checks |
| Core 140 | Both controller assignments share eligibility and effects | Clerk/customer initiators and rule/human parity |
| Decision 28 | Exact-list immediate sale uses only scoped offer and facts | Received offer, known price and ordinary eligibility test |
| Decision 42 | Delivery cannot override a known stock or price rule | Stock and below-floor tests. Above list follows normal scoring under §7.1. |
| Decision 59 | Role permission independent of controller | Role and controller eligibility tests |
| Decision 72 | Unknown stock may prompt clarification with no leaked hidden fact | Delivered actor-scoped Clarify based on missing receipt |
| Decision 89 | Only outward cues affect delivery nudge | Scoped cue taste, private composition ignored |
| Decision 105 | Personality leaning breaks ties deterministically | Tie and G12 tipping/fallback tests |
| Independent 66 | Two fresh equivalent runs produce the same durable effects and decisions | Explicit run identity in deterministic probes and exact journal replay |
| Independent 101 | Unreceived catalog and authoritative facts do not inform actor policy | Adversarial references and hidden-stock probes |
| Independent 133 | Only the addressed actor receives terms and outward cues | Bystander, sender and listener views compared with private inspector |
| Independent 164 | Only the newest exactly delivered version admits assent | Counter supersession and conflict probes |
| Independent 188 | Assent alone conserves assets and actual effects happen once | Split settlement, title and possession, retry/replay |
| Independent 221 | Funds and actual stock guard execution even when parties agree | No debit for insufficient funds or a rival claim on the unit |
| Independent 238 | Failed handover and exact receipt replay survive save, then retry safely | External proof of paid-but-unfulfilled state and one retry |
| Independent 268 | Bad save or stale and forged commands cannot reapply effects | Atomic restore and command identity probes |
| Independent 309 | Switching human role preserves identity, eligibility and settlement | Autonomous shopper vs equivalent human shopper in separate runs |

At v0.1, the exact-price test treated 400 as categorically invalid against a 300 list price. The v0.2 test applies the approved floor from decision v0.2 §7.1. It guards 200 and lets 300 and 400 reach normal scoring. The known-stock guard and cue invariance remain. The old decision evidence stays on its historical commit.

The v0.1 recovery test used a scenario switch saved inside the old run. For v0.2 the external action-resolution fixture admits a failed Give as evidence in the same native journal. The full regression retains the partial-state, restore, retry and exact replay assertions. The actual historical paid failure fixture is also reproduced by the old runner. [Historical save comparison](HEADLESS_GENERALIZATION_V0_2_KEYWRAPPING_MAPPING.md)

All active source uses kw-expression@1. An exact receipt reference replaces duplicated assent terms. Fixture-defined run IDs permit deterministic comparison while separately created runs default to distinct identities. The actor capability and trusted inspector are separate.

## Commands and results

Historical tree at 9088cd2fd9bf162319e745853930f8ea2cc40375, exit 0, 29 pass.

    node --test tests/unit/core/purchase.test.mjs tests/unit/communication/purchase-meaning.test.mjs tests/unit/decisions/clerk.test.mjs tests/independent/headless-purchase.test.mjs

Active candidate 4fbd313529bc23771d4c629eb452239110001348 with A7 probes, exit 0, 67 pass.

    node --test tests/unit/core/purchase.test.mjs tests/unit/communication/purchase-meaning.test.mjs tests/unit/decisions/clerk.test.mjs tests/unit/decisions/shopper.test.mjs tests/independent/headless-purchase.test.mjs

[Unit and independent result output](TEST_RESULTS.txt) · [A7 case names, source hashes and results](HEADLESS_GENERALIZATION_V0_2_A7_REVIEW.md)
