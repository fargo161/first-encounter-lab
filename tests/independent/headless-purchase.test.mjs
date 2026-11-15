import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  BUYER_ID, CLERK_ID, PRICE_MINOR, PRODUCT_ID, UNKNOWN_PRODUCT_ID, createPurchase
} from '../../core/purchase.mjs';

const terms = {
  actorId: BUYER_ID, recipientId: CLERK_ID, productId: PRODUCT_ID,
  amountMinor: 300, vibe: 'SE', salience: 'NUANCED',
};

function submit(run, id, action, args) {
  const command = run.command('command_' + id, action, args);
  return { command, result: run.submit(command) };
}

function committed(run, id, action, args) {
  const { command, result } = submit(run, id, action, args);
  assert.equal(result.status, 'committed', action + ': ' + JSON.stringify(result));
  assert.equal(result.receipt.commandId, command.id);
  assert.equal(result.receipt.committedRevision, run.inspect().revision);
  return { command, receipt: result.receipt };
}

function rejected(run, id, action, args, code) {
  const before = run.save();
  assert.deepEqual(submit(run, id, action, args).result, { status: 'rejected', code });
  assert.equal(run.save(), before);
}

function offer(run, id, overrides = {}) {
  const { receipt } = committed(run, id, 'offer', { ...terms, ...overrides });
  return { id: receipt.result.proposalId, version: receipt.result.version };
}

function clerkArgs(reference) {
  return { actorId: CLERK_ID, reference };
}

function buyerArgs(reference) {
  return { actorId: BUYER_ID, reference };
}

function agreement(run, action = 'respond') {
  const ref = offer(run, '0010');
  assert.equal(run.decide(ref).selected, 'Accept');
  committed(run, '0011', action, clerkArgs(ref));
  return ref;
}

function replay(run, command, receipt) {
  const before = run.save();
  assert.deepEqual(run.submit(command), { status: 'replayed', receipt });
  assert.equal(run.save(), before);
}

function keysIn(value) {
  if (!value || typeof value !== 'object') return [];
  return [...Object.keys(value), ...Object.values(value).flatMap(keysIn)];
}

function ledger(run) {
  return run.inspect().data.ledger;
}

test('two fresh runs produce identical scoped choices, durable records and replay bytes', () => {
  assert.equal(PRICE_MINOR, 300);
  function execute() {
    const run = createPurchase({ runId: 'run_a701' });
    const ref = offer(run, '0020');
    const prior = run.save();
    const choice = run.decide(ref);
    assert.equal(run.save(), prior);
    assert.equal(choice.selected, 'Accept');
    assert.ok(choice.reason.trim());
    assert.ok(choice.candidates.find(candidate => candidate.act === 'Accept' && candidate.eligible && candidate.rank === 1));
    assert.ok(Array.isArray(choice.tieRule.order) && choice.tieRule.order.length > 1);
    const known = run.view(CLERK_ID).observations;
    assert.equal(choice.evidenceObservationIds.length, 2);
    for (const cited of choice.evidenceObservationIds) assert.ok(known.find(observation => observation.id === cited));
    const offerReceipt = known.find(observation => observation.receivedDetails.communication?.family === 'Offer');
    assert.ok(choice.evidenceObservationIds.includes(offerReceipt.id));
    const acceptance = choice.candidates.find(candidate => candidate.act === 'Accept');
    for (const row of acceptance.rows) {
      assert.ok(row.evidence.trim() && row.profileId.trim());
      assert.ok(row.observationIds.length > 0 && row.observationIds.every(id => known.some(observation => observation.id === id)));
    }
    const receipts = [
      committed(run, '0021', 'respond', clerkArgs(ref)).receipt,
      committed(run, '0022', 'pay', buyerArgs(ref)).receipt,
      committed(run, '0023', 'handover', clerkArgs(ref)).receipt,
    ];
    const journal = run.inspect().journal;
    assert.deepEqual(journal.slice(1).map(entry => entry.receipt), receipts);
    assert.equal(new Set(run.inspect().data.events.map(event => event.id)).size, 5);
    return { choice, receipts, save: run.save() };
  }
  assert.deepEqual(execute(), execute());
});

test('unreceived catalog entries and authoritative facts stay out of scope and clerk policy', () => {
  const funded = createPurchase({ buyerCashMinor: 900, tillMinor: 57 });
  const hiddenConflict = createPurchase({ buyerCashMinor: 15, tillMinor: 223, stock: 0, clerkStockObservation: true });
  for (const run of [funded, hiddenConflict]) {
    const initial = run.inspect();
    assert.ok(initial.data.catalog.some(product => product.productId === UNKNOWN_PRODUCT_ID));
    const buyer = run.view(BUYER_ID);
    const clerk = run.view(CLERK_ID);
    assert.equal(buyer.account.kind, 'personal_cash');
    assert.equal(clerk.account.kind, 'store_till');
    assert.deepEqual(buyer.references.map(entry => entry.productId), [PRODUCT_ID]);
    assert.deepEqual(clerk.references.map(entry => entry.productId), [PRODUCT_ID]);
    assert.ok(buyer.references.every(entry => !Object.hasOwn(entry, 'available')));
    assert.ok(buyer.observations.every(entry => entry.observerId === BUYER_ID));
    assert.ok(clerk.observations.every(entry => entry.observerId === CLERK_ID));
    for (const key of ['buyerCashMinor', 'tillMinor', 'catalog', 'decisions', 'judgments']) {
      assert.ok(!keysIn(buyer).includes(key));
      assert.ok(!keysIn(clerk).includes(key));
    }
    const entry = buyer.observations.find(obs => obs.id === buyer.references[0].observationId);
    assert.equal(initial.data.events.find(event => event.id === entry.source.id).type, 'scenario_observation');
    assert.equal(entry.receivedDetails.provenance, 'scenario_catalog_listing');
    assert.ok(!JSON.stringify(buyer).includes(UNKNOWN_PRODUCT_ID));
    assert.ok(!JSON.stringify(clerk).includes(UNKNOWN_PRODUCT_ID));
    rejected(run, '0030', 'offer', { ...terms, productId: UNKNOWN_PRODUCT_ID }, 'UNKNOWN_REFERENCE');
    rejected(run, '0031', 'offer', { ...terms, productId: 'subject_dead' }, 'UNKNOWN_REFERENCE');
  }
  const first = offer(funded, '0032');
  const second = offer(hiddenConflict, '0032');
  assert.deepEqual(funded.decide(first), hiddenConflict.decide(second));
});

test('only the addressed actor receives authored cues and exact terms; inspector keeps private intent separate', () => {
  const run = createPurchase();
  const reference = offer(run, '0040');
  const actorView = run.view(CLERK_ID);
  const received = actorView.observations.find(entry => entry.receivedDetails.communication);
  const outward = received.receivedDetails.communication;
  assert.equal(received.channel, 'hearing');
  assert.deepEqual(outward.recipientIds, [CLERK_ID]);
  assert.equal(outward.senderId, BUYER_ID);
  assert.equal(outward.family, 'Offer');
  assert.equal(outward.prominence, 'measured');
  assert.deepEqual(outward.framing.map(cue => cue.kind), ['displayed_concern']);
  assert.deepEqual(outward.terms, {
    proposalId: reference.id, version: 1,
    exchange: [{ act: 'Pay', amountMinor: 300 }, { act: 'Give', productId: PRODUCT_ID, unitId: 'unit_0001' }],
  });
  assert.equal(run.inspect().data.messages[0].privateComposition.selectedVibe, 'SE');
  assert.deepEqual(run.inspect().data.messages[0].outward, outward);
  assert.equal(run.view(BUYER_ID).observations.some(entry => entry.source.id === received.source.id), false);
  committed(run, '0041', 'respond', clerkArgs(reference));
  const reply = run.view(BUYER_ID).observations.find(entry => entry.receivedDetails.communication?.family === 'Remark');
  assert.equal(reply.receivedDetails.communication.act, 'accept_exchange');
  assert.deepEqual(reply.receivedDetails.communication.terms, outward.terms);
  assert.deepEqual(reply.receivedDetails.communication.recipientIds, [BUYER_ID]);
  assert.equal(run.inspect().data.messages[1].contextMessageId, received.source.id);

  const restricted = ['privateComposition', 'selectedVibe', 'selectedSalience', 'intendedFraming', 'score', 'candidates', 'decision'];
  for (const id of [BUYER_ID, CLERK_ID]) assert.ok(restricted.every(key => !keysIn(run.view(id)).includes(key)));
});


test('only exact assent to the newest delivered offer version can create an agreement', () => {
  const run = createPurchase();
  const a = offer(run, '0050', { amountMinor: 301 });
  const b = offer(run, '0051');
  assert.equal(a.id, b.id);
  assert.equal(a.version, 1);
  assert.equal(b.version, 2);
  assert.equal(run.inspect().data.proposals[0].status, 'superseded');
  rejected(run, '0052', 'offer', { ...terms, recipientId: BUYER_ID }, 'WRONG_RECIPIENT');
  rejected(run, '0053', 'respond', clerkArgs(a), 'STALE_PROPOSAL');
  rejected(run, '0054', 'respond', { actorId: CLERK_ID }, 'AMBIGUOUS_ASSENT');
  rejected(run, '0055', 'respond', clerkArgs({ version: 2 }), 'AMBIGUOUS_ASSENT');
  rejected(run, '0056', 'respond', clerkArgs({ id: 'proposal_dead', version: 2 }), 'STALE_PROPOSAL');
  rejected(run, '0057', 'respond', buyerArgs(b), 'WRONG_ACTOR');
  rejected(run, '0058', 'accept', clerkArgs(b), 'WRONG_CONTROLLER');
  assert.equal(run.inspect().data.events.filter(event => event.type === 'agreement').length, 0);
  const accepted = committed(run, '0059', 'respond', clerkArgs(b)).receipt;
  assert.equal(accepted.result.version, 2);
  const messages = run.inspect().data.messages;
  assert.equal(messages.at(-1).contextMessageId, messages[1].id);
  assert.deepEqual(messages.at(-1).outward.terms, messages[1].outward.terms);
  rejected(run, '005a', 'respond', clerkArgs(b), 'STALE_PROPOSAL');
});

test('assent preserves the ledger; explicit settlement conserves minor units and gives one item once', () => {
  const run = createPurchase({ buyerCashMinor: 830, tillMinor: 75 });
  const initial = ledger(run);
  assert.deepEqual(initial, {
    buyerCashMinor: 830, tillMinor: 75, stock: 1, ownerId: 'store_0001', holderId: CLERK_ID,
  });
  const ref = agreement(run);
  assert.deepEqual(ledger(run), initial);
  rejected(run, '0060', 'handover', clerkArgs(ref), 'PAYMENT_REQUIRED');
  rejected(run, '0061', 'pay', clerkArgs(ref), 'WRONG_ACTOR');
  const payment = committed(run, '0062', 'pay', buyerArgs(ref));
  assert.deepEqual(ledger(run), { ...initial, buyerCashMinor: 530, tillMinor: 375 });
  assert.equal(ledger(run).buyerCashMinor + ledger(run).tillMinor, 905);
  replay(run, payment.command, payment.receipt);
  rejected(run, '0063', 'pay', buyerArgs(ref), 'ALREADY_PAID');
  rejected(run, '0064', 'handover', buyerArgs(ref), 'WRONG_ACTOR');
  const handover = committed(run, '0065', 'handover', clerkArgs(ref));
  const final = ledger(run);
  assert.deepEqual(final, { buyerCashMinor: 530, tillMinor: 375, stock: 0, ownerId: BUYER_ID, holderId: BUYER_ID });
  assert.notEqual(payment.receipt.result.eventId, handover.receipt.result.eventId);
  assert.equal(handover.receipt.result.paymentEventId, payment.receipt.result.eventId);
  assert.equal(run.inspect().data.proposals.at(-1).status, 'fulfilled');
  assert.deepEqual(run.inspect().data.events.map(event => event.type),
    ['scenario_observation', 'offer', 'agreement', 'payment', 'handover']);
  const handoverObserved = run.view(CLERK_ID).observations.find(entry => entry.source.id === handover.receipt.result.eventId);
  const judgment = run.inspect().data.judgments.find(entry => entry.actorId === CLERK_ID);
  assert.equal(judgment.warmth, 1);
  assert.deepEqual(judgment.causeObservationIds, [handoverObserved.id]);
  assert.ok(handoverObserved.roots.some(root => root.id === payment.receipt.result.eventId));
  replay(run, handover.command, handover.receipt);
  rejected(run, '0066', 'handover', clerkArgs(ref), 'ALREADY_FULFILLED');
});

test('funds and hidden actual stock bar execution even when informed parties can agree', () => {
  for (const fixture of [
    { options: { buyerCashMinor: 299, tillMinor: 999 }, code: 'INSUFFICIENT_FUNDS' },
    { options: { stock: 0, clerkStockObservation: true }, code: 'OUT_OF_STOCK' },
  ]) {
    const run = createPurchase(fixture.options);
    const initial = ledger(run);
    const ref = agreement(run);
    assert.deepEqual(ledger(run), initial);
    assert.equal(run.inspect().data.proposals.at(-1).status, 'agreed');
    rejected(run, '0070', 'pay', buyerArgs(ref), fixture.code);
    rejected(run, '0071', 'handover', clerkArgs(ref), 'PAYMENT_REQUIRED');
    assert.deepEqual(run.inspect().data.events.map(event => event.type),
      ['scenario_observation', 'offer', 'agreement']);
  }
});

test('injected failed handover survives save and exact receipt replay; new retry moves stock only', () => {
  const run = createPurchase({ runId: 'run_a702', failFirstHandover: true });
  const ref = agreement(run);
  const payment = committed(run, '0080', 'pay', buyerArgs(ref));
  const paid = ledger(run);
  const failed = committed(run, '0081', 'handover', clerkArgs(ref));
  assert.equal(failed.receipt.result.type, 'handover_failed');
  assert.equal(failed.receipt.result.reason, 'INJECTED_HANDOVER_FAILURE');
  assert.deepEqual(ledger(run), paid);
  assert.equal(run.inspect().data.proposals.at(-1).status, 'paid');
  assert.ok(run.inspect().data.judgments.every(judgment => judgment.causeObservationIds.length === 0));
  const saved = run.save();
  const resumed = createPurchase({ runId: 'run_a703' });
  resumed.restore(saved);
  assert.equal(resumed.save(), saved);
  replay(resumed, payment.command, payment.receipt);
  replay(resumed, failed.command, failed.receipt);
  const retry = committed(resumed, '0082', 'handover', clerkArgs(ref));
  assert.equal(retry.receipt.result.type, 'handover');
  const final = ledger(resumed);
  assert.deepEqual(final, { ...paid, stock: 0, ownerId: BUYER_ID, holderId: BUYER_ID });
  assert.notEqual(retry.receipt.result.eventId, failed.receipt.result.eventId);
  assert.equal(retry.receipt.result.paymentEventId, payment.receipt.result.eventId);
  for (const eventType of ['payment', 'handover_failed', 'handover']) {
    assert.equal(resumed.inspect().data.events.filter(event => event.type === eventType).length, 1);
  }
  replay(resumed, retry.command, retry.receipt);
  assert.equal(resumed.inspect().data.judgments[0].causeObservationIds.length, 1);
});

test('malformed and inconsistent saves fail atomically; stale commands and copied receipts cannot reapply effects', () => {
  const run = createPurchase({ runId: 'run_a704' });
  const start = offer(run, '0090');
  const premature = run.command('command_0091', 'pay', buyerArgs(start));
  committed(run, '0092', 'respond', clerkArgs(start));
  const payment = committed(run, '0093', 'pay', buyerArgs(start));
  const valid = run.save();
  const alter = callback => {
    const candidate = JSON.parse(valid);
    callback(candidate);
    return JSON.stringify(candidate);
  };
  const corrupt = [
    '{', null,
    alter(candidate => { candidate.schema = 'lab-headless-purchase-save@999'; }),
    alter(candidate => {
      candidate.run.data.ledger.buyerCashMinor += 1;
      candidate.run.data.ledger.tillMinor -= 1;
    }),
    alter(candidate => { candidate.run.journal.at(-1).receipt.result.eventId = 'event_f00d'; }),
    alter(candidate => {
      candidate.run.data.observations.at(-1).observerId = BUYER_ID;
    }),
  ];
  for (const malformed of corrupt) {
    assert.throws(() => run.restore(malformed));
    assert.equal(run.save(), valid);
  }
  run.restore(valid);
  run.restore(valid);
  assert.equal(run.save(), valid);
  const fromOtherRun = createPurchase({ runId: 'run_a705' }).command('command_0094', 'pay', buyerArgs(start));
  assert.deepEqual(run.submit(fromOtherRun), { status: 'rejected', code: 'WRONG_SESSION' });
  assert.deepEqual(run.submit(premature), { status: 'rejected', code: 'STALE_COMMAND' });
  assert.equal(run.submit(payment.receipt).status, 'rejected');
  assert.deepEqual(run.submit({ ...payment.command, payload: { ...payment.command.payload, actorId: CLERK_ID } }),
    { status: 'rejected', code: 'IDENTITY_CONFLICT' });
  assert.equal(run.save(), valid);
  replay(run, payment.command, payment.receipt);
});

test('swapping controller before a comparison preserves identities, scope, eligibility and settlement', () => {
  function exercise(humanId) {
    const run = createPurchase({ humanId });
    const original = run.inspect().data.actors.map(({ id, name, role }) => ({ id, name, role }));
    const ref = offer(run, '00a0');
    const choice = run.decide(ref);
    const response = humanId === CLERK_ID ? 'accept' : 'respond';
    rejected(run, '00a1', response === 'accept' ? 'respond' : 'accept', clerkArgs(ref), 'WRONG_CONTROLLER');
    committed(run, '00a2', response, clerkArgs(ref));
    committed(run, '00a3', 'pay', buyerArgs(ref));
    committed(run, '00a4', 'handover', clerkArgs(ref));
    const loaded = createPurchase();
    loaded.restore(run.save());
    for (const actorId of [BUYER_ID, CLERK_ID]) {
      assert.equal(loaded.view(actorId).actor.controller, actorId === humanId ? 'human' : 'rules');
      assert.ok(loaded.view(actorId).observations.every(entry => entry.observerId === actorId));
    }
    assert.deepEqual(loaded.inspect().data.actors.map(({ id, name, role }) => ({ id, name, role })), original);
    return {
      original, choice, ledger: ledger(loaded),
      events: loaded.inspect().data.events,
      observations: loaded.inspect().data.observations,
    };
  }
  assert.deepEqual(exercise(BUYER_ID), exercise(CLERK_ID));
});
