# The $3 drink in the two stored formats

These values came from the same immediate sale in two separate headless runs. The historical runner used its frozen v0.1 checkpoint. The v0.2 run used the [approved expression format](../../architecture/KW_EXPRESSION_V0_2_FORMAT.md).

| Part of the sale | v0.1 record | v0.2 expression |
|---|---|---|
| The offer | lab-purchase-message@0.1, outward.family Offer, act propose_exchange. Customer actor_0001 sends to clerk actor_0002. | kw-expression@1, function OFFER, force proposal. Customer actor_0001 is speaker. Clerk actor_0002 is the addressee. The message happens now and proposes later performance without a deadline. |
| Pay | First array entry has act Pay and amountMinor 300. The runtime supplies payer and recipient. | The offered action names term pay, actor actor_0001, recipient store_0001 and quantity 300 cent, USD. |
| Give | Second array entry has act Give, productId subject_0001 and unitId unit_0001. The runtime supplies the performer and recipient. | The requested action names term give, clerk actor_0002 acting for store_0001, recipient actor_0001, item subject_0001/unit_0001 and transfer of title and custody. |
| Which deal | proposal_0001 version 1, also repeated in the assent terms. | proposal_0001 version 1 in a run- and package-qualified expression. Parent is null. The assent references the exact expression digest and the actual hearing receipt, observation_0003 in this proof. |
| Agreement | Clerk sends an accept_exchange Remark linked to the offer message. | Clerk sends a REMARK with currentSelfPerformance. Its Accept action names the eligible received proposal version and targets the same immutable expression. The customer's offer supplies the customer's undertaking under P2. |
| Performance | The native journal records payment and handover separately. | M3 still records the actions separately. The runtime orders Pay before Give. The exchange holds no implicit time condition. |

The clerk can also open the deal. That changes the speaker and places Give on the offered side and Pay on the requested side. The customer still pays the till and receives the item. The expression gives the store and both actors explicit roles, allowing the same language and executor to handle either direction.

The proposal indexes point to the canonical expression. Recipient observations retain what arrived and agreement records point back to the messages. Balances and title/custody are world effects in the same Encounter journal. Restoring validated journal receipts reconstructs those separate facts. In the Step 1 proof, replaying the original Pay and Give commands after restore returned the original receipts. The customer had 700 cents, the till had 300 cents, and the customer held and owned the unit.

The original runner at 9088cd2fd9bf162319e745853930f8ea2cc40375 restored a paid-but-unfulfilled v0.1 fixture byte for byte. The 14,116-byte fixture had SHA-256 c137c48f9c24a351ad0ae2f6d26174226736616c8765da895e7f36fb6abda16a. v0.2 rejected those same bytes with INCOMPATIBLE_SAVE_VERSION, named the historical checkpoint, and left its live run unchanged. v0.2 starts fresh with lab-headless-generalization-save@1 and kw-expression@1.
