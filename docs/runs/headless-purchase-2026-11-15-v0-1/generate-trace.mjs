import assert from 'node:assert/strict';
import {
  BUYER_ID, CLERK_ID, PRICE_MINOR, PRODUCT_ID, UNKNOWN_PRODUCT_ID, createPurchase
} from '../../../core/purchase.mjs';

const commandId = number => `command_${number.toString(16).padStart(4, '0')}`;

function recordPurchase(humanId, failFirstHandover) {
  const options = { humanId, failFirstHandover };
  let session = createPurchase(options);
  const steps = [];
  const before = session.inspect().data;
  let number = 0;

  function attempt(action, args, expected = 'committed') {
    const command = session.command(commandId(++number), action, args);
    const result = session.submit(command);
    assert.equal(result.status, expected);
    const run = session.inspect();
    steps.push({ action, commandId: command.id, result, revision: run.revision, ledger: run.data.ledger });
    return command;
  }

  attempt('offer', {
    actorId: BUYER_ID, recipientId: CLERK_ID, productId: UNKNOWN_PRODUCT_ID,
    amountMinor: PRICE_MINOR, vibe: 'EA', salience: 'NUANCED'
  }, 'rejected');
  attempt('offer', {
    actorId: BUYER_ID, recipientId: CLERK_ID, productId: PRODUCT_ID,
    amountMinor: PRICE_MINOR, vibe: 'EA', salience: 'NUANCED'
  });
  const proposal = session.inspect().data.proposals.at(-1);
  const reference = { id: proposal.id, version: proposal.version };
  const choice = session.decide(reference);
  assert.equal(choice.selected, 'Accept');
  const replyAction = humanId === CLERK_ID ? 'accept' : 'respond';
  attempt(replyAction, { actorId: CLERK_ID, reference: { ...reference, version: reference.version + 1 } }, 'rejected');
  attempt(replyAction, { actorId: CLERK_ID, reference });
  assert.deepEqual(session.inspect().data.ledger, before.ledger);

  const payment = attempt('pay', { actorId: BUYER_ID, reference });
  const paidLedger = session.inspect().data.ledger;
  assert.equal(paidLedger.buyerCashMinor, before.ledger.buyerCashMinor - PRICE_MINOR);
  assert.equal(paidLedger.tillMinor, before.ledger.tillMinor + PRICE_MINOR);
  assert.equal(paidLedger.holderId, before.ledger.holderId);
  assert.equal(paidLedger.stock, before.ledger.stock);

  let partialSave;
  if (failFirstHandover) {
    attempt('handover', { actorId: CLERK_ID, reference });
    const partial = session.inspect();
    assert.equal(partial.data.events.at(-1).type, 'handover_failed');
    assert.deepEqual(partial.data.ledger, paidLedger);
    const save = session.save();
    partialSave = { bytes: Buffer.byteLength(save), revision: partial.revision, ledger: partial.data.ledger };
    session = createPurchase(options);
    session.restore(save);
    assert.deepEqual(session.inspect(), partial);
    const replay = session.submit(payment);
    assert.equal(replay.status, 'replayed');
    assert.deepEqual(session.inspect(), partial);
    steps.push({ action: 'pay_replay_after_partial_reload', commandId: payment.id, result: replay,
      revision: session.inspect().revision, ledger: session.inspect().data.ledger });
  }

  const handover = attempt('handover', { actorId: CLERK_ID, reference });
  const settled = session.inspect();
  assert.equal(settled.data.ledger.ownerId, BUYER_ID);
  assert.equal(settled.data.ledger.holderId, BUYER_ID);
  assert.equal(settled.data.ledger.stock, 0);
  assert.equal(settled.data.ledger.buyerCashMinor, paidLedger.buyerCashMinor);
  assert.equal(settled.data.ledger.tillMinor, paidLedger.tillMinor);

  const saved = session.save();
  session.restore(saved);
  const replay = session.submit(handover);
  assert.equal(replay.status, 'replayed');
  assert.deepEqual(session.inspect(), settled);
  steps.push({ action: 'handover_replay_after_reload', commandId: handover.id, result: replay,
    revision: settled.revision, ledger: settled.data.ledger });

  return {
    humanId, actors: settled.data.actors, before: before.ledger, after: settled.data.ledger,
    scope: { buyer: session.view(BUYER_ID), clerk: session.view(CLERK_ID) },
    privilegedDecisionEvidence: choice, partialSave: partialSave ?? null, steps,
    events: settled.data.events, judgments: settled.data.judgments, journal: settled.journal,
  };
}

const customerControlled = recordPurchase(BUYER_ID, true);
const clerkControlled = recordPurchase(CLERK_ID, false);
assert.deepEqual(customerControlled.after, clerkControlled.after);
assert.deepEqual(customerControlled.privilegedDecisionEvidence, clerkControlled.privilegedDecisionEvidence);
process.stdout.write(JSON.stringify({
  proof: 'headless-purchase@0.1',
  evidence: 'Scenario-domain observation and ledger effects. Physical ROOM behavior is outside this proof.',
  customerControlled, clerkControlled
}, null, 2) + '\n');
