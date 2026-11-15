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

The reserved connectors carry their own attachment and scope. AND groups at least two children and preserves presentation order. OR names alternatives, chooser or selection rule and interpretation. IF identifies the condition, consequence and whether it gates formation or a particular duty. BEFORE and AFTER name the anchored subtree and boundary. UNTIL names what continues, its ending condition and endpoint rule. NOT names the affected subtree and negation mode. ABOUT carries a separate topic. BECAUSE carries an attributed explanation. The producer paper examples preserve these relations. The Lab admits the immediate exchange and exact replies above as its executable subset, with no flattening of other trees.

Exact acceptance is a REMARK with force currentSelfPerformance. Its Accept action identifies the responding performer, the original speaker and the precise received proposal version, expression reference and observation ID. The sender's Offer counts as their own undertaking under Lab policy P2. The recipient's exact, eligible, delivered acceptance is still required. A claim, quote, stale version, ambiguous yes or unreceived offer cannot bind. Unsupported forces including report, quote or separate future promise have no assent path.

## Delivered replies

| Choice | Function and force | Stored target and effect |
|---|---|---|
| Accept | REMARK, currentSelfPerformance | Accept names the exact open version and receiver's original hearing. A stated reason may be delivered alongside it. Only this supported reply can assent. |
| Refuse | REMARK, currentSelfPerformance | Refuse targets the delivered version and records the outward reason. The version closes without changing the ledger, and its terms and receipts remain in history. |
| Counter | OFFER, proposal | The new version keeps the same chain and points to the exact prior expression. Its reply identifies the original hearing, and its exchange holds the new material terms. It supersedes only the target version. Each party can Counter at most twice in a chain. |
| Clarify | REQUEST, request | Clarify names the exact delivered version, an outward reason, and the needed stock or list-price information. The version stays open while the actor awaits that one answer. |
| Tell | REMARK, currentSelfPerformance | Tell answers the exact received Clarify with one legitimately held stock or price fact. The listener acquires an attributed hearing. |
| Decline | REMARK, currentSelfPerformance | Decline answers the exact received Clarify with a reason and no fact value. A human decline uses uniform wording. A rules asker's subsequent Refuse names the missing fact. |

All replies are spoken now. A Counter's proposed acts keep the future stance. The recipient hears the scoped terms, outward stated reason and delivery cues. Role data and scores stay on the trusted inspection surface.

## Settlement and replay

Pay then Give is the execution policy. No implicit BEFORE condition is added to ordinary offers. Agreement changes neither money nor goods. M3 effects record payment and handover separately, including stable references to command and agreement. Replay reconstructs received expressions and effects from the native validated journal.

Part A saves identify lab-headless-generalization-save@2 and kw-expression@1. Open older @1 generalization saves with the historical v0.2 runner at c77a19c5d2cf294279d1be9208343497bbb3246f. For v0.1 saves, check out historical v0.1 delivery 9088cd2fd9bf162319e745853930f8ea2cc40375 and use its runner.

## Origin of field and value names (paper KeyWrapping vs Lab v0.2 and Part A)

Part A keeps the **kw-expression@1** label and every pre-existing executable field meaning. The inventory follows all branches of the `validateExpression` checker in `communication/purchase-meaning.mjs`, including scoped references, variants and nested action forms. The frozen v0.2 trace retained SHA-256 `43580bb583f3e1f198a1ebd6ad8b60fc885fb7515849836e62315416680042f4`. Its 18 distinct expressions (9 ordinary Offers, 1 Counter, 6 Accepts, 1 Refuse and 1 Clarify) validate without changing their bytes.

### Comparison basis

The paper sources below are pinned to First Encounter Game commit `cc8371c3c497edcdcfb8a73ec7da9dad4663847a`. They specify proposed meaning and examples. The Lab wires are local implementation choices.

| Key | Pinned source |
|---|---|
| E0, E1, E2 | EXPRESSIONS_COMPATIBILITY.md, Proposed meaning nodes, Function/force/time/target, and Contextual omission and clarification respectively |
| J0, J1, J3, J4 | JSON_RECORD_FAMILY.md, Notation/identity/version axes, Illustrative sense crosswalk, Grouped warehouse exchange/counter/exact assent, and Partial fulfillment and irreversible disclosure (including tellReport, tellEmission and tellReceipt) |
| T2 | TRANSACTIONS_COMMITMENTS.md §§2–4, exact record family, proposal and disclosure/assent semantics |
| S | SCHEMA_DESIGN.md, Versioning and exactness; SUBSTRATE_SPEC.md §§3–6, concept families, consequences and sealing |
| D | ACTION_PREDICATE_MAPPING.md, dictionary entries Give, Pay, Accept, Refuse and Tell |
| M | Accepted M3 `contracts.mjs` and `views.mjs`, revision `76a92fd82ac5ec6f10748f0b439a5d661fff5ea5` |

**SAME** requires corresponding paper spelling and semantic use. **DIFFERENT** covers a different shape or spelling, including identical words used in different positions. **NEW** means the paper does not supply that wire field or literal. **NEW IN PART A** marks a new Lab spelling/value or application introduced in this authorization. The delivery review was checked against the pinned papers and full source checker. In particular, matching words like actor, proposalId and revision do not establish matched wire contracts.

### Fields

Named field and path entries, with shared subforms counted once. **SAME 16, DIFFERENT 36, NEW 13**. The notation `{offered,requested}` covers either side of an exchange. Only the fields of the actual Pay or Give variant are accepted.

| Accepted field or path | Origin | Paper or native location | Why the Lab uses it |
|---|---|---|---|
| `schema` | DIFFERENT | J0 | The paper uses recordFormat/recordType. The Lab fixes a concrete expression label. |
| `id` | SAME | J0/J3 | Stable expression record identity. |
| `version` | DIFFERENT | J0/S | The paper calls the record revision revision. The Lab separates immutable expression version from deal version. |
| `scope` | DIFFERENT | J0 | Paper context and qualified references express scoping. Paper authority scope has a different purpose. |
| `function`, `speaker`, `addressees`, `force`, `time`, `body` | SAME | E1/J3 | Corresponding expression keys. The Lab spells actor references as qualified ID strings within a scope. |
| `proposal` | DIFFERENT | T2/J3 | The paper uses a separate proposalVersion and terms reference. The Lab embeds exact chain metadata. |
| `reply` | NEW | J3/T2 | The paper links counters with counterOf and separate receipt records. Lab uses one optional exact Counter reply wrapper. |
| `scope.producer` | DIFFERENT | J0 | The paper names context.producer. The Lab places producer in its identity scope. |
| `scope.runId` | NEW | J0 | Lab run identity. A paper world snapshot has a different meaning. |
| `scope.packageRef` | NEW | M | M3 wire envelope inherited from its contract, not from KeyWrapping. |
| `scope.packageRef.id`, `scope.packageRef.revision` | DIFFERENT | M/J0 | M3 supplies the nested keys. The same paper words refer to other record identities and revisions. |
| `scope.packageRef.digest` | NEW | M/J0 | M3 supplies the key. The Lab chooses the exact hashed scenario, authored roles, personalities and cues. The paper leaves hashes illustrative. |
| `time.stance` | SAME | E1/J3 | The named temporal stance distinguishes later terms and present communicative acts. |
| `proposal.id`, `proposal.version`, `proposal.parent` | DIFFERENT | T2/J3 | Paper proposalId, termsRevision and counterOf are separate proposal record fields. Lab parent identifies the previous expression exactly. |
| `body.node`, `body.offered`, `body.requested` | SAME | E0/J3 | Typed exchange with two explicitly related sides. |
| `body.{offered,requested}.node` | SAME | E0/J3 | An action child uses node as the discriminator. |
| `body.{offered,requested}.act` | DIFFERENT | J1/D | Paper uses sense with typed role bindings. Lab permits the named Pay/Give operations in this position. |
| `body.{offered,requested}.actor`, `body.{offered,requested}.recipient` | DIFFERENT | J1/J3 | Paper roles.actor and roles.recipient become flat ID bindings on each action. |
| `body.{offered,requested}.termId` | SAME | J3 | A local term ID is scoped to the exact expression revision. |
| `body.{offered,requested}.for` | NEW | J3/T2 | Lab-only represented seller store on Give, beside the actual performer. |
| `body.{offered,requested}.quantity` | SAME | J1/J3 | Typed quantity concept. Paper action puts the amount inside typed roles. |
| `quantity.amount`, `quantity.unit` | SAME | J3 | Paper quantity has amount and unit. Lab amount is a positive integer in minor units. |
| `quantity.currency` | NEW | J3 | A Lab currency code ties ledger and action units. The paper example uses a money resource and coin unit. |
| `body.{offered,requested}.item` | DIFFERENT | J1/J3 | Paper uses roles.theme plus a qualified resource. The Lab isolates the item identity pair. |
| `item.productId`, `item.unitId` | NEW | J1/J3 | Lab catalog product and concrete unit IDs. No paper-defined wire keys. |
| `body.{offered,requested}.transfer`, `transfer.title`, `transfer.custody` | DIFFERENT | J1/J3 | Paper transferMode and separate ownership/custody meanings. The nested Lab booleans request both transfers explicitly. |
| `body.act` | DIFFERENT | J1/J4 | Response action selects a specific supported act using the Lab discriminator. |
| `body.actor`, `body.recipient` | DIFFERENT | J1/J4 | The paper uses typed roles with qualified refs. The roles are flat on Lab reply actions. |
| `body.target`, `reply.target` | DIFFERENT | T2/J3 | Paper targets are record refs. Lab target encloses exact prior expression plus a native hearing ID and offer version. |
| `body.reason`, `reply.reason` | DIFFERENT | E0/T2 | Comparable to a stated BECAUSE or basis. Lab uses a bounded actor-safe string. Decline adds a distinct constrained application. |
| `body.missing` | NEW | E2 | Lab names the specific missing fact. The paper says clarify, without prescribing this field. Part A also uses it in answers. |
| `body.target.expression`, `reply.target.expression` | DIFFERENT | J0/J3 | Paper expression links use record references. Lab references include hash and scope. |
| `body.target.proposalId`, `reply.target.proposalId` | DIFFERENT | J3 | Same paper word on proposalVersion record. Here it selects the chain inside the reply link. |
| `body.target.proposalVersion`, `reply.target.proposalVersion` | DIFFERENT | J3 | The paper agreement proposalVersion refers to a record. Lab field is a positive version integer. |
| `body.target.observationId`, `reply.target.observationId` | NEW | J3/M | M3 native recipient observation ID in a Lab reply link. No matching paper flattening. |
| `reference.scope`, `reference.id`, `reference.version`, `reference.digest` | DIFFERENT | J0/S/M | Exact proposal.parent, body.target.expression and reply.target.expression all use this object. Paper qualified refs use ref/revision. Lab adds scoped canonical SHA-256. Reference scope has every scope field above. |
| `body.fact`, `body.fact.value` | DIFFERENT | J1/J4 | **NEW IN PART A.** One selected disclosed fact and its attributed value replace paper selectedContent/claim and disclosure binding. The listener's actual hearing preserves attribution. |
| `body.fact.productId`, `body.fact.unitId` | NEW | J4/M | **NEW IN PART A.** Tell binds exactly one concrete subject and item unit, never a whole product record. |

The shared exact Reference occurs under both proposal.parent and either target.expression. The target versions are equal to the corresponding addressed proposal version. On a Counter, the reply identifies the previous version and the parent equals that exact prior expression reference. Tell and Decline point to the exact addressed Clarify rather than directly to the Offer. The Clarify target preserves the offer link. Action actor and target relationships must match the recorded parties and scoped hearing. The addressee array has exactly one actor, distinct from the speaker.

### Literal values and variable domains

Literal entries, qualified by position when needed. **SAME 10, DIFFERENT 8, NEW 15**. Variable domains are spelled out separately rather than counted as enumerations.

| Serialized literal | Origin | Paper or native location | Meaning in the Lab |
|---|---|---|---|
| `kw-expression@1`, `first-encounter-lab` | NEW | J0 | Lab expression format and producer labels. |
| `1 (expression and exact reference version)` | DIFFERENT | J0/S | The numeric value designates the first immutable version in explicit Lab positions. |
| `null (proposal.parent at version 1)` | DIFFERENT | J3 | At the chain root the Lab requires null. For version >1 it requires a same-scope exact parent. |
| `OFFER`, `REQUEST`, `REMARK`, `proposal`, `request`, `currentSelfPerformance`, `future`, `current` | SAME | E1/J3/J4 | Supported function/force/stance combinations only. Offer speech occurs now and proposes later world acts. |
| `action`, `exchange` | SAME | E0/J3 | Accepted node discriminators. Other paper tree nodes remain outside the executable Part A subset. |
| `Pay`, `Give`, `Accept`, `Refuse`, `Clarify` | DIFFERENT | D/J1/E2 | Recognizable actions or conversational functions. Their exact capitalized Lab act values are local. Clarify is a Request. |
| `Tell` | DIFFERENT | J1/J4 | **NEW IN PART A.** Lab act replaces the paper tell.content sense and selects the existing scoped information meaning. |
| `Decline` | NEW | J1/E2 | **NEW IN PART A.** Declining to answer is a distinct bounded Remark. Paper refusal and clarification concepts inform it. |
| `pay`, `give` | NEW | J3 | Chosen local term ID literals. |
| `USD`, `cent`, `minor-unit` | NEW | J3 | USD validates with unit cent. Every other accepted three-letter currency code validates with minor-unit. |
| `true (transfer.title and transfer.custody)` | NEW | J1/J3 | Only true on both fields. The artifact still records separate world title and custody effects. |
| `stock`, `list_price` | NEW | E2 | Lab classifier values, extended to Tell and Decline **in Part A**. |
| `true (stock Tell)`, `false (stock Tell)` | NEW | J4 | **NEW IN PART A.** Boolean assertion is attributed to the speaking actor. |
| `I decline to answer.`, `I don't have that fact.` | NEW | E2/J4 | **NEW IN PART A.** Fixed human wording independent of possession or the rules-only missing-fact wording. |

| Variable domain | Validator rule |
|---|---|
| Identity | Prefix `message_`, `run_`, `package_`, `actor_`, `proposal_`, `observation_`, `store_`, `subject_` or `unit_` as appropriate, then 4–32 lowercase hexadecimal digits |
| Digests | Exact references and M3 package digests are 64 lowercase hexadecimal digits. The expression-reference digest is the SHA-256 of canonical expression bytes. |
| Revisions | Positive safe integer for offer chain version and target proposal version. M3 package revision is a nonnegative safe integer. Expression and reference version use the literal 1. |
| Currency and quantity | The expression checker admits A–Z three-letter codes and positive safe integer minor amounts. The participant owns the corresponding currency account at checkout. List-price Tell uses a positive safe integer in the questioned offer's currency. |
| Text | Earlier reason strings are nonempty after trimming, at most 240 characters. Accept reason is optional. Refuse, Clarify, and Counter reasons are required in their respective shapes. Decline uses only the two fixed lines. |
| Ask, Tell and Decline | Clarify is REQUEST/request/current and carries body.missing plus body.reason. Tell is REMARK/currentSelfPerformance/current and carries body.missing plus body.fact. Decline has the same Remark force and carries body.missing plus body.reason. None of these acts grants assent. |

The adjacent message record uses id, sequence, expression, label and privateComposition. Private composition stores authorId, selectedVibe, selectedSalience, templateId and intendedFraming. EA and SE remain the authored vibes and SUBTLE, NUANCED and OVERT are the delivery salience values. The actual hearing carries outward expression, content.kind/text, framing and prominence. Existing kinds are proposal, question and response, and prominence is understated, measured or emphatic. Tell and Decline use response. These are separate from the expression checker and the literal counts above. The party hearing an answer receives its expression, reason or selected fact and outward cues.

### NEW IN PART A outside the expression

| Stored field, type or value | Location and meaning | Closest pinned concept |
|---|---|---|
| questions | Optional array on existing run.data.proposals entry. The containing entry supplies the exact proposal ID/version. | Existing proposalVersion and receipt history, J3/T2 |
| questions[].askerId, recipientId, missing, messageId, observationId | Who asked, who received, stock or list_price, exact question message and actual recipient hearing. | Paper expression, addressed communication and receipt, J3 |
| questions[].status | pending, told, declined or closed. Closed is used when the original version gets disposed of, with no erasure of its actual message. | Paper proposal and observation history. The exact small lifecycle is local. |
| questions[].answerMessageId, answerObservationId | Once answered, link to the actual Tell/Decline message and its native receipt. | tellEmission and tellReceipt, J4 |
| command.payload.action = answer_question; command.payload.question | Native send_message command. Question reference holds expression (exact Reference) and observationId (actual addressed hearing). | Scoped exact receipt, J3/J4 |
| command.payload.choice | Tell or Decline, explicit for human only. Rules answer from their own legitimate fact evidence without scoring. | Report boundary J4 and Lab decision v0.2 §4.2 |
| clarification_told, clarification_declined | Journal events for the actual answers. The event points to its causeMessageId and the delivered messageId. | Communication emission and receipt, J4 |
| event.details.factObservationId | Private proof of the teller's actual received fact. Bound to Tell only. The listener gets one selected fact and attribution. | tellEmission.actualSource in J4 |
| receipt.result.followUp; decision.rule = R2 | Optional next Offer/Remark outcome committed through the same native command. R2 annotates the private refusal decision after a delivered decline. | New scoped decision and communication linked to actual receipt, E2/J4 |
| lab-headless-generalization-save@2; package revision 3; lab-headless-generalization@2 | Changed save label, authored package revision and package digest input domain. The old envelope has historical runner guidance. | M3 package identity and S version boundaries |

An actor's product reference projects priceObservationId or availabilityObservationId from its actual Tell receipt. Those projected keys are recomputed from the native observation list. They do not add another memory store. The M3 packageRef wire field and its digest key are inherited from M3. The digest derivation and the exact expression-reference digest, runId, reply, catalog IDs and nested transfer booleans are Lab choices.

### Tell paper crosswalk

The paper J1 tell.content row and J4 tellReport use an action sense, typed roles.actor and roles.recipient, contentTopic, reportMode and truthWarranty. The Lab replaces sense with act Tell, uses flat actor and recipient IDs, and selects one item fact through missing and fact.productId/unitId/value. The single attributed report mode and absence of a warranty are fixed by the Lab's supported act. There is no authored reportMode or truthWarranty switch. J4 places selectedContent with claim and attribution alongside the action, describes tellEmission.actualSource, and records the receiving proof as tellReceipt. The Lab instead stores the selected content inline, takes attribution from the expression speaker, records the actual source observation on the trusted event, and uses the native addressed hearing plus exact question reference. These are local differences in serialization and evidence binding. The actor receives a report of what the teller legitimately believes. Actual price, stock, available cash and ownership remain subject to authoritative checkout.
