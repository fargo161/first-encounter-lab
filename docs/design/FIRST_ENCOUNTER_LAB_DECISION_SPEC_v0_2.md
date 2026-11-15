# First Encounter Lab: character decision specification, v0.2

**Date:** 2026-11-14
**Status:** for Teddy's review. Not yet a build instruction. Replaces v0.1.
**Builds on:** `FIRST_ENCOUNTER_LAB_INTERACTION_DESIGN.md` (decisions D1 to D11, as amended).
**Purpose:** say exactly how a rule-driven character decides what to do, precisely enough to build and to test.

## 0. What changed from v0.1, and why

v0.1 was written without the existing code or accepted designs open. v0.2 was written after reading them, and after ChatGPT's review.

**Read for v0.2** (repository `fargo161/First-Encounter-Game`):

| Source | Where | Read |
|---|---|---|
| M3 decision, message and type code | `main` at `76a92fd`: `packages/encounter-atlas/src/m3/policy.mjs`, `meaning.mjs`, `types.mjs`, `contracts.mjs`, parts of `engine.mjs`; `content/m3/seed.json` | Read, not run |
| Accepted KeyWrapping design | branch `codex/economy-substrate-v0.1-accepted-baseline` at `cc8371c`: `TRANSACTIONS_COMMITMENTS.md`, `EXPRESSIONS_COMPATIBILITY.md` | Read |
| Accepted Economy design | same branch: `phase-10/FINAL_INVARIANT_REGISTER.md`, `RESIDUAL_DECISION_REGISTER.md` (D08) | Read |

**Not read:** the EA-IE Python source, the 66-word action dictionary in detail, the rest of the Economy phases, and M3's engine in full.

**Changes:**

| # | Change | Came from |
|---|---|---|
| 1 | "Cannot", "may not" and "will not" are now three separate things (section 5) | ChatGPT's point 1. The accepted KeyWrapping design also requires it |
| 2 | A choice may be hidden or greyed only for reasons the character itself knows (section 5.4) | Accepted KeyWrapping design |
| 3 | Delivery is read from what the listener actually receives, not from the BASED vibe chosen (section 3.3) | ChatGPT's point 2, confirmed in M3's code |
| 4 | Rules for how a shopper picks a product and an opening proposal (section 10.2) | ChatGPT's point 3 |
| 5 | Defer no longer depends on a proposal having an end time (section 4.3) | ChatGPT's point 4 |
| 6 | A lasting gain needs a cause that has not been counted before (section 9.4) | ChatGPT's point 5 |
| 7 | The result is recorded before anything is shown (section 9) | ChatGPT's safeguard. v0.1 had memory last, which was wrong |
| 8 | The six responses are decisions; what is said still uses Request, Offer or Remark (section 4.1) | Accepted KeyWrapping design |
| 9 | Missing a due time no longer ends an arrangement; a hand-over counts once (sections 9.4, 9.5) | Accepted KeyWrapping and Economy designs |
| 10 | Five Lab policies are now named as policies, because the accepted designs leave them open on purpose (section 12) | Accepted KeyWrapping and Economy designs |
| 11 | The decision record reuses M3's existing shape (section 13) | M3's code |

The four worked cases and their totals are unchanged.

**Correction, 2026-11-14.** The first issue of v0.2 said M3 stores priorities as a free list of names and numbers. ChatGPT checked the source and found that M3 fixes them to three named priorities. Section 7.1 now says so, and says the record must be widened on purpose.

## 1. Summary

Every rule-driven character uses one decision process with five steps. The same process answers a message and chooses the next step of a routine. There is one table, not separate systems for personality, priorities and scoring.

```text
1. What is happening?      the trigger, what I know, how it came across
2. What can I do?          possible responses, minus what is impossible or forbidden
3. What matters to me?     one table: my priorities, my attitude, my situation
4. Which do I choose?      highest total; fixed tie-break; no dice
5. Record, then show       result and memory first; words, face and body after
```

Seven rules hold everywhere in this document:

- **R1. One table.** A role sets what matters. Personality adjusts how much. The table compares the possible responses.
- **R2. Rules before preferences.** Nothing impossible or forbidden can be chosen, whatever the score.
- **R3. Same situation, same choice.** No randomness anywhere in the Lab.
- **R4. Every point has a reason in plain words,** and every reason names where it came from.
- **R5. Nothing happens off-screen.** While you are away only the clock moves.
- **R6. Record first, show after.** Words, delivery, face and body present a result that is already recorded. Playing, skipping or replaying them changes nothing.
- **R7. A character uses only what it knows.** That covers its decisions and its menu alike.

A human controlling a character replaces step 4 only. Steps 1, 2 and 5 apply to them exactly as to a rule-driven character.

## 2. Words used

| Word | Meaning |
|---|---|
| Trigger | The thing that makes a character decide now |
| Response | One of six kinds of decision (section 4) |
| Candidate | A response that is possible in this situation |
| Consideration | One row of the table: one thing the character cares about |
| Effect | Whether a candidate helps (+1), hurts (-1) or does nothing (0) for a consideration |
| Weight | How much a consideration counts |
| Points | Weight times effect |
| Role sheet | Data describing a job: priorities, permissions, policies, terms, routine |
| Personality sheet | Data describing one person: five small adjustments (section 7) |
| Outward part | The part of a message the listener receives |
| Private part | The part of a message only its author has |

Proposal, arrangement, subject and reference keep their meanings from the interaction design.

## 3. Step 1: what is happening?

### 3.1 Triggers

| Trigger | Example |
|---|---|
| A message arrives | The customer asks the clerk to hold an item |
| A reply to my own proposal arrives | The clerk answers with a different offer |
| I see something physical | The customer puts money on the counter |
| A routine step is due | The customer has reached the shelf and must pick a product |
| I return after time away | The customer walks back in the next day |

### 3.2 What the character may use

Only these, and nothing else:

- subjects it has a reference to
- proposals and arrangements it is part of, with their frozen terms
- events it saw or was told about
- its own money, held items, permissions, and stored warmth and trust toward the other person
- the current step-clock time
- the outward part of the message (3.3)

It may never read the full world record, another character's memory, or the private part of someone else's message.

M3 already works this way. Its decision function takes one filtered view of what that character knows and nothing else.

### 3.3 How delivery is read

**What M3's code shows.** A message has two parts.

- The **private part** holds the BASED vibe and intensity the author chose. Only the author has it.
- The **outward part** holds a list of **cues**, each with a kind and a sentence, and a **prominence**: understated, measured or emphatic. The listener gets this.

So a listener never sees "Compassionate, Nuanced". They see, for example, a cue of kind `displayed_concern` at measured prominence. v0.1 had tastes keyed to the five BASED letters, which the listener does not have. That is corrected here.

**The rule.** Each character has a **delivery taste**: for each kind of cue, it likes (+1), is neutral to (0), or dislikes (-1) being addressed that way.

1. **Fit** = the sum of the taste for every cue in the outward part.
2. At **understated** prominence the fit counts only if it is +2 or more, or -2 or less. Otherwise treat it as 0.
3. **Delivery nudge** = +1 if the fit is above 0, -1 if below 0, otherwise 0.

The nudge shifts warmth by one step **for this exchange only**. It is the "passing reaction" in D10: used once, not stored.

**Effective warmth** = stored warmth + delivery nudge. Range -3 to +3.

Delivery can tip a close decision. It can never remove a restriction or change a fact.

**Two facts about M3 a builder must know.**

- Only three of the twenty vibes have outward cues written: Boundaried (`scope_limit`), Compassionate (`displayed_concern`) and Menacing (`direct_demand`, `possible_consequence`). Every other vibe the Lab offers needs its cues written first. This is an open decision (section 15).
- M3's characters do not react to delivery when they choose a reply. One cue kind changes a line of description and nothing else. Delivery affecting a decision is new behaviour.

## 4. Step 2: what can I do?

### 4.1 The six responses

| Response | Meaning | What is actually said |
|---|---|---|
| Accept | Agree to the exact terms | A Remark that plainly accepts one numbered version |
| Refuse | Decline | A Remark |
| Counter | Answer with different terms | An Offer: a new version linked to the old one |
| Defer | Put the decision off | A Remark naming what is being waited on |
| Clarify | Ask for something needed before deciding | A Request for the missing term |
| Acknowledge | Take in a statement without agreeing or disagreeing | A Remark |

The six are kinds of **decision**. They are not a second language. Whatever a character says still goes out as a Request, an Offer or a Remark, as the accepted KeyWrapping design requires. The same six work for a clerk, a landlord or a bartender.

### 4.2 Which responses are candidates

| Trigger | Candidates | How one is chosen |
|---|---|---|
| Offer, or Request for an item, an action or more time | Accept, Refuse, Counter, Defer | Scored in the table (section 6) |
| The same, but a needed term is missing (how much, by when) | Clarify | No scoring. Clarify, unless the character already knows the thing is impossible or forbidden; then Refuse, saying so |
| "Yes" or "fine" that could mean more than one open proposal | Clarify | No scoring |
| Request for information | Accept (tell), Refuse | No scoring. Tell, unless the information is marked private on the character |
| Remark | Acknowledge | No scoring. May still change warmth or trust (section 9.4) |
| A Counter to my own proposal | Treated as a new Offer to me | As the first row |
| Accept of my own proposal | No response. Move to Settle or Do | Interaction design D6 |
| Refuse or Defer of my own proposal | Acknowledge | No scoring. My routine decides what I do next |

### 4.3 Two candidate rules

**Counter.** A role sheet lists the terms the character insists on for each kind of deal (section 7.1). A Counter is the same proposal with those terms put in. If the proposal already meets them, Counter is not a candidate.

**Defer.** Defer is a candidate only when all three are true:

- the first thing the proposal asks for is not due right now
- the character can name a fact that bears on the decision and could change. Examples: a delivery of stock is expected; an arrangement with this person is currently overdue
- if the proposal has a "good until" time, that fact could change before it

A Defer records the fact being waited on and when the character will look again: at a named time, or at the next meeting. A proposal with no "good until" time can be deferred on the same terms.

Why: without the named fact, Defer scores 0 against everything and "I'll think about it" becomes the answer to every hard question.

## 5. Cannot, may not, will not

v0.1 put these in one list. They are three different things, and the accepted design says so directly: a permission is separate from a physical ability, and a prohibition can be physically broken.

| Class | Meaning | Where it acts |
|---|---|---|
| **Cannot** | Impossible. The world will not let it happen | At the moment the act is attempted. An attempt that fails is recorded as a failed attempt |
| **May not** | Forbidden. Physically possible, not allowed | In the Lab, removed from a character's choices. Later, it can become choosable with consequences |
| **Will not** | Unwilling. Possible and allowed, but not chosen | The table (section 6) |

### 5.1 Cannot

| # | Rule | Store example |
|---|---|---|
| C1 | You cannot mention or act on a subject you have no reference to | A customer cannot ask about stock they have never heard of |
| C2 | You cannot hand over what you do not hold, or take what you cannot reach | |
| C3 | You cannot pay more than you hold | |
| C4 | You cannot sell more than the stock count | |
| C5 | A hand-over at the counter needs both people at their spots | Paying requires standing at "Customer pays" |
| C6 | You cannot accept a proposal version that is no longer open, or that was not made to you. Terms are the frozen ones | |
| C7 | The game cannot carry out a response it has not been built for, or handle a message shape it does not support | D2 and D4 |

Promising is not the same as doing. C3 stops a payment. It does not stop a promise to pay later, even one the character cannot keep. The accepted design is explicit that an agreement can form despite inability or dishonesty.

### 5.2 May not

| # | Rule | Store example |
|---|---|---|
| M1 | You may not sell, lend, discount or give away what you neither own nor have permission to dispose of | The clerk sells store stock because the role sheet permits it |
| M2 | You may not break a policy your role marks as "never" | "Never sell below list price" |
| M3 | In Play Mode, control may not be switched | D7 |

A role's policies are each marked **never** (M2) or **discouraged** (a cost in the table). That mark is data on the role sheet.

### 5.3 Two decision limits

These are not restrictions on the world. They keep a rule-driven character from looping.

| # | Limit |
|---|---|
| L1 | One character makes at most two Counters in one chain of offers. After that: Accept or Refuse |
| L2 | A character does not Defer the same proposal twice for the same named fact |

### 5.4 What the menu may show

**A choice may be hidden or greyed only for a reason the controlled character itself knows.**

- Own-knowledge reasons are fine: "you don't have enough money", "you aren't at the counter", "your job doesn't allow that".
- A reason resting on something the character does not know must never filter the menu. A customer who does not know the shelf's last bottle is already promised to someone can still offer to buy it. The offer goes out, and the clerk answers.

Why: the accepted design forbids the menu acting as a hint about hidden facts. A greyed-out button that knows more than your character does is a leak.

The same holds for a rule-driven character listing its candidates: it removes only what it knows to be impossible or forbidden.

Interaction design D5 is amended to match.

## 6. Step 3: the decision table

### 6.1 Rows

Every scored decision uses the same row types.

| Row | Weight | Effect |
|---|---|---|
| Each role priority, in rank order | Top priority 4, then 3, 2, 1. Personality may move one or two of them by 1 | +1 helps, -1 hurts, 0 neither, according to that priority's effect rules on the role sheet |
| Goodwill | Effective warmth (-3 to +3) | +1 the other person gets what they asked, as asked. 0 they get changed terms or a delay. -1 they are denied |
| Risk I take on | 2 minus stored trust (0 to 4) | 0 not exposed. -1 exposed, small stake. -2 exposed, large stake |

"Exposed" means: after this response I have handed over or set aside something, and I am relying on the other person to do their part later. The line between a small and a large stake is a number on the role sheet.

**Points** for a row = weight x effect. **Total** for a candidate = the sum of its points.

### 6.2 Circumstances

A circumstance is a current fact the character knows that changes an effect. It never adds a row.

| Circumstance (Lab) | What it changes |
|---|---|
| Stock of this item is 1 | Setting it aside blocks a sale today, so "make money" turns from +1 to -1 for responses that hold it, and from -1 to 0 for refusing |
| An arrangement with this person is overdue | Any response that exposes me further counts as a large stake |
| I do not have enough money | Paying now fails C3, leaving only "pay later" proposals |

Each circumstance is a named rule on the role sheet, so more can be added as rows of data.

### 6.3 Why warmth and trust enter this way

Warmth multiplies how much I care about pleasing you. Trust shrinks or grows how much a risk worries me. Neither one decides alone: a policy or a shortage can outweigh both. That is D10's first limit, built into the arithmetic.

## 7. Role and personality

### 7.1 Role sheet: what the job brings

| Part | Contents |
|---|---|
| Priorities | Four, ranked, each with its effect rules |
| Permissions | What this job may do |
| Policies | Each marked never or discouraged |
| Insisted terms | What the character holds out for, per kind of deal |
| Stake line | The value above which a stake is large |
| Routine | A fixed list of steps (section 10) |

M3 already stores `roles`, `priorities` and an `acceptanceThreshold` on each character. Its type check (`types.mjs`) allows exactly three priority names: `service`, `privacy` and `verification`. Its decision code does not read the priorities or the threshold.

So the four-priority role sheet does **not** fit M3's character record as it stands. The type check must be deliberately widened to accept a role's own list of priorities. That is a change to M3's types, it needs its own approval, and it has not been done. The role sheet should still live in that one place, not in a second one.

**Starting sheet: store clerk.** These are starting values to be tuned in Development Mode.

| Priority | Weight | Helps (+1) | Hurts (-1) |
|---|---|---|---|
| Keep my job | 4 | | The response breaks a discouraged policy |
| Make money for the store | 3 | Leads to a sale at list price, now or later | Loses a likely sale, or sets aside the last one in stock |
| Help customers | 2 | The customer gets what they asked, as asked | The customer is denied |
| Avoid extra work | 1 | | The response leaves me something to keep track of |

- Permissions: sell store stock; take payment; set an item aside.
- Policies: never sell below list price; never hand over unpaid goods without an accepted arrangement; never give credit above $5; holding an item without a deposit is discouraged.
- Insisted terms: a hold needs a deposit of 40% of the price, rounded up to a whole dollar; pay-later is due by the next day.
- Stake line: $5.

**Starting sheet: shopper.**

| Priority | Weight | Helps (+1) | Hurts (-1) |
|---|---|---|---|
| Get what I came for | 4 | I leave with it, or with a firm arrangement for it | I leave without it |
| Keep to my budget | 3 | I pay less than I planned | I pay more than I planned |
| Stay on good terms here | 2 | The clerk gets what they asked | The clerk is denied |
| Don't waste time | 1 | | The response means another trip or more steps |

- Wants: a short authored list, each with a kind of product and a budget. For example "a drink, up to $3".
- Insisted terms: never above list price; a deposit of at most half; pay-later by the next day.

### 7.2 Personality sheet: five adjustments

| # | Adjustment | Allowed values | What it changes |
|---|---|---|---|
| 1 | Priority nudges | Up to two, each +1 or -1 to one priority's weight | Section 6 weights |
| 2 | Leaning | Cautious, even, obliging | The tie-break order (section 8) |
| 3 | Delivery taste | Likes, neutral or dislikes, for each kind of cue | Section 3.3 |
| 4 | Own manner | One BASED vibe each for when things go well, plain, and badly | The delivery of their replies (section 9.2) |
| 5 | Memory temper | Forgiving, even, unforgiving | How far trust falls on a broken promise (section 9.4) |

That is the whole of personality in the Lab. A new character is a role plus these five. This is your rule "role predicts what; personality shapes how and exceptions", written as data.

## 8. Step 4: choosing

1. The candidate with the highest total wins.
2. A tie is broken by the character's leaning:

| Leaning | Order of preference in a tie |
|---|---|
| Cautious | Refuse, Defer, Counter, Accept |
| Even | Counter, Defer, Accept, Refuse |
| Obliging | Accept, Counter, Defer, Refuse |

3. There is no randomness. The same inputs always give the same choice.

M3 already picks the highest-ranked eligible candidate and breaks ties by a fixed order. The leaning sets that order.

**A human-controlled character.** The human picks from the candidates left after section 5. The table is still worked out in the background as "what this character's rules would have chosen". It is shown only in Development Mode and never limits the human (D10, limit 3).

## 9. Step 5: record, then show

One decision produces a record, and then a performance of that record.

```text
decision  ->  RECORD: event, proposal and arrangement changes, warmth and trust changes
          ->  SHOW:   words, delivery, face and body
```

Everything under SHOW reads the record. Nothing under SHOW can write to it. Skipping, cancelling or replaying a performance makes no new event, no second payment and no second change to warmth or trust.

### 9.1 Decision and words

The decision is the response and its exact terms. Encounter records it.

The spoken line is built from a written template chosen by the response and its **stated reason**. No AI is involved. A line may never contain an amount, a condition or a promise that is not in the recorded terms.

The stated reason is:

- for a Refuse because the thing is impossible or forbidden: that rule ("I can't sell below the marked price")
- otherwise, for a Refuse or a Counter: the row that counted most against Accept ("it's my last one")
- for a Defer: the named fact being waited on ("let me see what comes in tomorrow")

The stated reason is something the character says out loud about itself. It is the only part of its reasoning another character receives. The table and the totals are never passed on.

In the Lab a character states its real reason. Giving a false reason is left for later.

### 9.2 Delivery of the reply

| Effective warmth | Vibe used | Prominence |
|---|---|---|
| +1 or more | Own manner: going well | Measured; emphatic at +3 |
| 0 | Own manner: plain | Measured |
| -1 or less | Own manner: going badly | Measured; emphatic at -3 |

The reply's vibe is private to the character, like anyone's. The listener receives its cues and prominence.

In the Lab, delivery is shown through the cue sentence and the face. The main line does not change with it. Different wordings per vibe can be added later as more templates.

### 9.3 Face and body

Two moments, played by the hear-then-reply player. Names are from the shared expression list.

**Hearing the message:**

| Delivery nudge | Face | Body |
|---|---|---|
| +1 | Pleased | Idle, facing the speaker |
| 0 | Neutral | Idle, facing the speaker |
| -1 | Doubtful; Annoyed if the delivery was emphatic | Listen (arms crossed) |

A proposal with a large stake shows Surprised instead.

**Replying:**

| Response | Warm (+1 or more) | Plain (0) | Cool (-1 or less) | Body |
|---|---|---|---|---|
| Accept | Pleased | Neutral | Neutral | Talk |
| Counter | Neutral | Doubtful | Doubtful | Talk |
| Refuse | Worried | Neutral | Annoyed | Shrug |
| Defer | Neutral | Doubtful | Doubtful | Talk |
| Clarify | Neutral | Doubtful | Doubtful | Talk |
| Acknowledge | Pleased | Neutral | Annoyed | Talk; Greet for a greeting |

When goods or money change hands: the giver plays Offer, the receiver plays Take, and a clerk at the register plays Touch.

If a face has no picture for a name, Neutral is shown and the gap is logged. "Amused" is not used in the Lab.

These tables are starting values, held as data.

### 9.4 Lasting changes to warmth and trust

**The rule against cheap gains: a lasting gain needs a cause that has not been counted before.** Each row below fires once for each distinct cause. Repeating the same pleasant exchange changes nothing the second time.

A character changes a judgment only when it becomes aware of the event. Both values stay between -2 and +2. Every change records the event that caused it.

| Event the character becomes aware of | Warmth | Trust | Fires |
|---|---|---|---|
| The other person did their part of an arrangement on time | | +1 | Once per part |
| The other person missed a due time | | Forgiving: -1. Even: -1, or -2 for a large stake. Unforgiving: -2 | Once per part |
| They did it late, after missing | | No change. The "overdue" circumstance ends | Once per part |
| First completed purchase between these two | +1 | | Once per pair of people |
| They asked for more time before the due time, and I accepted | | No change. The part gets a new due time and is not missed | |
| They apologised for a specific missed part | +1 | No change | Once per missed part |
| Emphatic delivery that I like | +1 | | Once per pair of people, ever |
| Emphatic delivery that I dislike | -1 | | Once per conversation |

An apology warms the relationship and leaves trust where it was. Only doing what you said rebuilds trust. This matches the accepted design: forgiving someone does not waive what they owe.

Charm alone can lift warmth by one step, once. Everything beyond that needs something to have happened.

Every event is also remembered as an event in its own right, whether or not it changed a judgment, so it can be brought up later through KeyWrapping.

### 9.5 Arrangements: late is not the same as ended

The accepted design says one arrangement can be partly done, overdue and disputed all at once, and that no single status may stand in for that. So:

- Each part of an arrangement keeps its own facts: who owes it, to whom, what, by when, and whether it has been done.
- Missing a due time marks that part **overdue**. It does not end the arrangement. The part can still be done late.
- An arrangement ends when every part is done, or when the person a part is owed to releases it.
- A hand-over counts toward one part, once. Replaying or re-acknowledging it never counts twice.
- Doing part of what is owed counts for that part only. In the Lab, part-payments are not built (C7); the record must still be able to hold them.

Interaction design D8 is amended to match.

## 10. Routines

A routine is a fixed, ordered list of steps. It is not planning: the character does not work out how to reach a goal.

### 10.1 The two Lab routines

| Role | Routine |
|---|---|
| Clerk: mind the store | Stand at the Cashier spot. Face whoever comes to the counter. Answer them. |
| Shopper: buy what I came for | Enter. Look over the shelves. Pick a product. Go to the counter. Make an opening proposal. Handle the reply. Settle or do my part. Leave. |

- A message arriving pauses the routine. The character decides and replies, then the routine resumes at the same step.
- The shopper's routine is needed only for clerk-controlled play, so it is built last.

### 10.2 The shopper's two choices

Both use the shopper's own table from section 7.1. The candidates are different, so each needs its own tie-break.

**Picking a product.** Looking over the shelves gives the shopper a reference to each product seen and its marked price.

- Candidates: every product seen that matches a want.
- Effects: "get what I came for" +1 for a match. "Keep to my budget" +1 if the price is under the want's budget, -1 if over, 0 if equal.
- Tie-break, in order: lowest price; then the first one seen.
- If nothing seen matches any want: leave.

A product priced above the cash the shopper holds stays a candidate. The shopper knows its own cash, so it simply plans a different opening.

**Picking an opening proposal.**

| Candidate | Available when | Get what I came for | Keep to my budget | Stay on good terms | Don't waste time |
|---|---|---|---|---|---|
| Offer to buy now at the marked price | Cash covers the price | +1 | by price against budget | 0 | 0 |
| Offer to take it now and pay later | Always | +1 | by price against budget | -1, it asks a favour | 0 |
| Ask the clerk to hold it | Always | +1 | by price against budget | -1, it asks a favour | -1, another trip |
| Leave without it | Always | -1 | 0 | 0 | 0 |

Goodwill and Risk do not apply to an opening, because nobody has asked the shopper for anything yet.

Tie-break, in the order the table lists them.

## 11. Time away

While the player is away, nothing is simulated. On return, these run once, in this order:

1. Proposals past their "good until" time are marked expired.
2. Arrangement parts past their due time are marked overdue, and section 9.4 is applied for each character who would know.
3. Any event the scenario schedules for a set time takes place, for example a stock delivery.
4. A decision that was deferred is made at the moment the two characters next meet, by the normal five steps, with the facts as they then stand.

A stretch of time is worked out once. Coming back a second time never replays it.

## 12. Lab policies

The accepted KeyWrapping and Economy designs deliberately leave these open and say a scenario must choose, not assume. Each is a choice for the Lab only. None is a rule for the wider game.

| # | Policy for the Lab | What the accepted design says |
|---|---|---|
| P1 | A Counter makes the earlier version no longer open. The earlier version and everything said about it stay in history | Whether an old version stays open after a counter is an owner choice. "Latest wins" must not be assumed silently |
| P2 | Sending an Offer counts as the sender's own agreement to that version, because an Offer states what the sender will do. A Request commits the sender to nothing unless it is joined to an undertaking | An arrangement forms only when every required person has agreed to the exact version. A proposer is not committed just by proposing, unless the proposal states their undertaking |
| P3 | Settle checks first that both sides can deliver, then records the payment and the hand-over as two separate effects, one after the other. It does not promise to undo one if the other fails. If something does go wrong, putting it right is a new effect | No all-or-nothing exchange is promised. A refund or return is always a new effect |
| P4 | A part is on time if it is done at or before its due time on the step clock | Deadline edges and grace periods are open |
| P5 | Time away works as section 11 describes | How much happens off-screen, and what skipped time costs, is an open owner decision (Economy D08). No catch-up rule is chosen for the wider game |

Interaction design D3 and D6 are amended to match P1 to P3.

## 13. Developer inspection

Every decision writes one record. Development Mode shows it in the same five stages.

| Stage | What the record holds |
|---|---|
| 1. Trigger | What set it off; the message and its frozen terms; the cues and prominence as received; the fit and the nudge |
| 2. Candidates | Every response considered. For each one removed: its class (cannot or may not), the rule number, and the plain reason |
| 3. Table | For every candidate and every row: weight, effect, points, the reason in plain words, and the source |
| 4. Choice | Totals, whether there was a tie, the leaning used, the winner |
| 5. Record and show | The stated reason, the line, the reply's delivery, both faces, the gesture, and every change to memory with its cause |

**Source** is always one of: role, personality, stored warmth or trust (with the event that last changed it), circumstance, or delivery.

**Reuse M3's shape.** M3's decision function already returns the chosen response, the full candidate list (each with eligible or not, a rank, a reason and a fixed order), and the list of things the character had observed that the decision rested on. This record should extend that:

- "eligible: no" gains the class and rule number
- the rank becomes the total
- the rows are added under each candidate
- the fixed order is the leaning's order

Rules for the inspector:

- Looking never changes anything.
- Any value on a role sheet, a personality sheet, warmth, trust, money or stock can be edited. Each edit is logged as a developer edit, apart from the world's history.
- "Rerun from here" replays the same trigger after an edit, so one change can be compared against the original.
- For a human-controlled character it also shows what the rules would have chosen.
- None of it is visible in Play Mode, and none of it is ever passed to another character.

## 14. Worked example

The same clerk, the same request, four situations. The clerk uses the starting sheet, with an even leaning, and likes being addressed with displayed concern.

**Request:** "Hold this $5 item for me until tomorrow." The terms are complete, so Clarify does not apply. The clerk can name nothing that might change, so Defer is not a candidate. Nothing is impossible or forbidden. Candidates: Accept (hold, no deposit), Counter (hold with a $2 deposit), Refuse.

### Case 1: a stranger, asking with displayed concern, three in stock

Warmth 0, trust 0, delivery nudge +1. Effective warmth 1. Risk weight 2.

| Row | Weight | Accept | Counter | Refuse |
|---|---|---|---|---|
| Keep my job | 4 | -4, a hold with no deposit is discouraged | 0 | 0 |
| Make money | 3 | +3, likely sale tomorrow | +3 | -3, sale may be lost |
| Help customers | 2 | +2, gets what was asked | 0, changed terms | -2, denied |
| Avoid extra work | 1 | -1, something to track | -1 | 0 |
| Goodwill | 1 | +1 | 0 | -1 |
| Risk I take on | 2 | -2, item set aside on a promise | 0, deposit covers it | 0 |
| **Total** | | **-1** | **+2** | **-6** |

**Result: Counter.** "I can hold it if you leave a $2 deposit." Stated reason: store policy on holds.

### Case 2: a customer who has kept promises before

Warmth +2, trust +2, same delivery. Effective warmth 3. Risk weight 0.

| Row | Accept | Counter | Refuse |
|---|---|---|---|
| Keep my job | -4 | 0 | 0 |
| Make money | +3 | +3 | -3 |
| Help customers | +2 | 0 | -2 |
| Avoid extra work | -1 | -1 | 0 |
| Goodwill | +3 | 0 | -3 |
| Risk I take on | 0 | 0 | 0 |
| **Total** | **+3** | **+2** | **-8** |

**Result: Accept.** The clerk bends the discouraged policy for someone they like and trust. The inspector shows the two rows that changed, and the events that raised warmth and trust.

Warmth +2 here is reachable under section 9.4: one step from a first completed purchase, one from a single well-received emphatic delivery. Trust +2 takes two parts kept on time.

### Case 3: the same trusted customer, asking in a way the clerk dislikes

Delivery nudge -1. Effective warmth 1. Goodwill for Accept falls from +3 to +1.

Totals: Accept **+1**, Counter **+2**, Refuse **-6**.

**Result: Counter.** How it came across tipped a close call. It changed no fact and no rule.

### Case 4: the stranger again, but it is the last one in stock

The "stock is 1" circumstance turns "make money" to -3 for both holding responses and to 0 for refusing.

Totals: Accept **-7**, Counter **-4**, Refuse **-3**.

**Result: Refuse.** "Sorry, it's my last one." Stated reason: the last one in stock.

## 15. Open decisions for Teddy

| # | Decision | Recommended | Why |
|---|---|---|---|
| Q1 | How many of the twenty BASED vibes does the Lab offer? Only three have their outward cues written | All twenty, each mapped onto a short shared list of about ten cue kinds, with one sentence each | Tastes are set per cue kind, so twenty vibes cost a twenty-row table, not twenty systems. A composer offering only three would undersell BASED |
| Q2 | Accept the five Lab policies P1 to P5? | Yes | Each is the plainest choice that fits a two-person store, and each is marked as Lab-only |
| Q3 | Accept the amendments to the interaction design that follow from this (D3, D5, D6, D8)? | Yes | They bring it into line with designs you had already accepted |

## 16. Checks this specification must pass

| # | Check |
|---|---|
| T1 | The same starting state and inputs give the same decisions, every run |
| T2 | The four cases in section 14 give the results shown |
| T3 | With every weight set to an extreme, nothing impossible or forbidden is ever chosen |
| T4 | Every point in every record has a reason and a source. None is blank |
| T5 | Changing only the delivery never changes which candidates survive section 5 |
| T6 | No chain of offers contains more than two Counters from one character |
| T7 | Defer never appears without a named fact and a time to look again |
| T8 | A human-controlled character is offered exactly the candidates a rule-driven one would have had |
| T9 | After time away, the four catch-up steps run once and in order, and returning again does not rerun them |
| T10 | Opening the inspector changes nothing in the world |
| T11 | A face with no picture for a name shows Neutral and logs the gap |
| T12 | No menu entry is hidden or greyed for a reason the controlled character does not know |
| T13 | The record exists before the performance starts. Skipping or replaying the performance adds nothing to the record |
| T14 | Repeating the same pleasant exchange produces no second gain in warmth |
| T15 | The private part of a message never appears in what a listener is given |
| T16 | One hand-over is counted toward one arrangement part, once |
| T17 | A part done late is recorded as both done and late. The arrangement does not end at the missed time |

## 17. Still unchecked

| Item | Why it matters |
|---|---|
| The EA-IE Python reference | It holds the accepted rules for who has learned which reference. Sections 3.2 and 5.1 (C1) should be compared with it |
| The 66-word action dictionary | Which words carry the six responses and the insisted terms |
| How stored warmth and trust relate to the "stance" records in the accepted designs | The designs treat "trusts" as a candidate kind of statement, not as settled stored data. Section 6 may need renaming to fit |
| M3's engine in full | Only the decision, message and type code were read |
| Nothing here has been run | This is a paper specification. The arithmetic was checked by hand |

## 18. Not decided here

- The final numbers on each character's sheets. The ones here are starting values.
- Product names, prices and starting money.
- The wording of the reply templates and the cue sentences.
- Screen layout for the composer and the inspector.
- Characters giving false reasons, breaking rules, misreading delivery, or acting on anyone other than the person in front of them.
