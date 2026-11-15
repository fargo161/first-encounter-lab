import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  BUYER_ID, CLERK_ID, PRODUCT_ID, STORE_ID, UNIT_ID, UNKNOWN_PRODUCT_ID, createPurchase,
} from '../../../core/purchase.mjs';
import { failHandover } from '../../../tests/support/action-resolution.mjs';

const secondUnit = 'unit_0002';
const shelf = [
  { actorId: BUYER_ID, unitId: UNIT_ID },
  { actorId: BUYER_ID, unitId: secondUnit },
  { actorId: CLERK_ID, unitId: UNIT_ID, available: true },
  { actorId: CLERK_ID, unitId: secondUnit, available: true },
];

function session(options) {
  let active = createPurchase(options);
  let sequence = 0;
  const steps = [];
  const before = active.inspect().data.ledger;
  const nextId = () => 'command_' + (++sequence).toString(16).padStart(4, '0');

  function attempt(action, payload, expected = 'committed') {
    const command = active.command(nextId(), action, payload);
    const result = active.submit(command);
    assert.equal(result.status, expected, JSON.stringify({ action, result }));
    steps.push({ action, command, result });
    return { command, result };
  }

  function offer(actorId, recipientId, productId = PRODUCT_ID, amountMinor = 300) {
    const { result: { receipt: { result } } } = attempt('offer', {
      actorId, recipientId, productId, amountMinor, vibe: 'EA', salience: 'NUANCED',
    });
    return { id: result.proposalId, version: result.version };
  }

  function reply(actorId, reference, choice) {
    const action = choice ? 'reply' : 'respond';
    const { result: { receipt: { result } } } = attempt(action, {
      actorId, reference, ...(choice && { choice }),
    });
    return result;
  }

  function loadAndReplay(...recorded) {
    const saved = active.save();
    active = createPurchase();
    active.restore(saved);
    assert.equal(active.save(), saved);
    const receipts = recorded.map(({ command, result }) => {
      const repeated = active.submit(command);
      assert.equal(repeated.status, 'replayed');
      assert.deepEqual(repeated.receipt, result.receipt);
      assert.equal(active.save(), saved);
      return { commandId: command.id, receipt: repeated.receipt };
    });
    steps.push({ action: 'restore_and_replay', saveSha256: hash(saved), receipts });
  }

  function trace() {
    const { data, journal, id, packageRef, revision } = active.inspect();
    return {
      id, packageRef, revision, humanId: options.humanId ?? BUYER_ID, before,
      worldEffects: data.events.filter(event => event.commandId !== null),
      proposals: data.proposals,
      judgments: data.judgments,
      ledger: data.ledger,
      actors: data.actors.map(({ id: actorId, role, controller }) => ({ id: actorId, role, controller })),
      participants: Object.fromEntries([BUYER_ID, CLERK_ID].map(actorId => [actorId, active.view(actorId)])),
      decisions: data.decisions,
      journal, steps,
    };
  }

  return { offer, reply, attempt, loadAndReplay, trace, nextId, steps, get active() { return active; } };
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function settle(test, reference) {
  const payment = test.attempt('pay', { actorId: BUYER_ID, reference });
  const handover = test.attempt('handover', { actorId: CLERK_ID, reference });
  return [payment, handover];
}

function ledgerAmounts(test, buyer, till) {
  const accounts = test.active.inspect().data.ledger.accounts;
  assert.equal(accounts.find(entry => entry.id === BUYER_ID).balanceMinor, buyer);
  assert.equal(accounts.find(entry => entry.id === STORE_ID).balanceMinor, till);
}

function twoSales() {
  const test = session({ runId: 'run_0201', humanId: CLERK_ID, knowledge: shelf });
  const first = test.offer(CLERK_ID, BUYER_ID);
  const second = test.offer(CLERK_ID, BUYER_ID, UNKNOWN_PRODUCT_ID, 450);
  assert.equal(test.active.inspect().data.proposals.filter(item => item.status === 'open').length, 2);
  for (const reference of [first, second]) {
    assert.equal(test.reply(BUYER_ID, reference).type, 'agreement');
    test.loadAndReplay(...settle(test, reference));
  }
  ledgerAmounts(test, 250, 750);
  return test.trace();
}

function refusalAndCounter() {
  const test = session({ runId: 'run_0202' });
  const first = test.offer(BUYER_ID, CLERK_ID);
  const second = test.offer(BUYER_ID, CLERK_ID, PRODUCT_ID, 200);
  const counter = test.reply(CLERK_ID, second);
  assert.equal(counter.type, 'counter');
  assert.equal(counter.proposalId, second.id);
  assert.equal(counter.version, 2);
  assert.equal(test.reply(BUYER_ID, { id: counter.proposalId, version: counter.version }, 'Refuse').type, 'refusal');
  assert.equal(test.active.inspect().data.proposals.find(item => item.id === first.id).status, 'open');
  ledgerAmounts(test, 1000, 0);
  return test.trace();
}

function clarification() {
  const test = session({ runId: 'run_0203', knowledge: [
    { actorId: BUYER_ID, unitId: UNIT_ID },
    { actorId: CLERK_ID, unitId: UNIT_ID, priceKnown: false },
  ] });
  assert.equal(test.reply(CLERK_ID, test.offer(BUYER_ID, CLERK_ID)).type, 'clarification');
  ledgerAmounts(test, 1000, 0);
  test.loadAndReplay();
  return test.trace();
}

function failureAndRetry() {
  const test = session({ runId: 'run_0204' });
  const reference = test.offer(BUYER_ID, CLERK_ID);
  assert.equal(test.reply(CLERK_ID, reference).type, 'agreement');
  const payment = test.attempt('pay', { actorId: BUYER_ID, reference });
  const { command, ...result } = failHandover(test.active, {
    commandId: test.nextId(), resultId: 'result_0240', sellerId: CLERK_ID, reference,
  });
  assert.equal(result.status, 'committed');
  assert.equal(result.receipt.result.type, 'handover_failed');
  test.steps.push({ action: 'failed_handover', command, result });
  assert.equal(test.active.inspect().data.proposals.at(-1).status, 'paid');
  assert.equal(test.active.inspect().data.ledger.units.find(unit => unit.id === UNIT_ID).ownerId, STORE_ID);
  ledgerAmounts(test, 700, 300);
  test.loadAndReplay(payment, { command, result });
  const retry = test.attempt('handover', { actorId: CLERK_ID, reference });
  assert.equal(test.active.inspect().data.ledger.units.find(unit => unit.id === UNIT_ID).ownerId, BUYER_ID);
  ledgerAmounts(test, 700, 300);
  test.loadAndReplay(retry);
  return test.trace();
}

function priceDecisions() {
  return [200, 300, 400].map(amountMinor => {
    const test = session({ runId: 'run_' + amountMinor.toString(16).padStart(4, '0') });
    const reference = test.offer(BUYER_ID, CLERK_ID, PRODUCT_ID, amountMinor);
    const decision = test.active.decide(reference, CLERK_ID);
    assert.equal(decision.candidates.find(candidate => candidate.act === 'Accept').eligible, amountMinor >= 300);
    const reply = test.reply(CLERK_ID, reference);
    return { amountMinor, decision, reply, journal: test.trace().journal };
  });
}

function delayedCompletion() {
  const test = session({
    runId: 'run_0205',
    actors: [
      { id: BUYER_ID, name: 'Customer', role: 'customer', balanceMinor: 1000, completionObservation: 'delayed' },
      { id: CLERK_ID, name: 'Clerk', role: 'clerk', balanceMinor: 0 },
    ],
    relationships: [
      { actorId: BUYER_ID, towardId: CLERK_ID, warmth: 0, trust: -2 },
      { actorId: CLERK_ID, towardId: BUYER_ID, warmth: 2, trust: 2 },
    ],
  });
  const reference = test.offer(BUYER_ID, CLERK_ID);
  assert.equal(test.reply(CLERK_ID, reference).type, 'agreement');
  const [payment, handover] = settle(test, reference);
  let judgments = test.active.inspect().data.judgments;
  assert.equal(judgments.find(item => item.actorId === BUYER_ID).warmth, 0);
  test.loadAndReplay(payment, handover);
  const { command, ...result } = test.active.deliverCompletionObservation(test.nextId(), { actorId: BUYER_ID, reference });
  assert.equal(result.status, 'committed');
  test.steps.push({ action: 'learn_original_completion', command, result });
  judgments = test.active.inspect().data.judgments;
  assert.equal(judgments.find(item => item.actorId === BUYER_ID).warmth, 1);
  assert.equal(judgments.find(item => item.actorId === BUYER_ID).trust, -2);
  assert.equal(judgments.find(item => item.actorId === CLERK_ID).warmth, 2);
  assert.equal(judgments.find(item => item.actorId === CLERK_ID).trust, 2);
  test.loadAndReplay({ command, result });
  ledgerAmounts(test, 700, 300);
  return test.trace();
}

function shoppingRun(humanId, runId) {
  const cheaperProduct = 'subject_0004';
  const cheaperUnit = 'unit_0004';
  const hiddenProduct = 'subject_0005';
  const hiddenUnit = 'unit_0005';
  const test = session({
    humanId, runId,
    actors: [
      {
        id: BUYER_ID, name: 'Customer', role: 'customer', balanceMinor: 1000,
        shopping: { clerkId: CLERK_ID, wants: [{ kind: 'drink', budgetMinor: 300 }] },
      },
      { id: CLERK_ID, name: 'Clerk', role: 'clerk', balanceMinor: 0 },
    ],
    products: [
      { productId: PRODUCT_ID, label: 'Sealed drink', priceMinor: 300, kind: 'drink' },
      { productId: cheaperProduct, label: 'Glass of water', priceMinor: 225, kind: 'drink' },
      { productId: hiddenProduct, label: 'Back-room drink', priceMinor: 100, kind: 'drink' },
    ],
    units: [
      { id: UNIT_ID, productId: PRODUCT_ID, holderId: CLERK_ID, ownerId: STORE_ID },
      { id: cheaperUnit, productId: cheaperProduct, holderId: CLERK_ID, ownerId: STORE_ID },
      { id: hiddenUnit, productId: hiddenProduct, holderId: CLERK_ID, ownerId: STORE_ID },
    ],
    knowledge: [
      { actorId: BUYER_ID, unitId: UNIT_ID },
      { actorId: BUYER_ID, unitId: cheaperUnit },
      { actorId: CLERK_ID, unitId: UNIT_ID, available: true },
      { actorId: CLERK_ID, unitId: cheaperUnit, available: true },
    ],
  });

  let reference;
  if (humanId === CLERK_ID) {
    const { command, result: { receipt: { result } } } = test.attempt('shop', { actorId: BUYER_ID });
    assert.deepEqual(command.payload, { actorId: BUYER_ID, action: 'shop' });
    assert.equal(result.choice, 'Buy');
    reference = { id: result.proposalId, version: result.version };
  } else {
    reference = test.offer(BUYER_ID, CLERK_ID, cheaperProduct, 225);
  }

  const heard = test.active.view(CLERK_ID).observations.at(-1).receivedDetails.communication;
  assert.equal(heard.expression.body.requested.item.productId, cheaperProduct);
  assert.equal(heard.expression.body.offered.quantity.amount, 225);
  assert(!test.active.view(BUYER_ID).references.some(reference => reference.productId === hiddenProduct));
  const menu = test.active.forActor(CLERK_ID).menu(reference);
  assert.equal(test.reply(CLERK_ID, reference, humanId === CLERK_ID ? 'Accept' : null).type, 'agreement');
  test.loadAndReplay(...settle(test, reference));
  ledgerAmounts(test, 775, 225);
  return { menu, heard, ...test.trace() };
}

const autonomous = shoppingRun(CLERK_ID, 'run_0206');
const human = shoppingRun(BUYER_ID, 'run_0207');
assert.deepEqual(autonomous.menu, human.menu);
assert.deepEqual(autonomous.ledger, human.ledger);

process.stdout.write(JSON.stringify({
  schema: 'first-encounter-lab/headless-generalization-trace@1',
  evidence: 'Separate deterministic runs from authored headless scenario receipts. The journal contains actual committed commands and receipts. The policy and judgment records are privileged review evidence.',
  clerkOriginatedTwoSales: twoSales(),
  refusalAndCounter: refusalAndCounter(),
  clarification: clarification(),
  paidFailureRestoreAndRetry: failureAndRetry(),
  markedPriceComparisons: priceDecisions(),
  delayedFirstCompletion: delayedCompletion(),
  autonomousShopperHumanClerk: autonomous,
  humanShopperRulesClerk: human,
}, null, 2) + '\n');
