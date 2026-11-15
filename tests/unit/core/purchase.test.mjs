import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUYER_ID, CLERK_ID, createPurchase, PRICE_MINOR, PRODUCT_ID, UNKNOWN_PRODUCT_ID,
} from '../../../core/purchase.mjs';

const reference = { id: 'proposal_0001', version: 1 };
const offerArgs = {
  actorId: BUYER_ID,
  recipientId: CLERK_ID,
  productId: PRODUCT_ID,
  amountMinor: PRICE_MINOR,
  vibe: 'SE',
  salience: 'NUANCED',
};

function send(run, id, action, payload) {
  return run.submit(run.command(id, action, payload));
}

function offer(run, args = {}) {
  return send(run, 'command_0001', 'offer', { ...offerArgs, ...args });
}

function agree(run, action = 'respond') {
  assert.equal(offer(run).status, 'committed');
  return send(run, 'command_0002', action, { actorId: CLERK_ID, reference });
}

test('scenario receipt grants the known product and preserves actor privacy', () => {
  const run = createPurchase();
  assert.deepEqual(run.view(BUYER_ID).references.map(item => item.productId), [PRODUCT_ID]);
  assert.ok(!Object.hasOwn(run.view(BUYER_ID).references[0], 'available'));
  assert.equal(run.view(CLERK_ID).references[0].available, true);
  assert.deepEqual(run.view(CLERK_ID).account, { kind: 'store_till', balanceMinor: 0 });
  assert.equal(run.view(BUYER_ID).observations[0].source.kind, 'event');
  assert.equal(run.view(BUYER_ID).observations[0].receivedDetails.provenance, 'scenario_catalog_listing');
  assert.equal(offer(run, { productId: UNKNOWN_PRODUCT_ID }).code, 'UNKNOWN_REFERENCE');
  assert.equal(run.inspect().revision, 0);
});

test('a superseded version and ambiguous assent change no run state', () => {
  const run = createPurchase();
  assert.equal(offer(run).status, 'committed');
  assert.equal(send(run, 'command_0002', 'offer', { ...offerArgs, amountMinor: PRICE_MINOR }).receipt.result.version, 2);
  const committed = run.inspect();
  assert.equal(send(run, 'command_0003', 'respond', { actorId: CLERK_ID, reference }).code, 'STALE_PROPOSAL');
  assert.equal(send(run, 'command_0004', 'respond', { actorId: CLERK_ID, reference: null }).code, 'AMBIGUOUS_ASSENT');
  assert.equal(send(run, 'command_0006', 'respond', { actorId: CLERK_ID }).code, 'AMBIGUOUS_ASSENT');
  assert.equal(run.inspect(), committed);
  assert.equal(send(run, 'command_0005', 'respond', { actorId: CLERK_ID, reference: { ...reference, version: 2 } }).status, 'committed');
});

test('agreement leaves the ledger unchanged; pay and handover commit once', () => {
  const run = createPurchase();
  const starting = run.inspect().data.ledger;
  assert.equal(agree(run).status, 'committed');
  assert.deepEqual(run.inspect().data.ledger, starting);

  const payment = run.command('command_0003', 'pay', { actorId: BUYER_ID, reference });
  const paid = run.submit(payment);
  assert.equal(paid.receipt.result.type, 'payment');
  assert.deepEqual(run.inspect().data.ledger, { ...starting, buyerCashMinor: 700, tillMinor: 300 });
  assert.deepEqual(run.submit(payment), { status: 'replayed', receipt: paid.receipt });

  const give = run.command('command_0004', 'handover', { actorId: CLERK_ID, reference });
  const delivered = run.submit(give);
  assert.equal(delivered.receipt.result.type, 'handover');
  assert.equal(delivered.receipt.result.paymentEventId, paid.receipt.result.eventId);
  assert.deepEqual(run.inspect().data.ledger, {
    buyerCashMinor: 700, tillMinor: 300, stock: 0, holderId: BUYER_ID, ownerId: BUYER_ID,
  });
  const fulfilled = run.inspect();
  assert.deepEqual(run.submit(give), { status: 'replayed', receipt: delivered.receipt });
  assert.equal(run.inspect(), fulfilled);
  assert.equal(fulfilled.data.judgments[0].causeObservationIds.length, 1);
});

test('wrong actor, insufficient funds and withheld stock prevent execution', () => {
  for (const [options, wanted] of [
    [{ buyerCashMinor: PRICE_MINOR - 1 }, 'INSUFFICIENT_FUNDS'],
    [{ stock: 0, clerkStockObservation: true }, 'OUT_OF_STOCK'],
  ]) {
    const run = createPurchase(options);
    assert.equal(agree(run).status, 'committed');
    const before = run.inspect();
    assert.equal(send(run, 'command_0003', 'pay', { actorId: CLERK_ID, reference }).code, 'WRONG_ACTOR');
    assert.equal(send(run, 'command_0004', 'pay', { actorId: BUYER_ID, reference }).code, wanted);
    assert.equal(run.inspect(), before);
  }
});

test('an injected handover failure preserves paid state across reload, then retry fulfills once', () => {
  const run = createPurchase({ failFirstHandover: true });
  agree(run);
  const paid = send(run, 'command_0003', 'pay', { actorId: BUYER_ID, reference });
  const attempt = run.command('command_0004', 'handover', { actorId: CLERK_ID, reference });
  const failed = run.submit(attempt);
  assert.equal(failed.receipt.result.type, 'handover_failed');
  assert.equal(run.inspect().data.proposals[0].status, 'paid');
  assert.equal(run.inspect().data.ledger.stock, 1);
  const saved = run.save();
  const reloaded = createPurchase();
  reloaded.restore(saved);
  assert.equal(reloaded.save(), saved);
  assert.deepEqual(reloaded.submit(attempt), { status: 'replayed', receipt: failed.receipt });
  assert.equal(reloaded.save(), saved);
  assert.equal(send(reloaded, 'command_0005', 'pay', { actorId: BUYER_ID, reference }).code, 'ALREADY_PAID');
  const fulfilled = send(reloaded, 'command_0006', 'handover', { actorId: CLERK_ID, reference });
  assert.equal(fulfilled.receipt.result.type, 'handover');
  assert.equal(fulfilled.receipt.result.paymentEventId, paid.receipt.result.eventId);
  assert.equal(reloaded.inspect().data.events.filter(entry => entry.type === 'payment').length, 1);
  assert.equal(reloaded.inspect().data.events.filter(entry => entry.type === 'handover').length, 1);
  assert.equal(reloaded.inspect().data.judgments[0].warmth, 1);
});

test('malformed, incompatible or tampered saves cannot replace the run', () => {
  const run = createPurchase();
  agree(run);
  const accepted = run.inspect();
  assert.throws(() => run.restore('{'));
  const tampered = JSON.parse(run.save());
  tampered.run.data.ledger.buyerCashMinor += 1;
  assert.throws(() => run.restore(JSON.stringify(tampered)), /INVALID_SAVE/);
  tampered.schema = 'lab-headless-purchase-save@2';
  assert.throws(() => run.restore(JSON.stringify(tampered)), /INCOMPATIBLE_SAVE/);
  assert.equal(run.inspect(), accepted);
});

test('command identity, revision and run binding reject conflicts', () => {
  const run = createPurchase();
  const stale = run.command('command_0002', 'respond', { actorId: CLERK_ID, reference });
  const first = run.command('command_0001', 'offer', offerArgs);
  assert.equal(run.submit(first).status, 'committed');
  assert.equal(run.submit(stale).code, 'STALE_COMMAND');
  assert.equal(run.submit({ ...first, payload: { ...first.payload, amountMinor: 295 } }).code, 'IDENTITY_CONFLICT');
  assert.equal(run.submit({ ...first, sessionId: 'run_0002' }).code, 'WRONG_SESSION');
});

test('controller assignment changes initiative but preserves eligible options and ledger mechanics', () => {
  const ordinary = createPurchase();
  const swapped = createPurchase({ humanId: CLERK_ID });
  for (const run of [ordinary, swapped]) assert.equal(offer(run).status, 'committed');
  assert.deepEqual(ordinary.decide(reference), swapped.decide(reference));
  assert.equal(ordinary.view(CLERK_ID).actor.controller, 'rules');
  assert.equal(swapped.view(CLERK_ID).actor.controller, 'human');
  assert.equal(send(swapped, 'command_0002', 'respond', { actorId: CLERK_ID, reference }).code, 'WRONG_CONTROLLER');
  assert.equal(send(ordinary, 'command_0002', 'respond', { actorId: CLERK_ID, reference }).status, 'committed');
  assert.equal(send(swapped, 'command_0002', 'accept', { actorId: CLERK_ID, reference }).status, 'committed');
  for (const run of [ordinary, swapped]) {
    assert.equal(send(run, 'command_0003', 'pay', { actorId: BUYER_ID, reference }).status, 'committed');
    assert.equal(send(run, 'command_0004', 'handover', { actorId: CLERK_ID, reference }).status, 'committed');
  }
  assert.deepEqual(ordinary.inspect().data.ledger, swapped.inspect().data.ledger);
  assert.deepEqual(ordinary.inspect().data.actors.map(({ id }) => id), swapped.inspect().data.actors.map(({ id }) => id));
});
