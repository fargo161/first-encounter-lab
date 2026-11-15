import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

import {
  BUYER_ID, CLERK_ID, PRODUCT_ID, STORE_ID, UNIT_ID, createPurchase,
} from '../../core/purchase.mjs';
import { exchangeTerms, expressionReference, validateExpression } from '../../communication/purchase-meaning.mjs';

const outsiderId = 'actor_00a7';
const pinnedOldSaveHash = 'c386f433faf55969fcd6a78e220133a925609df97d77453c3be65dee32292aed';
const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

function driver(options = {}) {
  let serial = 0xa700;
  const session = createPurchase(options);
  const send = (actorId, action, payload = {}) =>
    session.forActor(actorId).submit('command_' + (++serial).toString(16), action, payload);
  return { session, send };
}

function committed(response, type) {
  assert.equal(response.status, 'committed', JSON.stringify(response));
  if (type) assert.equal(response.receipt.result.type, type);
  return response.receipt.result;
}

function deal(result) {
  return { id: result.proposalId, version: result.version };
}

function offer(game, speaker = BUYER_ID, amountMinor = 300, supersedes) {
  return deal(committed(game.send(speaker, 'offer', {
    recipientId: speaker === BUYER_ID ? CLERK_ID : BUYER_ID,
    productId: PRODUCT_ID, unitId: UNIT_ID, amountMinor, vibe: 'EA', salience: 'NUANCED',
    ...(supersedes && { supersedes }),
  })));
}

function received(game, party, act) {
  const observation = game.session.forActor(party).view().observations.findLast(entry =>
    entry.receivedDetails.communication?.expression.body.act === act);
  assert.ok(observation, 'Expected actual hearing of ' + act);
  return observation;
}

function questionRef(observation) {
  return {
    observationId: observation.id,
    expression: expressionReference(observation.receivedDetails.communication.expression),
  };
}

function missingPrice(options = {}) {
  return driver({ knowledge: [
    { actorId: BUYER_ID, unitId: UNIT_ID },
    { actorId: CLERK_ID, unitId: UNIT_ID, available: true, priceKnown: false },
  ], ...options });
}

function attempts(game, predicate) {
  return game.session.inspect().data.events.filter(predicate);
}

test('A7-01 a pending question bounds four attempts across a restore and its exact retry', () => {
  const game = missingPrice();
  const reference = offer(game);
  const clerk = game.session.forActor(CLERK_ID);
  const buyer = game.session.forActor(BUYER_ID);
  const args = { reference };
  assert.deepEqual(clerk.menu(reference), ['Clarify']);
  committed(clerk.submit('command_ac01', 'respond', args), 'clarification');
  const heard = received(game, BUYER_ID, 'Clarify');
  assert.equal(heard.receivedDetails.communication.expression.body.missing, 'list_price');
  assert.deepEqual(clerk.menu(reference), []);
  for (const id of ['command_ac02', 'command_ac03']) {
    assert.equal(clerk.submit(id, 'respond', args).status, 'rejected');
  }
  const saved = game.session.save();
  game.session.restore(saved);
  const restoredClerk = game.session.forActor(CLERK_ID);
  assert.equal(restoredClerk.submit('command_ac04', 'respond', args).status, 'rejected');
  assert.equal(restoredClerk.submit('command_ac01', 'respond', args).status, 'replayed');
  assert.equal(game.session.save(), saved);
  assert.equal(attempts(game, e => e.type === 'clarification').length, 1);
  assert.throws(() => buyer.view(), { code: 'STALE_ACTOR_VIEW' });
  assert.deepEqual(game.session.forActor(BUYER_ID).questionMenu(questionRef(heard)), ['Tell', 'Decline']);

  const separate = offer(game);
  committed(game.send(CLERK_ID, 'respond', { reference: separate }), 'clarification');
  assert.equal(attempts(game, e => e.type === 'clarification').length, 2);
});

test('A7-02 foreign, forged, stale and replayed answers cannot mutate another proposal', () => {
  const game = missingPrice({ actors: [
    { id: BUYER_ID, name: 'Buyer', role: 'customer', balanceMinor: 1000 },
    { id: CLERK_ID, name: 'Clerk', role: 'clerk', balanceMinor: 0 },
    { id: outsiderId, name: 'Outsider', role: 'observer', balanceMinor: 5 },
  ] });
  const original = offer(game);
  committed(game.send(CLERK_ID, 'respond', { reference: original }), 'clarification');
  const oldQuestion = questionRef(received(game, BUYER_ID, 'Clarify'));
  const revision = offer(game, BUYER_ID, 300, original);
  assert.equal(revision.version, original.version + 1);
  committed(game.send(CLERK_ID, 'respond', { reference: revision }), 'clarification');
  const question = questionRef(received(game, BUYER_ID, 'Clarify'));
  const forged = { ...question, expression: { ...question.expression, digest: '0'.repeat(64) } };
  const same = game.session.save();
  for (const unsupported of [oldQuestion, forged, { ...question, observationId: oldQuestion.observationId }]) {
    assert.throws(() => game.session.forActor(BUYER_ID).questionMenu(unsupported), { code: 'QUESTION_UNAVAILABLE' });
    assert.equal(game.send(BUYER_ID, 'answer_question', { question: unsupported, choice: 'Tell' }).status, 'rejected');
  }
  assert.throws(() => game.session.forActor(outsiderId).questionMenu(question), { code: 'QUESTION_UNAVAILABLE' });
  assert.deepEqual(game.send(outsiderId, 'answer_question', { actorId: BUYER_ID, question, choice: 'Tell' }),
    { status: 'rejected', code: 'QUESTION_UNAVAILABLE' });
  assert.equal(game.session.save(), same);
  const actor = game.session.forActor(BUYER_ID);
  const payload = { question, choice: 'Tell' };
  committed(actor.submit('command_ac05', 'answer_question', payload), 'clarification_told');
  const closed = game.session.save();
  assert.equal(actor.submit('command_ac05', 'answer_question', payload).status, 'replayed');
  assert.equal(game.send(BUYER_ID, 'answer_question', payload).status, 'rejected');
  assert.equal(game.session.save(), closed);
  const proposals = game.session.inspect().data.proposals.filter(p => p.id === original.id);
  assert.deepEqual(proposals.map(p => p.status), ['superseded', 'agreed']);
  assert.deepEqual(proposals.map(p => p.questions[0].status), ['closed', 'told']);
  assert.equal(attempts(game, e => e.type === 'clarification_told').length, 1);
});

test('A7-03 a human can refuse an unknown-price offer even while their question is pending', () => {
  const game = missingPrice({ humanId: CLERK_ID });
  const reference = offer(game);
  const clerk = game.session.forActor(CLERK_ID);
  assert.ok(clerk.menu(reference).includes('Refuse'));
  committed(game.send(CLERK_ID, 'reply', { reference, choice: 'Clarify' }), 'clarification');
  assert.deepEqual(clerk.menu(reference), ['Refuse']);
  committed(game.send(CLERK_ID, 'reply', { reference, choice: 'Refuse' }), 'refusal');
  const message = received(game, BUYER_ID, 'Refuse').receivedDetails.communication.expression;
  assert.equal(message.body.target.proposalId, reference.id);
  assert.equal(game.session.inspect().data.proposals[0].questions[0].status, 'closed');
});

test('A7-04 a human Decline discloses the same speech and terms with and without the fact in either role', () => {
  for (const speaker of [BUYER_ID, CLERK_ID]) {
    const asker = speaker === BUYER_ID ? CLERK_ID : BUYER_ID;
    const observations = [];
    for (const hasPrice of [false, true]) {
      const game = driver({ humanId: speaker, knowledge: [
        { actorId: speaker, unitId: UNIT_ID, priceKnown: hasPrice },
        { actorId: asker, unitId: UNIT_ID, priceKnown: false },
      ] });
      const reference = offer(game, speaker);
      committed(game.send(asker, 'respond', { reference }), 'clarification');
      const question = questionRef(received(game, speaker, 'Clarify'));
      assert.deepEqual(game.session.forActor(speaker).questionMenu(question), hasPrice ? ['Tell', 'Decline'] : ['Decline']);
      if (!hasPrice) assert.equal(game.send(speaker, 'answer_question', { question, choice: 'Tell' }).status, 'rejected');
      const result = committed(game.send(speaker, 'answer_question', { question, choice: 'Decline' }), 'clarification_declined');
      assert.equal(result.followUp.type, 'refusal');
      assert.equal(attempts(game, e => e.type === 'refusal').length, 1);
      const heard = received(game, asker, 'Decline').receivedDetails.communication;
      const { missing, act, reason, fact } = heard.expression.body;
      assert.equal(fact, undefined);
      observations.push({ act, reason, missing, text: heard.content.text, framing: heard.framing, prominence: heard.prominence });
      const refusal = received(game, speaker, 'Refuse').receivedDetails.communication.expression;
      assert.match(refusal.body.reason, /list_price|marked price/i);
      assert.equal(refusal.body.target.proposalId, reference.id);
      assert.equal(game.session.forActor(asker).view().references.find(entry => entry.productId === PRODUCT_ID)?.priceMinor, undefined);
    }
    assert.deepEqual(observations[0], observations[1]);
  }
});

test('A7-05 a rule-controlled addressee Tells its own fact or Declines from lack of evidence', () => {
  for (const hasPrice of [false, true]) {
    const game = missingPrice({ humanId: null, knowledge: [
      { actorId: BUYER_ID, unitId: UNIT_ID, priceKnown: hasPrice },
      { actorId: CLERK_ID, unitId: UNIT_ID, available: true, priceKnown: false },
    ] });
    const reference = offer(game);
    committed(game.send(CLERK_ID, 'respond', { reference }), 'clarification');
    const question = questionRef(received(game, BUYER_ID, 'Clarify'));
    const before = game.session.save();
    assert.equal(game.send(BUYER_ID, 'answer_question', { question, choice: 'Decline' }).status, 'rejected');
    assert.equal(game.session.save(), before);
    const result = committed(game.send(BUYER_ID, 'answer_question', { question }),
      hasPrice ? 'clarification_told' : 'clarification_declined');
    const communication = received(game, CLERK_ID, hasPrice ? 'Tell' : 'Decline').receivedDetails.communication;
    if (hasPrice) {
      assert.equal(communication.expression.body.fact.value, 300);
      assert.equal(result.followUp.type, 'agreement');
    } else {
      assert.match(communication.content.text, /I don't have that fact/);
      assert.equal(result.followUp.type, 'refusal');
    }
  }
});

test('A7-06 Told 250, actual 300 leaves the exact agreement unpaid without giving either actor the actual price', () => {
  const game = missingPrice({ knowledge: [
    { actorId: BUYER_ID, unitId: UNIT_ID, listedPriceMinor: 250, available: false },
    { actorId: CLERK_ID, unitId: UNIT_ID, available: true, priceKnown: false },
  ] });
  const reference = offer(game, BUYER_ID, 250);
  committed(game.send(CLERK_ID, 'respond', { reference }), 'clarification');
  const question = questionRef(received(game, BUYER_ID, 'Clarify'));
  const answer = committed(game.send(BUYER_ID, 'answer_question', { question, choice: 'Tell' }), 'clarification_told');
  assert.equal(answer.followUp.type, 'agreement');
  const attributed = received(game, CLERK_ID, 'Tell');
  const { expression } = attributed.receivedDetails.communication;
  assert.equal(expression.speaker, BUYER_ID);
  assert.deepEqual(expression.body.fact, { productId: PRODUCT_ID, unitId: UNIT_ID, value: 250 });
  assert.deepEqual(expression.body.target.expression, question.expression);
  assert.equal(expression.body.target.observationId, question.observationId);
  assert.equal(expression.body.target.proposalVersion, reference.version);
  const viewOf = actorId => game.session.forActor(actorId).view();
  const clerkBefore = viewOf(CLERK_ID);
  const buyerBefore = viewOf(BUYER_ID);
  const clerkFact = clerkBefore.references.find(ref => ref.unitId === UNIT_ID);
  assert.equal(clerkFact.priceMinor, 250);
  assert.equal(clerkFact.priceObservationId, attributed.id);
  assert.equal(clerkFact.available, true);
  assert.equal(buyerBefore.references.find(ref => ref.unitId === UNIT_ID).priceMinor, 250);
  const ledger = game.session.inspect().data.ledger;
  assert.equal(game.session.inspect().data.catalog.find(product => product.productId === PRODUCT_ID).priceMinor, 300);
  assert.deepEqual(game.send(BUYER_ID, 'pay', { reference }), { status: 'rejected', code: 'ACTION_UNAVAILABLE' });
  assert.equal(game.send(CLERK_ID, 'handover', { reference }).status, 'rejected');
  assert.deepEqual(viewOf(CLERK_ID), clerkBefore);
  assert.deepEqual(viewOf(BUYER_ID), buyerBefore);
  assert.deepEqual(game.session.inspect().data.ledger, ledger);
  const [proposal] = game.session.inspect().data.proposals;
  assert.equal(proposal.status, 'agreed');
  assert.ok(proposal.agreementEventId);
  assert.equal(proposal.paymentEventId, undefined);
  assert.equal(proposal.handoverEventId, undefined);
});

test('A7-07 a known $4 proposal can be accepted and paid or countered at $3 with exact assent', () => {
  const atFour = driver();
  assert.equal(atFour.send(CLERK_ID, 'offer', {
    recipientId: BUYER_ID, productId: PRODUCT_ID, unitId: UNIT_ID, amountMinor: 200, vibe: 'EA', salience: 'NUANCED',
  }).code, 'PRICE_POLICY');
  const reference = offer(atFour, CLERK_ID, 400);
  const shopper = atFour.session.forActor(BUYER_ID);
  assert.ok(shopper.menu(reference).includes('Accept'));
  assert.ok(shopper.menu(reference).includes('Counter'));
  committed(atFour.send(BUYER_ID, 'reply', { reference, choice: 'Accept' }), 'agreement');
  committed(atFour.send(BUYER_ID, 'pay', { reference }), 'payment');
  committed(atFour.send(CLERK_ID, 'handover', { reference }), 'handover');
  assert.equal(shopper.view().account.balanceMinor, 600);
  assert.equal(atFour.session.forActor(CLERK_ID).view().storeTill.balanceMinor, 400);
  assert.equal(attempts(atFour, event => event.type === 'payment')[0].details.transaction.amountMinor, 400);

  for (const humanId of [BUYER_ID, CLERK_ID]) {
    const game = driver({ humanId });
    const four = offer(game, CLERK_ID, 400);
    const response = game.send(BUYER_ID, humanId === BUYER_ID ? 'reply' : 'respond',
      { reference: four, ...(humanId === BUYER_ID && { choice: 'Counter' }) });
    const three = deal(committed(response, 'counter'));
    assert.equal(three.id, four.id);
    assert.equal(three.version, four.version + 1);
    const counter = game.session.forActor(CLERK_ID).view().observations.findLast(obs =>
      obs.receivedDetails.communication?.expression.reply);
    assert.equal(exchangeTerms(counter.receivedDetails.communication.expression).amountMinor, 300);
    committed(game.send(CLERK_ID, humanId === CLERK_ID ? 'reply' : 'respond',
      { reference: three, ...(humanId === CLERK_ID && { choice: 'Accept' }) }), 'agreement');
    const assent = received(game, BUYER_ID, 'Accept').receivedDetails.communication.expression;
    assert.deepEqual(assent.body.target.expression, expressionReference(counter.receivedDetails.communication.expression));
    assert.equal(assent.body.target.observationId, counter.id);
  }
});

test('A7-08 the till follows take_payment with a separate clerk cash balance and scoped error', () => {
  const game = driver({
    store: { id: 'store_00a7', balanceMinor: 711 },
    actors: [
      { id: BUYER_ID, name: 'Buyer', role: 'customer', balanceMinor: 982 },
      { id: CLERK_ID, name: 'Clerk', role: 'clerk', balanceMinor: 45 },
      { id: outsiderId, name: 'Observer', role: 'observer', balanceMinor: 41 },
    ],
    units: [{ id: UNIT_ID, productId: PRODUCT_ID, ownerId: 'store_00a7', holderId: CLERK_ID }],
  });
  const clerk = game.session.forActor(CLERK_ID).view();
  assert.equal(clerk.account.balanceMinor, 45);
  assert.deepEqual(clerk.storeTill, { kind: 'store_till', id: 'store_00a7', currency: 'USD', balanceMinor: 711 });
  assert.equal(clerk.ledger, undefined);
  assert.doesNotMatch(JSON.stringify(clerk), /"balanceMinor":982/);
  for (const actorId of [BUYER_ID, outsiderId]) {
    const actor = game.session.forActor(actorId);
    assert.equal(actor.view().storeTill, undefined);
    assert.throws(() => actor.menu({ id: 'store_00a7', version: 1 }), { code: 'STALE_PROPOSAL' });
    assert.doesNotMatch(JSON.stringify(actor.view()), /"balanceMinor":711/);
  }

  const child = [
    'import assert from "node:assert/strict";',
    'import roles from "./content/roles.json" with { type: "json" };',
    'roles.clerk.permissions = roles.clerk.permissions.filter(permission => permission !== "take_payment");',
    'const { CLERK_ID, createPurchase } = await import("./core/purchase.mjs");',
    'const actor = createPurchase({humanId: CLERK_ID}).forActor(CLERK_ID);',
    'assert.equal(actor.view().storeTill, undefined);',
    'assert.equal(actor.view().account.kind, "personal_cash");',
  ].join('\n');
  execFileSync(process.execPath, ['--input-type=module', '-e', child], { cwd: projectRoot });
});

test('A7-09 the @1 save has an explicit historical route and preserves a live @2 session', async () => {
  const game = missingPrice();
  const reference = offer(game);
  committed(game.send(CLERK_ID, 'respond', { reference }), 'clarification');
  const current = game.session.save();
  const oldPath = process.env.LAB_A7_PART_A_V02_SAVE;
  const previous = oldPath ? readFileSync(oldPath, 'utf8') :
    JSON.stringify({ schema: 'lab-headless-generalization-save@1' });
  assert.equal(JSON.parse(current).schema, 'lab-headless-generalization-save@2');
  assert.equal(JSON.parse(current).expressionSchema, 'kw-expression@1');
  assert.throws(() => game.session.restore(previous), error =>
    error.code === 'INCOMPATIBLE_SAVE_VERSION' && /historical v0.2 runner.*c77a19c5d2cf/.test(error.message));
  assert.equal(game.session.save(), current);
  if (oldPath) {
    assert.equal(createHash('sha256').update(previous).digest('hex'), pinnedOldSaveHash);
    const historical = await import(pathToFileURL(process.env.LAB_A7_PART_A_V02_RUNNER).href);
    const session = historical.createPurchase();
    session.restore(previous);
    assert.equal(session.save(), previous);
  }
});

test('A7-10 the field matrix enumerates both variants and the draft hold stays outside expression admission', () => {
  const canonical = readFileSync(new URL('../../docs/architecture/KW_EXPRESSION_V0_2_FORMAT.md', import.meta.url), 'utf8');
  const review = readFileSync(new URL('../../docs/runs/headless-v0-3-part-a-2026-11-15/HEADLESS_PART_A_KW_FIELD_ORIGIN_MATRIX.md', import.meta.url), 'utf8');
  const heading = '## Origin of field and value names';
  assert.equal(canonical.slice(canonical.indexOf(heading)), review.slice(review.indexOf(heading)));
  const registry = review.slice(review.indexOf('### Fields'));
  for (const key of ['scope.packageRef.digest', 'reference.digest', 'proposal.parent', 'body.target',
    'reply.target', 'body.missing', 'body.fact.productId', 'body.fact.unitId', 'body.fact.value', 'Decline',
    'Tell', 'currentSelfPerformance', 'minor-unit', 'list_price', 'stock', 'questions[].status',
    'answerObservationId', 'factObservationId', 'clarification_told', 'clarification_declined']) {
    assert.ok(registry.includes(key), key);
  }
  const hold = readFileSync(new URL('../../docs/architecture/HEADLESS_HOLD_DEPOSIT_EXPRESSION_WORKED_EXAMPLE_v0_3_DRAFT.md', import.meta.url), 'utf8');
  assert.match(hold, /PROPOSED \/ NOT IMPLEMENTED \/ NOT YET OWNER APPROVED/);
  const [request, counter, assent, arrangement] = [...hold.matchAll(/```json\r?\n([\s\S]+?)\r?\n```/g)].map(match => JSON.parse(match[1]));
  assert.throws(() => validateExpression(request), { code: 'UNSUPPORTED_TERMS' });
  assert.throws(() => validateExpression(counter), { code: 'UNSUPPORTED_TERMS' });
  const sortKeys = value => JSON.stringify(value, (_, entry) => entry && !Array.isArray(entry) && typeof entry === 'object'
    ? Object.fromEntries(Object.entries(entry).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)) : entry);
  const digest = value => createHash('sha256').update(sortKeys(value)).digest('hex');
  assert.equal(counter.proposal.parent.digest, digest(request));
  assert.equal(counter.reply.target.expression.digest, digest(request));
  assert.equal(assent.body.target.expression.digest, digest(counter));
  assert.equal(assent.body.target.proposalVersion, 2);
  assert.ok(arrangement.deadline.inclusive);
  assert.equal(arrangement.price.requiredMinor - arrangement.price.credits[0].quantityMinor, 300);
  assert.equal(arrangement.refund.dueMinor, 200);
  assert.equal(arrangement.refund.paymentEffectId, null);
  assert.equal(arrangement.refund.activatedByEventId, arrangement.reservation.releaseEventId);
});

test('A7-11 a second missing fact gets its own question and a known false value is answered', () => {
  const game = driver({ humanId: null, knowledge: [
    { actorId: BUYER_ID, unitId: UNIT_ID, available: false },
    { actorId: CLERK_ID, unitId: UNIT_ID, priceKnown: false },
  ] });
  const reference = offer(game);
  committed(game.send(CLERK_ID, 'respond', { reference }), 'clarification');
  const first = received(game, BUYER_ID, 'Clarify');
  assert.equal(first.receivedDetails.communication.expression.body.missing, 'list_price');
  const toldPrice = committed(game.send(BUYER_ID, 'answer_question', { question: questionRef(first) }), 'clarification_told');
  assert.equal(toldPrice.followUp.type, 'clarification');
  const second = received(game, BUYER_ID, 'Clarify');
  assert.notEqual(first.id, second.id);
  assert.equal(second.receivedDetails.communication.expression.body.missing, 'stock');
  assert.equal(game.send(CLERK_ID, 'respond', { reference }).status, 'rejected');
  const toldStock = committed(game.send(BUYER_ID, 'answer_question', { question: questionRef(second) }), 'clarification_told');
  assert.equal(toldStock.followUp.type, 'refusal');
  assert.equal(received(game, CLERK_ID, 'Tell').receivedDetails.communication.expression.body.fact.value, false);
  assert.deepEqual(game.session.inspect().data.proposals[0].questions.map(row => [row.missing, row.status]),
    [['list_price', 'told'], ['stock', 'told']]);
});
