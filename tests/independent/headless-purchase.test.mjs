import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import {
  BUYER_ID, CLERK_ID, PRODUCT_ID, STORE_ID, UNIT_ID, createPurchase,
} from '../../core/purchase.mjs';
import { exchangeTerms, expressionReference, validateExpression } from '../../communication/purchase-meaning.mjs';
import { failHandover } from '../support/action-resolution.mjs';

const observerId = 'actor_0003';
const rivalId = 'actor_0004';
const secondUnit = 'unit_000a';
const secondProduct = 'subject_000a';
const hiddenUnit = 'unit_000b';
const hiddenProduct = 'subject_000b';
const historicalChecks = Boolean(process.env.LAB_A7_HISTORICAL_RUNNER && process.env.LAB_A7_HISTORICAL_SAVE);

function fixture(overrides = {}) {
  return {
    runId: 'run_0a70',
    humanId: BUYER_ID,
    store: { id: STORE_ID, balanceMinor: 70 },
    actors: [
      { id: BUYER_ID, name: 'Customer', role: 'customer', balanceMinor: 1100,
        shopping: { clerkId: CLERK_ID, wants: [{ kind: 'drink', budgetMinor: 500 }] } },
      { id: CLERK_ID, name: 'Clerk', role: 'clerk', balanceMinor: 40 },
      { id: observerId, name: 'Bystander', role: 'observer', balanceMinor: 10 },
      { id: rivalId, name: 'Second customer', role: 'customer', balanceMinor: 700 },
    ],
    products: [
      { productId: PRODUCT_ID, label: 'Tea', priceMinor: 300, kind: 'drink' },
      { productId: secondProduct, label: 'Coffee', priceMinor: 350, kind: 'drink' },
      { productId: hiddenProduct, label: 'Hidden special', priceMinor: 100, kind: 'drink' },
    ],
    units: [
      { id: UNIT_ID, productId: PRODUCT_ID, ownerId: STORE_ID, holderId: CLERK_ID },
      { id: secondUnit, productId: secondProduct, ownerId: STORE_ID, holderId: CLERK_ID },
      { id: hiddenUnit, productId: hiddenProduct, ownerId: STORE_ID, holderId: CLERK_ID },
    ],
    knowledge: [
      { actorId: BUYER_ID, unitId: UNIT_ID },
      { actorId: BUYER_ID, unitId: secondUnit },
      { actorId: CLERK_ID, unitId: UNIT_ID, available: true },
      { actorId: CLERK_ID, unitId: secondUnit, available: true },
      { actorId: rivalId, unitId: UNIT_ID },
    ],
    ...overrides,
  };
}
function harness(opts = fixture()) {
  const session = createPurchase(opts);
  let n = 0;
  const nextId = () => 'command_' + (++n).toString(16).padStart(4, '0');
  function send(action, args) {
    const command = session.command(nextId(), action, args);
    return { command, ...session.submit(command) };
  }
  function say(args = {}) {
    return send('offer', {
      actorId: BUYER_ID, recipientId: CLERK_ID, productId: PRODUCT_ID, unitId: UNIT_ID,
      amountMinor: 300, vibe: 'SE', salience: 'NUANCED', ...args,
    });
  }
  function reply(actorId, reference, choice = 'Accept') {
    return actorId === opts.humanId
      ? send('reply', { actorId, reference, choice })
      : send('respond', { actorId, reference });
  }
  return { session, send, say, reply, nextId };
}
function result(settlement) {
  assert.equal(settlement.status, 'committed', JSON.stringify(settlement));
  return settlement.receipt.result;
}
function ref(settlement) {
  const { proposalId, version } = result(settlement);
  return { id: proposalId, version };
}
function received(session, actorId, messageId) {
  const observation = session.forActor(actorId).view().observations.find(item => item.source.id === messageId);
  assert.ok(observation, 'the addressee has a delivered observation');
  return { observation, ...observation.receivedDetails.communication };
}
function ledger(session) {
  return session.inspect().data.ledger;
}
function contents(session, unitId) {
  return ledger(session).units.find(unit => unit.id === unitId);
}
function balance(session, actorId) {
  return ledger(session).accounts.find(account => account.id === actorId).balanceMinor;
}
function replay(session, committed) {
  const unchanged = session.save();
  assert.deepEqual(session.submit(committed.command), { status: 'replayed', receipt: committed.receipt });
  assert.equal(session.save(), unchanged);
}
function restore(session) {
  const saved = session.save();
  const loaded = createPurchase();
  loaded.restore(saved);
  assert.equal(loaded.save(), saved);
  return loaded;
}
function settle(run, reference) {
  const pay = run.send('pay', { actorId: BUYER_ID, reference });
  const handover = run.send('handover', { actorId: CLERK_ID, reference });
  assert.equal(result(pay).type, 'payment');
  assert.equal(result(handover).type, 'handover');
  assert.equal(result(handover).paymentEventId, result(pay).eventId);
  return [pay, handover];
}
function rejectWithoutEffect(session, invoke, code) {
  const before = session.save();
  const rejected = invoke();
  assert.equal(rejected.status, 'rejected');
  if (code) assert.equal(rejected.code, code);
  assert.equal(session.save(), before);
}
function allKeys(value) {
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, item]) => [key, ...allKeys(item)]);
}

test('A7-01 two independently constructed runs yield identical judgments, decisions, journals and save bytes', () => {
  function runOnce() {
    const run = harness();
    const offer = ref(run.say());
    assert.equal(result(run.reply(CLERK_ID, offer)).type, 'agreement');
    const effects = settle(run, offer);
    const restored = restore(run.session);
    for (const event of effects) replay(restored, event);
    return restored.save();
  }
  assert.equal(runOnce(), runOnce());
});

test('A7-02 two simultaneous distinct-unit sales, clerk-originated offer, exact assent and separate world effects', () => {
  const run = harness({ ...fixture(), humanId: CLERK_ID });
  const initial = ledger(run.session);
  const clerkOffer = run.say({ actorId: CLERK_ID, recipientId: BUYER_ID });
  const first = ref(clerkOffer);
  const second = ref(run.say({ productId: secondProduct, unitId: secondUnit, amountMinor: 350 }));
  assert.notEqual(first.id, second.id);
  assert.equal(run.session.view(BUYER_ID).proposals.filter(entry => entry.status === 'open').length, 2);
  const heardOffer = received(run.session, BUYER_ID, result(clerkOffer).messageId);
  assert.deepEqual(exchangeTerms(heardOffer.expression), {
    buyerId: BUYER_ID, sellerId: CLERK_ID, storeId: STORE_ID, productId: PRODUCT_ID,
    unitId: UNIT_ID, amountMinor: 300, currency: 'USD',
  });
  assert.deepEqual([heardOffer.expression.body.offered.actor, heardOffer.expression.body.requested.actor], [CLERK_ID, BUYER_ID]);
  const acceptance = run.reply(BUYER_ID, first);
  const heardYes = received(run.session, CLERK_ID, result(acceptance).messageId);
  assert.equal(heardYes.expression.schema, 'kw-expression@1');
  assert.equal(heardYes.expression.function, 'REMARK');
  assert.equal(heardYes.expression.force, 'currentSelfPerformance');
  assert.equal(heardYes.expression.body.act, 'Accept');
  assert.deepEqual(heardYes.expression.body.target, {
    proposalId: first.id, proposalVersion: first.version,
    expression: expressionReference(heardOffer.expression), observationId: heardOffer.observation.id,
  });
  assert.throws(() => validateExpression({ ...heardYes.expression, force: 'reported' }));
  assert.equal(result(run.reply(CLERK_ID, second)).type, 'agreement');
  assert.deepEqual(ledger(run.session), initial);
  rejectWithoutEffect(run.session, () => run.send('handover', { actorId: CLERK_ID, reference: first }), 'PAYMENT_REQUIRED');
  const results = [...settle(run, first), ...settle(run, second)];
  assert.deepEqual([balance(run.session, BUYER_ID), balance(run.session, STORE_ID)], [450, 720]);
  assert.equal(balance(run.session, CLERK_ID), 40);
  for (const unit of [UNIT_ID, secondUnit]) {
    assert.equal(contents(run.session, unit).ownerId, BUYER_ID);
    assert.equal(contents(run.session, unit).holderId, BUYER_ID);
  }
  const saved = JSON.parse(run.session.save());
  assert.equal(saved.expressionSchema, 'kw-expression@1');
  assert.equal(saved.run.journal.length, 8);
  const restored = restore(run.session);
  for (const event of [clerkOffer, acceptance, ...results]) replay(restored, event);
  assert.equal(restored.inspect().data.events.filter(event => event.type === 'handover').length, 2);
});

test('A7-03 below, equal and above a known 300 list price with outward reasons and matching human eligibility', () => {
  for (const amountMinor of [200, 300, 400]) {
    const menus = [];
    for (const humanId of [BUYER_ID, CLERK_ID]) {
      const run = harness({ ...fixture(), humanId });
      const offer = ref(run.say({ amountMinor }));
      const menu = run.session.forActor(CLERK_ID).menu(offer);
      menus.push(menu);
      const score = run.session.decide(offer, CLERK_ID);
      const accept = score.candidates.find(option => option.act === 'Accept');
      assert.equal(accept.eligible, amountMinor >= 300);
      assert.ok(accept.reason);
      const expected = amountMinor === 200 ? 'Counter' : 'Accept';
      assert.equal(score.selected, expected);
      const reply = run.reply(CLERK_ID, offer, expected);
      const delivered = received(run.session, BUYER_ID, result(reply).messageId);
      assert.ok(delivered.content.text.includes(score.reason));
      assert.equal(delivered.expression.function, amountMinor === 200 ? 'OFFER' : 'REMARK');
    }
    assert.deepEqual(...menus);
  }
});

test('A7-04 both controller assignments deliver two Counters per participant, exact versions, Refuse and Clarify', () => {
  for (const humanId of [BUYER_ID, CLERK_ID]) {
    const options = fixture({ humanId });
    options.knowledge[0].listedPriceMinor = 250;
    options.knowledge[2].listedPriceMinor = 350;
    delete options.knowledge[3].available;
    const run = harness(options);
    const original = run.say({ amountMinor: 250 });
    let current = ref(original);
    const isolated = ref(run.say({ productId: secondProduct, unitId: secondUnit, amountMinor: 350 }));
    const noAvailability = run.reply(CLERK_ID, isolated, 'Clarify');
    const question = received(run.session, BUYER_ID, result(noAvailability).messageId).expression;
    assert.equal(question.function, 'REQUEST');
    assert.equal(question.body.act, 'Clarify');
    assert.equal(question.body.missing, 'stock');
    assert.ok(question.body.reason);
    for (let i = 0; i < 4; ++i) {
      const speaker = i % 2 ? BUYER_ID : CLERK_ID;
      const listener = i % 2 ? CLERK_ID : BUYER_ID;
      assert.ok(run.session.forActor(speaker).menu(current).includes('Counter'));
      const counter = run.reply(speaker, current, 'Counter');
      const superseded = current;
      current = ref(counter);
      assert.deepEqual(current, { id: superseded.id, version: superseded.version + 1 });
      const heard = received(run.session, listener, result(counter).messageId);
      assert.equal(heard.expression.speaker, speaker);
      assert.equal(heard.expression.reply.target.proposalVersion, superseded.version);
      assert.equal(exchangeTerms(heard.expression).amountMinor, i % 2 ? 250 : 350);
      assert.ok(heard.expression.reply.reason);
      assert.equal(run.session.view(BUYER_ID).proposals.find(entry => entry.id === isolated.id).status, 'open');
      rejectWithoutEffect(run.session, () => run.reply(listener, superseded), 'STALE_PROPOSAL');
    }
    const score = run.session.decide(current, CLERK_ID);
    assert.equal(score.candidates.find(option => option.act === 'Counter').rule, 'G05');
    assert.deepEqual(run.session.forActor(CLERK_ID).menu(current), ['Refuse']);
    if (humanId === CLERK_ID) {
      rejectWithoutEffect(run.session, () => run.reply(CLERK_ID, current, 'Counter'), 'RESPONSE_INELIGIBLE');
    }
    const refusal = run.reply(CLERK_ID, current, 'Refuse');
    const heard = received(run.session, BUYER_ID, result(refusal).messageId);
    assert.equal(heard.expression.body.act, 'Refuse');
    assert.equal(heard.expression.body.target.proposalVersion, current.version);
    assert.ok(heard.expression.body.reason);
    assert.equal(run.session.view(BUYER_ID).proposals.find(entry => entry.id === current.id && entry.version === 1).status, 'superseded');
    assert.equal(exchangeTerms(run.session.inspect().data.messages[0].expression).amountMinor, 250);
    rejectWithoutEffect(run.session, () => run.send('respond', { actorId: CLERK_ID, reference: { id: isolated.id } }), 'AMBIGUOUS_ASSENT');
    replay(restore(run.session), refusal);
  }
});

test('A7-05 actor capabilities conceal other receipts, secret catalog, private BASED composition and scores', () => {
  const run = harness();
  const observer = run.session.forActor(observerId);
  const buyer = run.session.forActor(BUYER_ID);
  const clerk = run.session.forActor(CLERK_ID);
  const before = observer.view();
  const ownOffer = buyer.submit('command_0120', 'offer', {
    actorId: CLERK_ID, recipientId: CLERK_ID, productId: PRODUCT_ID, unitId: UNIT_ID,
    amountMinor: 300, vibe: 'SE', salience: 'OVERT',
  });
  const offer = ref(ownOffer);
  assert.equal(result(ownOffer).observationId, undefined);
  assert.equal(clerk.view().observations.at(-1).receivedDetails.communication.expression.speaker, BUYER_ID);
  assert.deepEqual(observer.view(), before);
  assert.throws(() => observer.menu(offer), { code: 'STALE_PROPOSAL' });
  assert.throws(() => observer.menu({ id: 'proposal_01ff', version: 1 }), { code: 'STALE_PROPOSAL' });
  const forged = { recipientId: CLERK_ID, productId: hiddenProduct, unitId: hiddenUnit,
    amountMinor: 100, vibe: 'SE', salience: 'OVERT' };
  assert.equal(buyer.submit('command_0121', 'offer', forged).code, 'UNKNOWN_REFERENCE');
  assert.equal(buyer.submit('command_0121', 'offer', { ...forged, productId: 'subject_0fff', unitId: 'unit_0fff' }).code, 'UNKNOWN_REFERENCE');
  const reply = clerk.submit('command_0120', 'respond', { reference: offer });
  assert.equal(result(reply).observationId, undefined);
  for (const bound of [buyer, clerk, observer]) {
    assert.deepEqual(Object.keys(bound).sort(), ['menu', 'submit', 'view']);
    const view = bound.view();
    const keys = allKeys(view);
    for (const forbidden of ['privateComposition', 'selectedVibe', 'intendedFraming', 'candidates', 'judgments', 'journal', 'personality']) {
      assert.ok(!keys.includes(forbidden), forbidden);
    }
    assert.ok(!JSON.stringify(view).includes(hiddenProduct));
  }
  assert.equal(run.session.inspect().data.messages[0].privateComposition.selectedVibe, 'SE');
  assert.ok(run.session.inspect().data.decisions[0].decision.candidates.length);
});

test('A7-06 competing paid claims, actual hidden stock and insufficient funds cannot debit twice or disclose conditions', () => {
  const run = harness();
  const first = ref(run.say());
  const rival = ref(run.say({ actorId: rivalId }));
  result(run.reply(CLERK_ID, first));
  result(run.reply(CLERK_ID, rival));
  const payment = run.send('pay', { actorId: BUYER_ID, reference: first });
  result(payment);
  rejectWithoutEffect(run.session, () => run.send('pay', { actorId: rivalId, reference: rival }), 'ACTION_UNAVAILABLE');
  result(run.send('handover', { actorId: CLERK_ID, reference: first }));
  rejectWithoutEffect(run.session, () => run.send('pay', { actorId: rivalId, reference: rival }), 'ACTION_UNAVAILABLE');
  replay(restore(run.session), payment);
  assert.equal(balance(run.session, rivalId), 700);
  for (const condition of ['short_cash', 'stock']) {
    const settings = fixture();
    if (condition === 'short_cash') settings.actors[0].balanceMinor = 275;
    else settings.units[0].holderId = observerId;
    const sample = harness(settings);
    const offer = ref(sample.say());
    assert.equal(result(sample.reply(CLERK_ID, offer)).type, 'agreement');
    const code = condition === 'short_cash' ? 'INSUFFICIENT_FUNDS' : 'ACTION_UNAVAILABLE';
    rejectWithoutEffect(sample.session, () => sample.session.forActor(BUYER_ID).submit('command_01ff', 'pay', { reference: offer }), code);
    assert.equal(balance(sample.session, STORE_ID), 70);
  }
});

test('A7-07 an external handover failure survives restore and exact replay, then a retry transfers only the unit', () => {
  const run = harness();
  const offer = ref(run.say());
  result(run.reply(CLERK_ID, offer));
  const pay = run.send('pay', { actorId: BUYER_ID, reference: offer });
  result(pay);
  rejectWithoutEffect(run.session, () => run.session.forActor(CLERK_ID).submit('command_01bb', 'resolve_handover_failure', { reference: offer }), 'ACTION_UNAVAILABLE');
  const failure = failHandover(run.session, { commandId: 'command_01aa', resultId: 'result_01aa', sellerId: CLERK_ID, reference: offer });
  assert.equal(result(failure).type, 'handover_failed');
  assert.equal(contents(run.session, UNIT_ID).ownerId, STORE_ID);
  assert.equal(balance(run.session, BUYER_ID), 800);
  assert.ok(!run.session.save().includes('failFirstHandover'));
  const loaded = restore(run.session);
  replay(loaded, failure);
  replay(loaded, pay);
  rejectWithoutEffect(loaded, () => loaded.submit(loaded.command('command_01ab', 'pay', { actorId: BUYER_ID, reference: offer })), 'ALREADY_PAID');
  const retry = loaded.command('command_01ac', 'handover', { actorId: CLERK_ID, reference: offer });
  const outcome = loaded.submit(retry);
  assert.equal(result(outcome).type, 'handover');
  assert.equal(contents(loaded, UNIT_ID).ownerId, BUYER_ID);
  assert.equal(balance(loaded, BUYER_ID), 800);
  assert.equal(balance(loaded, STORE_ID), 370);
  replay(restore(loaded), { command: retry, ...outcome });
});

test('A7-08 malformed saves and stale, conflicting or cross-run commands leave the candidate unchanged', () => {
  const run = harness();
  const stale = run.session.command('command_0200', 'offer', { actorId: BUYER_ID, recipientId: CLERK_ID });
  const offered = run.say();
  const offer = ref(offered);
  result(run.reply(CLERK_ID, offer));
  const snapshot = run.session.save();
  assert.throws(() => run.session.restore('{bad JSON'));
  assert.equal(run.session.save(), snapshot);
  const tampered = JSON.parse(snapshot);
  tampered.run.data.ledger.accounts[0].balanceMinor += 1;
  assert.throws(() => run.session.restore(JSON.stringify(tampered)));
  assert.equal(run.session.save(), snapshot);
  rejectWithoutEffect(run.session, () => run.session.submit(stale), 'STALE_COMMAND');
  rejectWithoutEffect(run.session, () => run.session.submit({ ...offered.command,
    payload: { ...offered.command.payload, amountMinor: 333 } }), 'IDENTITY_CONFLICT');
  const another = harness(fixture({ runId: 'run_0a71' }));
  rejectWithoutEffect(another.session, () => another.session.submit(offered.command), 'WRONG_SESSION');
  replay(restore(run.session), offered);
});

test('A7-09 rejects the historical save envelope and optionally verifies a frozen save byte for byte', async () => {
  function rejectOld(save) {
    const current = harness().session;
    const unchanged = current.save();
    assert.throws(() => current.restore(save), /historical v0\.1 runner/);
    assert.equal(current.save(), unchanged);
  }
  rejectOld(JSON.stringify({ schema: 'lab-headless-purchase-save@1' }));
  if (historicalChecks) {
    const paths = [process.env.LAB_A7_HISTORICAL_RUNNER, process.env.LAB_A7_HISTORICAL_SAVE];
    const { createPurchase: oldRunner } = await import(pathToFileURL(paths[0]).href);
    const old = oldRunner();
    const save = readFileSync(paths[1], 'utf8');
    old.restore(save);
    assert.equal(old.save(), save);
    assert.equal(old.inspect().data.events.at(-1).type, 'handover_failed');
    rejectOld(save);
  }
});

test('A7-10 directed warmth and trust retain cause and bounds across two sales and a late receipt', () => {
  const settings = fixture();
  settings.actors[0].completionObservation = 'delayed';
  settings.actors[0].personality = { deliveryTastes: { displayed_concern: 0, scope_limit: 0 } };
  settings.relationships = [
    { actorId: BUYER_ID, towardId: CLERK_ID, warmth: 0, trust: -2 },
    { actorId: CLERK_ID, towardId: BUYER_ID, warmth: 2, trust: 2 },
  ];
  const run = harness(settings);
  const first = ref(run.say({ salience: 'OVERT' }));
  const privateCard = run.session.decide(first, CLERK_ID);
  assert.deepEqual(new Set(privateCard.candidates.map(option => option.act)), new Set([
    'Accept', 'Refuse', 'Counter', 'Clarify', 'Defer', 'Acknowledge',
  ]));
  assert.ok(privateCard.candidates.filter(option => !option.eligible).every(option => option.reason && option.rule));
  for (const candidate of privateCard.candidates.filter(option => option.eligible)) {
    const risk = candidate.rows.find(row => row.factor === 'risk');
    assert.deepEqual([risk.weight, risk.effect, risk.points], [0, 0, 0]);
    assert.ok(risk.sources.some(source => source.kind === 'stored_trust'));
  }
  assert.ok(privateCard.circumstances.some(({ fact }) => fact === 'observed_availability'));
  const second = ref(run.say({ productId: secondProduct, unitId: secondUnit, amountMinor: 350, salience: 'OVERT' }));
  const directed = (session, actorId, towardId) =>
    session.inspect().data.judgments.find(item => item.actorId === actorId && item.towardId === towardId);
  const repeated = directed(run.session, CLERK_ID, BUYER_ID);
  assert.equal(repeated.warmth, 2);
  assert.equal(repeated.causes.filter(cause => cause.kind === 'liked_emphatic_delivery').length, 1);
  for (const proposal of [first, second]) {
    assert.equal(result(run.reply(CLERK_ID, proposal)).type, 'agreement');
    settle(run, proposal);
  }
  const loaded = restore(run.session);
  assert.equal(directed(loaded, BUYER_ID, CLERK_ID).warmth, 0);
  const lateSecond = loaded.deliverCompletionObservation('command_02a1', { actorId: BUYER_ID, reference: second });
  assert.equal(result(lateSecond).type, 'completion_receipt');
  assert.equal(directed(loaded, BUYER_ID, CLERK_ID).warmth, 0);
  const lateFirst = loaded.deliverCompletionObservation('command_02a2', { actorId: BUYER_ID, reference: first });
  const buyer = directed(loaded, BUYER_ID, CLERK_ID);
  const clerk = directed(loaded, CLERK_ID, BUYER_ID);
  assert.deepEqual([buyer.warmth, buyer.trust, clerk.warmth, clerk.trust], [1, -2, 2, 2]);
  const buyerCause = buyer.causes.find(cause => cause.kind === 'first_purchase');
  const clerkCause = clerk.causes.find(cause => cause.kind === 'first_purchase');
  assert.equal(buyerCause.source.id, clerkCause.source.id);
  assert.notEqual(buyerCause.observationId, clerkCause.observationId);
  assert.equal(clerk.causes.filter(cause => cause.kind === 'first_purchase').length, 1);
  replay(restore(loaded), lateFirst);
  assert.throws(() => createPurchase({ ...settings, relationships: [
    { actorId: BUYER_ID, towardId: CLERK_ID, warmth: -3, trust: 2 },
  ] }));
});

test('A7-11 autonomous and manual openings share transaction outcomes with the control assignments reversed', () => {
  const observations = [];
  const balanceSheets = [];
  for (const humanId of [CLERK_ID, BUYER_ID]) {
    const settings = fixture({ humanId });
    const run = harness(settings);
    const step = humanId === CLERK_ID ? run.send('shop', { actorId: BUYER_ID }) : run.say();
    const open = result(step);
    if (humanId === CLERK_ID) {
      assert.equal(open.choice, 'Buy');
      assert.deepEqual(step.command.payload, { action: 'shop', actorId: BUYER_ID });
      assert.equal(open.openingEventId, run.session.inspect().data.events.find(event => event.type === 'shopper_opening').id);
    }
    const heard = received(run.session, CLERK_ID, open.messageId);
    assert.equal(exchangeTerms(heard.expression).productId, PRODUCT_ID);
    assert.ok(run.session.view(BUYER_ID).references.every(reference => reference.productId !== hiddenProduct));
    const offer = ref(step);
    observations.push(run.session.forActor(CLERK_ID).menu(offer));
    assert.equal(result(run.reply(CLERK_ID, offer)).type, 'agreement');
    settle(run, offer);
    balanceSheets.push(ledger(restore(run.session)));
  }
  assert.deepEqual(...observations);
  assert.deepEqual(...balanceSheets);
  const noFunds = fixture({ humanId: CLERK_ID });
  noFunds.actors[0].balanceMinor = 0;
  const run = harness(noFunds);
  assert.equal(result(run.send('shop', { actorId: BUYER_ID })).choice, 'Leave');
  assert.equal(run.session.view(CLERK_ID).observations.length, 2);
});

test('A7-12 the shopper tries a known affordable alternative when the first choice is known unavailable', () => {
  const settings = fixture({ humanId: CLERK_ID });
  settings.knowledge[0].available = false;
  settings.knowledge[1].available = true;
  settings.knowledge[2].available = false;
  const run = harness(settings);
  const choice = result(run.send('shop', { actorId: BUYER_ID }));
  assert.equal(choice.choice, 'Buy');
  const offer = received(run.session, CLERK_ID, choice.messageId);
  assert.equal(exchangeTerms(offer.expression).unitId, secondUnit);
});
