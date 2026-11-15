# KeyWrapping expression format for Headless Generalization v0.2

Teddy approved kw-expression@1 for this Lab's new headless runs. The [reviewed comparison](../runs/headless-generalization-v0-2/KEYWRAPPING_STORAGE_COMPATIBILITY_REVIEW.md), interaction design D3/D4/D6 and Lab formation policies govern its meaning. This is the Lab representation of the accepted structured language.

## Expression record

| Field | Type and meaning |
|---|---|
| schema | Literal kw-expression@1. |
| id, version | Stable message expression ID and immutable expression revision. Every delivery creates a new record at revision 1. The negotiation version advances on material changes. |
| scope | Producer first-encounter-lab, runId and exact M3-derived packageRef. A reference resolves inside this scope only. |
| function | REQUEST, OFFER or REMARK. |
| speaker, addressees | The author and exactly one actor who receives the message in this headless subset. The acts name their own performers and recipients. |
| force, time | Proposal and future performance for an Offer, or currentSelfPerformance and current for an acceptance. The sequenced message records when the Offer was spoken. The future stance governs what it proposes. It introduces no arbitrary deadline. |
| proposal | Chain id, positive integer negotiation version and exact predecessor expression reference or null. |
| body | The typed tree described below. |

An exact expression reference consists of scope, id, version and digest, with SHA-256 of the canonical expression. A receipt records the actual hearing and outbound projection and must identify the same expression. Delivery metadata in the message envelope carries its ID, sequence and private composition separately. Only authored outward cues, prominence, rendered text and received expression reach the listener. Text follows the expression and cannot add terms.

## Tree and permitted subset

The root exchange names offered and requested, each containing an action subtree. The proposed pay action has termId pay and act Pay, payer actor, till recipient and quantity with integer minor amount, unit and currency. The give action has termId give and act Give, clerk actor, the store represented, customer recipient, item productId and unitId, and explicit title and custody transfer intent. In a USD case the unit is cent. In a customer-originated $3 deal, the customer offers Pay of 300 cent and requests Give of the identified drink. In a clerk-originated version the clerk offers Give and requests the same Pay. Speaker and performers remain distinct fields.

The accepted general tree can nest action subtrees under AND or OR groups, IF branches, BEFORE/AFTER/UNTIL time relationships, NOT, ABOUT or BECAUSE. This run composes and executes the bounded immediate two-action Pay/Give exchange and its supported reply actions. A grouped or conditional expression is rejected as a whole by the executable validator. No partial agreement or action is inferred.

Exact acceptance is a REMARK with force currentSelfPerformance. Its Accept action identifies the responding performer, the original speaker and the precise received proposal version, expression reference and observation ID. The sender's Offer counts as their own undertaking under Lab policy P2. The recipient's exact, eligible, delivered acceptance is still required. A claim, quote, stale version, ambiguous yes or unreceived offer cannot bind. Unsupported forces including report, quote or separate future promise have no assent path.

## Settlement and replay

Pay then Give is the execution policy. No implicit BEFORE condition is added to ordinary offers. Agreement changes neither money nor goods. M3 effects record payment and handover separately, including stable references to command and agreement. Replay reconstructs received expressions and effects from the native validated journal.

New saves identify lab-headless-generalization-save@1 and kw-expression@1. For v0.1 saves, check out historical v0.1 delivery 9088cd2fd9bf162319e745853930f8ea2cc40375 and use its runner.
