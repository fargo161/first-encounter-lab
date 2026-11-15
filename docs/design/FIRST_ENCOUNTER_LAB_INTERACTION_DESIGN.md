# First Encounter Lab: interaction design

**Date:** 2026-11-14
**Status:** settled. This replaces draft 1 and draft 2.
**Purpose:** how a character talks and acts in the Lab. The build brief must follow it.
**Companion:** `FIRST_ENCOUNTER_LAB_DECISION_SPEC_v0_2.md` covers how a rule-driven character decides what to do.

## 1. Status of each decision

| Decision | Status |
|---|---|
| D1 to D10, including the four changes ChatGPT asked for | Accepted by Teddy on 2026-11-14 |
| The guards added in D2, D4, D8 and D10, and the "put it off" reply in D3 | Recommended by both reviews. Carried as accepted unless Teddy says otherwise |
| D11, the same encounter played from both sides | Recommended by both reviews. Carried as accepted unless Teddy says otherwise |
| Amendments A1 to A5 below | Made on 2026-11-14 after reading the accepted KeyWrapping and Economy designs. Awaiting Teddy's confirmation |

**Amendments.** The decision specification was checked against designs Teddy had already accepted. Where they disagreed with this document, this document was changed.

| # | Decision | What changed | Why |
|---|---|---|---|
| A1 | D3 | "A different offer closes the old one" is now marked as a Lab policy, and the rule for when an arrangement forms is stated | The accepted KeyWrapping design leaves both open and says a scenario must choose them on purpose |
| A2 | D4 | The stored message uses the structure the accepted KeyWrapping design already describes | It exists; a second structure would be a parallel system |
| A3 | D5 | A choice may be hidden or greyed only for a reason the controlled character itself knows | The accepted design forbids the menu hinting at hidden facts |
| A4 | D6 | Settle no longer promises "both or neither" | The accepted Economy design promises no all-or-nothing exchange; a refund is always a new effect |
| A5 | D8 | Missing a due time marks a part overdue. It no longer ends the arrangement | The accepted design keeps "late" and "finished" as separate facts |

The rule behind every decision is the October 25 rule: **the store tests the interaction language; it does not define it.** Each answer is written as a general rule that would also work in a bar, an apartment or a street. The store is only the example.

One rule sums up the four revised decisions:

> **The stored language stays general. The Lab's screen and the Lab's rules stay small. The engine refuses, in plain words, anything it has not been built to handle.**

## 2. Already decided

Decided on 2026-11-14:

| Topic | Decision |
|---|---|
| Mannequins | The slim pair: slim male and slim female from Arcade Cast v0.12 |
| Store props | Plain boxes are acceptable for the shelf, rack, register and monitor. The model library does not need finding first |
| Faces | Goose for the male, the Brifern head for the female, for now |
| Encounter base | M3, with the Python pieces as references |
| Order of work | Control is swappable from the start. The customer-controlled step is proven first |
| Middle BASED label | Nuanced |
| Room Creator | Combat Room v0.1.1 (2026-11-02), with combat and shooting switched off |
| Delivery | One page that opens by double-click |
| View | First person, inside Room Creator's 3D view. Faces in a separate window |

Settled earlier and carried in unchanged:

- A message is a Request, an Offer or a Remark, delivered with a BASED vibe at Subtle, Nuanced or Overt.
- BASED changes how something is said. It never changes what is true.
- Saying is not doing. Asking for an item does not move it. Promising to pay does not pay.
- A character knows only what they saw or were told.
- Owning a thing and holding a thing are different.
- Encounter decides what happened and what it meant. Room Creator decides what was physically possible. Faces and bodies only show a result that is already decided.
- No live AI. Every character's behaviour comes from written rules and stored data.
- New work should make the whole game simpler to understand, not add a parallel system.

Four words used below:

- **Subject:** a thing that can be talked about. A product, a person, a place, or something that happened.
- **Reference:** one character's knowledge of a subject. You can only talk about a subject you have a reference to.
- **Proposal:** an Offer or a Request that has been sent and not yet answered.
- **Arrangement:** an accepted proposal where at least one side still has something to do.

## 3. The eight questions from the audit

### D1. How does a physical thing get into a message?

**Example.** The customer wants to ask about a bottle on the shelf.

**Decision.** The composer lists every subject your character knows, with whatever you are looking at placed first. One rule: a physical thing can go into a message once your character has perceived it, meaning seen it or been told about it.

**Why.** It is the "knows only what they saw or were told" rule applied to the composer, so no new rule is added. It also works the same for a rule-driven character, who has no crosshair but does have a list of things it has perceived. That sameness is what makes any character playable.

**Left for later.** Overhearing, and learning about a thing from a third person.

### D2. Which actions are offered for a subject?

**Example.** The customer has picked the bottle. What can they say about it?

**Decision.** Keep two facts apart for every action word, and store them separately:

- **Can be said:** a character can put it in a message, and another character can receive it and remember it.
- **Can be carried out:** the game can make it happen.

The Lab's composer offers an action when both of these hold:

1. It fits the kind of subject. A product can be asked about, priced, bought, held back or handed over. A person can be greeted, thanked or asked about. A past event can be brought up, explained or apologised for.
2. It can be said, and if the message asks for something to happen, that thing can be carried out.

Messages that only pass information, such as asking what something is or bringing up an event, need only "can be said".

**Guard.** In the Lab, a request the game cannot carry out is not offered. A clerk who can only ever say no to it would teach the player that the language is for show.

Proposed working set for the Lab, described by need. The exact words come from your 66-word list:

| Need | Kind of message |
|---|---|
| Ask what something is or costs | Request |
| Ask for an item, a favour or more time | Request |
| Offer to buy, sell or swap | Offer |
| Offer to do something later | Offer |
| Accept, refuse, put off, or answer with a different offer | Reply to one proposal |
| Greet, thank, apologise, explain, comment | Remark |
| Bring up something that happened | Remark with a reference |

**Why.** With the two facts stored apart, adding "ask for a job" later means switching one flag on and writing how a character answers. Nothing about messages has to be rebuilt.

**Left for later.** The other action words; actions about jobs, theft and threats.

### D3. Who is being spoken to, and which proposal is being answered?

**Example.** The clerk says "two dollars". The customer says "one fifty". The clerk says "fine". Fine to what?

**Decision.**

- **Who.** You speak to the person you are in a conversation with. If more than one person is in range, you pick.
- **Which proposal.** Every Offer and Request gets its own number and its exact terms, frozen when it is sent. A reply always points at one numbered proposal.
- **Four kinds of reply:** accept it, refuse it, answer with a different offer, or put it off ("I'll think about it"), which leaves it open.
- **Lab policy: a different offer makes the earlier version no longer open.** The earlier version and everything said about it stay in history. This is a choice for the Lab, not a rule for the wider game.
- **When an arrangement forms.** Only when every person it binds has agreed to the same numbered version. In the Lab, sending an Offer counts as the sender's own agreement, because an Offer states what the sender will do. A Request commits the sender to nothing unless it is joined to an undertaking.
- Accepting a version that is no longer open fails, and the game says so in plain words.
- A "yes" that could mean more than one open proposal is answered with a question, not a guess.

**Why.** M3 already freezes exact terms this way, so this keeps what exists. It rules out "I agreed to the old price" errors. The frozen record is exactly what KeyWrapping needs later: a specific thing both people can point back to. "Put it off" follows from D8: a proposal can outlive the conversation it was made in.

**Left for later.** Proposals made to several people at once.

### D4. How complicated can one message be?

**Example.** "I'll take the bottle now and pay you tomorrow."

**Decision.** Split the question in two.

- **How a message is stored.** As a general structure: statements that can be grouped and joined, including "if". The warehouse sentence must fit without changing the format. Use the structure the accepted KeyWrapping design already describes (action, and, or, if, exchange, before and after, until, not, about, because). Do not invent a second one.
- **What the Lab's composer can build, and what the Lab's rules can answer.** One statement, or two joined once, by one of two joins:
  - **"in exchange for"**: both parts are meant to happen together. A purchase or a swap.
  - **"and later"**: one part happens now, the other is owed by a stated time. A promise.

"In exchange for" states proposed terms. Nothing moves until the proposal is accepted and settled (D6).

**Guard.** The engine handles exactly the shapes the composer can build. Any other shape is refused with a plain "not supported yet". It is never half-handled. The reason: a path nobody can reach from the screen cannot be tested by playing, and untested paths are where a kernel goes wrong.

**Why.** The storage format is cheap to make general now and expensive to change later, because every saved game and every remembered proposal uses it. The handling is the opposite: expensive to build, and easy to extend one shape at a time.

**Left for later.** "Only if" conditions, three-part deals, deals involving a third person.

### D5. What happens to actions that can't be used?

An action can be unusable for three different reasons, and they should not look the same.

| Reason | Play Mode | Development Mode |
|---|---|---|
| Not built yet | Hidden | Shown greyed, marked "not built" |
| Built, but not possible right now (not at the counter, not holding the item, not enough money) | Shown greyed with a plain reason | Same |
| Your character doesn't know the subject | Hidden | Shown greyed, marked "not known to this character" |

**One rule over the whole table: a choice may be hidden or greyed only for a reason the controlled character itself knows.** "You don't have enough money" and "your job doesn't allow that" are fine. A reason that rests on something the character does not know never filters the menu. A customer who doesn't know the last bottle is promised to someone else can still offer to buy it; the offer goes out and the clerk answers.

"Not possible" and "not allowed" are shown as different reasons. Something can be physically possible and still forbidden.

**Why.** "Not possible right now" is useful to the player and tells them what to do next. "Not known" must stay hidden in play, or the menu itself leaks things the character hasn't learned. "Not built" in play would be noise. A greyed-out button that knows more than your character does is also a leak.

### D6. How is talking kept apart from doing?

**Example.** The clerk accepts the customer's offer for the bottle. Does the bottle change hands?

**Decision.** Three separate kinds of input, kept visibly apart on screen:

- **Say:** build and send a message. Changes what people know and what has been proposed or agreed. Never moves money or goods.
- **Do:** a physical action. Pick up, put down, hand over, pay, walk away. Changes who holds what.
- **Settle:** a shortcut for the common case. When an "in exchange for" proposal is accepted and both sides can deliver on the spot, the game first checks that both can deliver, then records the payment and the hand-over as two separate effects, one after the other. It does not promise to undo one if the other fails. If something does go wrong, putting it right is a new effect, such as a refund.

Anything with an "and later" part does not settle. It becomes an open arrangement. Each side then has to Do their part, and the game records whether it was done by the stated time.

**Why.** Without the split, promises can't be kept or broken, and that is the centre of the Lab. Without the shortcut, buying a candy bar takes four separate actions. The split also means stealing needs no new machinery later: it is the same "pick up and walk away" with no agreement behind it.

**Left for later.** Stealing, returns, and whether a witness is needed.

### D7. What changes on screen when you control a different character?

**Decision.** One rule: **the screen shows what the controlled character knows and can do, and nothing else.**

- There is no "player screen". There is one screen, fed by whichever character you control.
- What the clerk can do that the customer can't (open the register, restock a shelf) comes from a list of permissions stored on the character, not from separate screen code.
- Switching control in Development Mode changes nothing about either character. Each keeps their memories, money, held items and attitude. The one you leave goes back to its rules.
- While you control a character, the game keeps recording what that character experiences and keeps its attitude up to date in the background. You don't see that in Play Mode. You do in Development Mode. D10 says what those background values may and may not be used for.
- Changes you make in Development Mode are logged as developer edits, apart from the history of what happened in the world.

**Why.** This is what "any NPC can be played" means in practice. If the clerk's screen were built separately, every new role would need its own screen.

**Left for later.** Switching during play, which you have ruled out for the game.

### D8. When does a conversation start, pause and end, and what outlives it?

**Example.** The customer offers to buy something tomorrow. The clerk says "I'll think about it". The customer leaves.

**Decision.** Three things, each with its own lifetime.

| Thing | Starts | Ends |
|---|---|---|
| Conversation | One person addresses another within talking distance; the other turns to face them | Someone says goodbye, someone leaves, or nothing is said for a set stretch |
| Proposal | When it is sent | When it is accepted, refused, replaced by a different offer, withdrawn by whoever made it, or its stated "good until" time passes |
| Arrangement | When a proposal with something still to do is accepted | When every part is done, or the person a part is owed to releases it |

- A conversation ending does not end a proposal or an arrangement.
- Missing a due time marks that part overdue. It does not end the arrangement, and the part can still be done late.
- A conversation can pause (someone turns away to do something) and resume with everything intact.
- A proposal with no stated time stays open until it is answered or withdrawn.
- Both people remember every proposal, whatever became of it.

**Guard.** Old open proposals are never deleted by the engine. Whether a proposal has gone stale is a judgment for the character's rules to make, with the age of the proposal as one input. That keeps "you never got back to me" available as something a character can raise.

**Why.** Leaving and coming back is one of the Lab's stated needs. An unfinished conversation that still matters the next day is also the plainest demonstration of KeyWrapping there is.

**Left for later.** Interruptions by a third person; queues.

## 4. Two more a builder would otherwise guess

These are not among the audit's eight. The Lab can't be built without them, so they are listed here to be decided on purpose.

### D9. What does "later" mean?

**Decision.** A step clock. Time moves when something happens, and jumps when you leave and come back. Leaving the store offers a choice of how long you are away, for example an hour or until the next day. Due times and "good until" times are measured on this clock.

**Why.** A step clock gives the same result every time from the same starting point. That is what makes "rerun with one thing changed" possible, and it matches how M3 already replays a run exactly. A real clock would make two runs of the same test differ.

### D10. What is a character's attitude, as stored data?

**Decision.** Two stored judgments, each change recording the event that caused it:

- **Warmth:** do I like dealing with you?
- **Trust:** do I believe you'll do what you say?

With three limits:

1. **They are inputs to a decision, never the whole of it.** Circumstances and role count too. A clerk can like you and trust you and still refuse a loan because they need the money themselves. A clerk can dislike you and still trust you to pay. Every decision records all of its reasons, not only the attitude.
2. **Only lasting judgments are stored.** A passing reaction, such as being startled or annoyed at an interruption, is part of the response to one event. It shows on the face and body and is then gone, unless the event is the kind that changes a lasting judgment. There is no separate mood meter.
3. **For a character you control,** the background values mean "what this character's rules would conclude". They are used only if the character is handed back to its rules. They are never shown to other characters as your feelings, and they never limit what you can choose.

**Guard.** Limit 2 deliberately avoids a second stored thing. ChatGPT asked that lasting opinion and immediate emotion be distinguishable. They are: one is stored, the other is output. Adding a stored mood would be a new system, which your own rule discourages.

**Why.** Your design says liking someone is not the same as trusting their promise, and warns against a meter for everything. Two is the smallest number that shows that difference. Recording causes is what lets the inspector answer "why did they say no?".

**Left for later.** Fear, resentment, obligation felt, and anything about third parties.

## 5. One test both reviews want

### D11. The same rules from both sides

**Decision.** The Lab is not finished until the same store encounter has been played twice: once controlling the customer, once controlling the clerk. Both runs must use the same message format, the same rules for money, the same rules for owning and holding, and one shared history. The only things allowed to differ are who is controlled, each character's permissions, and what each character knows.

**Why.** It is the direct check on "any NPC can be played". If the clerk side needs special rules to work, the Lab has built a customer game with a clerk attached, not a kernel.

**How it fits the order of work.** The customer-controlled half is checked at the first step. The clerk-controlled half needs a customer who shops by rule, so it is checked when the Lab is complete.

## 6. What this document does not decide

- The exact words chosen from the 66-word action list.
- How a rule-driven character decides what to do. That is in the companion decision specification.
- Product names, prices and starting money.
- Screen layout.
- Anything about jobs, theft, hostility, driving or the wider city.
