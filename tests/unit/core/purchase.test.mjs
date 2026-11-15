import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUYER_ID, CLERK_ID, PRICE_MINOR, PRODUCT_ID, STORE_ID, UNIT_ID, UNKNOWN_PRODUCT_ID, createPurchase,
} from '../../../core/purchase.mjs';
import { exchangeTerms } from '../../../communication/purchase-meaning.mjs';

const OTHER_BUYER = 'actor_0003';
const BYSTANDER = 'actor_0004';
const OTHER_PRODUCT = 'subject_0003';
const OTHER_UNIT = 'unit_0003';
const missingUnit = { id: UNIT_ID, productId: PRODUCT_ID, ownerId: BUYER_ID, holderId: BUYER_ID };

function actors(balanceMinor = 1000) {
  return [
    { id: BUYER_ID, name: 'Customer', role: 'customer', balanceMinor },
    { id: CLERK_ID, name: 'Clerk', role: 'clerk', balanceMinor: 50 },
    { id: OTHER_BUYER, name: 'Second customer', role: 'customer', balanceMinor: 900 },
    { id: BYSTANDER, name: 'Witness without a receipt', role: 'observer', balanceMinor: 10 },
  ];
}

function fixtureOptions() {
  return {
    runId: 'run_0100',
    store: { id: STORE_ID, balanceMinor: 125 },
    actors: actors(),
    products: [
      { productId: PRODUCT_ID, label: 'Sealed drink', priceMinor: 300, kind: 'drink' },
      { productId: OTHER_PRODUCT, label: 'Fruit', priceMinor: 200, kind: 'produce' },
    ],
    units: [
      { id: UNIT_ID, productId: PRODUCT_ID, ownerId: STORE_ID, holderId: CLERK_ID },
      { id: OTHER_UNIT, productId: OTHER_PRODUCT, ownerId: STORE_ID, holderId: CLERK_ID },
    ],
    knowledge: [
      { actorId: BUYER_ID, unitId: UNIT_ID },
      { actorId: CLERK_ID, unitId: UNIT_ID, available: true },
      { actorId: CLERK_ID, unitId: OTHER_UNIT, available: true },
      { actorId: OTHER_BUYER, unitId: UNIT_ID },
      { actorId: OTHER_BUYER, unitId: OTHER_UNIT },
    ],
  };
}

function harness(options) {
  const session = createPurchase(options);
  let next = 0;
  function submit(action, args) {
    const id = 'command_' + (++next).toString(16).padStart(4, '0');
    const command = session.command(id, action, args);
    return { ...session.submit(command), command };
  }
  return { session, submit };
}

function offered(submit, overrides = {}) {
  return submit('offer', {
    actorId: BUYER_ID, recipientId: CLERK_ID, productId: PRODUCT_ID, amountMinor: PRICE_MINOR,
    vibe: 'SE', salience: 'NUANCED', ...overrides,
  });
}

function committed(outcome) {
  assert.equal(outcome.status, 'committed', JSON.stringify(outcome));
  return outcome.receipt.result;
}

function reference(outcome) {
  const { proposalId, version } = committed(outcome);
  return { id: proposalId, version };
}

function settle(submit, ref, buyerId = BUYER_ID) {
  const payment = committed(submit('pay', { actorId: buyerId, reference: ref }));
  const handover = committed(submit('handover', { actorId: CLERK_ID, reference: ref }));
  assert.equal(payment.type, 'payment');
  assert.equal(handover.type, 'handover');
  assert.notEqual(handover.eventId, payment.eventId);
  assert.equal(handover.paymentEventId, payment.eventId);
}

test('each actor sees only granted references, their cash and their actual delivery', () => {
  const { session, submit } = harness(fixtureOptions());
  const command = offered(submit, { productId: OTHER_PRODUCT, amountMinor: 200 });
  assert.equal(command.code, 'UNKNOWN_REFERENCE');
  assert.equal(offered(submit, { recipientId: BYSTANDER }).code, 'WRONG_RECIPIENT');
  const scoped = session.forActor(BYSTANDER);
  const ref = reference(offered(submit));
  for (const hidden of ['inspect', 'save', 'restore', 'decide', 'command']) assert.equal(scoped[hidden], undefined);
  assert.deepEqual(scoped.view().account, { kind: 'personal_cash', currency: 'USD', balanceMinor: 10 });
  assert.deepEqual(scoped.view().references, []);
  assert.deepEqual(scoped.view().observations, []);
  assert.deepEqual(scoped.view().proposals, []);
  assert.throws(() => scoped.menu(ref), { code: 'STALE_PROPOSAL' });
  assert.equal(scoped.submit('command_00ed', 'pay', { actorId: BUYER_ID, reference: ref }).code, 'STALE_PROPOSAL');
  const heard = session.forActor(CLERK_ID).view().observations.at(-1);
  assert.equal(heard.receivedDetails.communication.expression.schema, 'kw-expression@1');
  assert.ok(!JSON.stringify(heard).includes('selectedVibe'));
  assert.notEqual(session.view(BUYER_ID).references[0].available, true);
  assert.equal(createPurchase().view(BUYER_ID).references.some(item => item.productId === UNKNOWN_PRODUCT_ID), false);
});

test('the reference $3 deal is heard, exact assent changes no assets, and independent effects replay once', () => {
  const { session, submit } = harness({ runId: 'run_0130' });
  const offer = offered(submit);
  const ref = reference(offer);
  assert.deepEqual(exchangeTerms(session.inspect().data.messages[0].expression), {
    buyerId: BUYER_ID, sellerId: CLERK_ID, storeId: STORE_ID, productId: PRODUCT_ID, unitId: UNIT_ID,
    amountMinor: PRICE_MINOR, currency: 'USD',
  });
  assert.equal(submit('respond', { actorId: CLERK_ID }).code, 'AMBIGUOUS_ASSENT');
  assert.equal(submit('pay', { actorId: BUYER_ID, reference: ref }).code, 'STALE_PROPOSAL');
  const unchanged = session.inspect().data.ledger;
  const agreement = committed(submit('respond', { actorId: CLERK_ID, reference: ref }));
  assert.equal(agreement.type, 'agreement');
  const accept = session.view(BUYER_ID).observations.at(-1).receivedDetails.communication.expression;
  assert.equal(accept.force, 'currentSelfPerformance');
  assert.deepEqual(session.inspect().data.ledger, unchanged);
  assert.equal(submit('handover', { actorId: CLERK_ID, reference: ref }).code, 'PAYMENT_REQUIRED');
  const pay = submit('pay', { actorId: BUYER_ID, reference: ref });
  assert.equal(committed(pay).type, 'payment');
  assert.equal(session.inspect().data.ledger.units[0].ownerId, STORE_ID);
  const give = submit('handover', { actorId: CLERK_ID, reference: ref });
  assert.equal(committed(give).type, 'handover');
  assert.equal(session.inspect().data.ledger.units[0].ownerId, BUYER_ID);
  assert.equal(session.inspect().data.ledger.units[0].holderId, BUYER_ID);
  const state = session.save();
  const copy = createPurchase();
  copy.restore(state);
  for (const previous of [offer, pay, give]) assert.deepEqual(copy.submit(previous.command), { status: 'replayed', receipt: previous.receipt });
  assert.equal(copy.save(), state);
  assert.equal(copy.inspect().data.ledger.accounts.find(account => account.id === STORE_ID).balanceMinor, 300);
});

test('a human clerk offers to sell and a rules-driven customer accepts through the same expression and ledger', () => {
  const { session, submit } = harness({ humanId: CLERK_ID });
  const offer = offered(submit, { actorId: CLERK_ID, recipientId: BUYER_ID });
  const ref = reference(offer);
  const message = session.inspect().data.messages[0].expression;
  assert.equal(message.body.offered.act, 'Give');
  assert.equal(message.body.requested.act, 'Pay');
  assert.equal(submit('respond', { actorId: CLERK_ID, reference: ref }).code, 'WRONG_RECIPIENT');
  assert.equal(committed(submit('respond', { actorId: BUYER_ID, reference: ref })).type, 'agreement');
  settle(submit, ref);
  assert.equal(session.view(BUYER_ID).account.balanceMinor, 700);
  assert.equal(session.view(CLERK_ID).account.balanceMinor, 0);
});

test('two live negotiations settle distinct products in a single run with conserved per-actor and till accounts', () => {
  const { session, submit } = harness(fixtureOptions());
  const first = reference(offered(submit));
  const second = reference(offered(submit, { actorId: OTHER_BUYER, productId: OTHER_PRODUCT, amountMinor: 200 }));
  assert.notEqual(first.id, second.id);
  assert.deepEqual(session.inspect().data.proposals.map(proposal => proposal.status), ['open', 'open']);
  committed(submit('respond', { actorId: CLERK_ID, reference: first }));
  settle(submit, first);
  assert.deepEqual(session.inspect().data.proposals.map(proposal => proposal.status), ['fulfilled', 'open']);
  committed(submit('respond', { actorId: CLERK_ID, reference: second }));
  settle(submit, second, OTHER_BUYER);
  const original = session.inspect().data.ledger;
  assert.deepEqual(original.accounts.map(account => account.balanceMinor), [700, 50, 700, 10, 625]);
  assert.deepEqual(original.units.map(unit => [unit.ownerId, unit.holderId]),
    [[BUYER_ID, BUYER_ID], [OTHER_BUYER, OTHER_BUYER]]);
  const restored = createPurchase();
  restored.restore(session.save());
  assert.deepEqual(restored.inspect().data.ledger, original);
  assert.equal(restored.save(), session.save());
});

test('a linked Offer version invalidates old assent and leaves the other chain open', () => {
  const { session, submit } = harness(fixtureOptions());
  const first = reference(offered(submit));
  const second = reference(offered(submit, { actorId: OTHER_BUYER }));
  const revised = reference(offered(submit, { supersedes: first, vibe: 'EA' }));
  assert.deepEqual(revised, { id: first.id, version: 2 });
  const before = session.save();
  assert.equal(submit('respond', { actorId: CLERK_ID, reference: first }).code, 'STALE_PROPOSAL');
  assert.equal(submit('respond', { actorId: OTHER_BUYER, reference: revised }).code, 'STALE_PROPOSAL');
  assert.equal(session.save(), before);
  committed(submit('respond', { actorId: CLERK_ID, reference: revised }));
  assert.equal(session.inspect().data.proposals.find(proposal => proposal.id === second.id).status, 'open');
  const [original, , updated] = session.inspect().data.messages;
  assert.equal(updated.expression.proposal.parent.id, original.id);
  assert.equal(original.expression.proposal.version, 1);
});

test('competing agreements on one unit cannot charge two customers before or after handover', () => {
  const { session, submit } = harness(fixtureOptions());
  const first = reference(offered(submit));
  const second = reference(offered(submit, { actorId: OTHER_BUYER }));
  committed(submit('respond', { actorId: CLERK_ID, reference: first }));
  committed(submit('respond', { actorId: CLERK_ID, reference: second }));
  committed(submit('pay', { actorId: BUYER_ID, reference: first }));
  assert.equal(submit('pay', { actorId: OTHER_BUYER, reference: second }).code, 'OUT_OF_STOCK');
  committed(submit('handover', { actorId: CLERK_ID, reference: first }));
  assert.equal(submit('pay', { actorId: OTHER_BUYER, reference: second }).code, 'OUT_OF_STOCK');
  assert.equal(session.view(OTHER_BUYER).account.balanceMinor, 900);
  assert.equal(session.inspect().data.events.filter(event => event.type === 'payment').length, 1);
});

test('insufficient cash, hidden stock and wrong performers cannot move money or goods', () => {
  const poor = { ...fixtureOptions(), actors: actors(299) };
  const hidden = { ...fixtureOptions(), units: [missingUnit, fixtureOptions().units[1]] };
  for (const [options, code] of [[poor, 'INSUFFICIENT_FUNDS'], [hidden, 'OUT_OF_STOCK']]) {
    const { session, submit } = harness(options);
    const ref = reference(offered(submit));
    committed(submit('respond', { actorId: CLERK_ID, reference: ref }));
    const state = session.save();
    assert.equal(submit('pay', { actorId: CLERK_ID, reference: ref }).code, 'WRONG_ACTOR');
    assert.equal(submit('handover', { actorId: BUYER_ID, reference: ref }).code, 'WRONG_ACTOR');
    assert.equal(submit('pay', { actorId: BUYER_ID, reference: ref }).code, code);
    assert.equal(session.save(), state);
  }
});

test('paid but unfulfilled handover failure restores and retries without another payment', () => {
  const { session, submit } = harness({ failFirstHandover: true });
  const ref = reference(offered(submit));
  committed(submit('respond', { actorId: CLERK_ID, reference: ref }));
  committed(submit('pay', { actorId: BUYER_ID, reference: ref }));
  const failed = submit('handover', { actorId: CLERK_ID, reference: ref });
  assert.equal(committed(failed).type, 'handover_failed');
  assert.equal(session.inspect().data.proposals[0].status, 'paid');
  assert.equal(session.inspect().data.ledger.units[0].ownerId, STORE_ID);
  const restored = createPurchase();
  restored.restore(session.save());
  assert.deepEqual(restored.submit(failed.command), { status: 'replayed', receipt: failed.receipt });
  const retry = restored.command('command_00fe', 'handover', { actorId: CLERK_ID, reference: ref });
  assert.equal(committed(restored.submit(retry)).type, 'handover');
  assert.equal(restored.view(BUYER_ID).account.balanceMinor, 700);
});

test('malformed, tampered, old-version and copied command inputs fail without replacing the run', () => {
  const { session, submit } = harness({ runId: 'run_0200' });
  const offer = offered(submit);
  const ref = reference(offer);
  const snapshot = session.save();
  assert.throws(() => session.restore('{}'));
  assert.throws(() => session.restore('{"schema":"lab-headless-purchase-save@1"}'), {
    code: 'INCOMPATIBLE_SAVE_VERSION', message: /historical v0\.1 runner/,
  });
  const tampered = JSON.parse(snapshot);
  tampered.run.data.proposals[0].status = 'fulfilled';
  assert.throws(() => session.restore(JSON.stringify(tampered)), { code: 'INVALID_SAVE' });
  const copied = createPurchase({ runId: 'run_0201' }).command('command_0100', 'pay', { actorId: BUYER_ID, reference: ref });
  assert.equal(session.submit(copied).code, 'WRONG_SESSION');
  const conflict = JSON.parse(JSON.stringify(offer.command));
  conflict.payload.amountMinor = 200;
  assert.equal(session.submit(conflict).code, 'IDENTITY_CONFLICT');
  const stale = JSON.parse(JSON.stringify(offer.command));
  stale.id = 'command_0101';
  assert.equal(session.submit(stale).code, 'STALE_COMMAND');
  assert.equal(session.save(), snapshot);
});

test('controller assignment changes eligibility of the interface, with identical role choices and settlement', () => {
  const results = [];
  for (const humanId of [BUYER_ID, CLERK_ID]) {
    const { session, submit } = harness({ humanId });
    const ref = reference(offered(submit));
    const menu = session.forActor(CLERK_ID).menu(ref);
    assert.ok(menu.includes('Accept'));
    const action = humanId === CLERK_ID ? 'accept' : 'respond';
    const other = action === 'accept' ? 'respond' : 'accept';
    assert.equal(submit(other, { actorId: CLERK_ID, reference: ref }).code, 'WRONG_CONTROLLER');
    committed(submit(action, { actorId: CLERK_ID, reference: ref }));
    settle(submit, ref);
    results.push({ menu, ledger: session.inspect().data.ledger });
  }
  assert.deepEqual(results[0], results[1]);
});

test('rules Refusal is actually delivered with actor-safe words and keeps the earlier terms', () => {
  const options = fixtureOptions();
  options.knowledge[1].available = false;
  const { session, submit } = harness(options);
  const ref = reference(offered(submit));
  const before = session.inspect().data.ledger;
  const result = committed(submit('respond', { actorId: CLERK_ID, reference: ref }));
  assert.equal(result.type, 'refusal');
  const received = session.forActor(BUYER_ID).view().observations.at(-1).receivedDetails.communication;
  assert.equal(received.expression.function, 'REMARK');
  assert.equal(received.expression.body.act, 'Refuse');
  assert.match(received.content.text, /unavailable/i);
  assert.doesNotMatch(JSON.stringify(received), /selectedVibe|candidates|score/);
  assert.deepEqual(session.inspect().data.ledger, before);
  assert.equal(session.inspect().data.proposals[0].status, 'refused');
  assert.equal(session.inspect().data.messages[0].expression.function, 'OFFER');
  assert.equal(submit('pay', { actorId: BUYER_ID, reference: ref }).code, 'STALE_PROPOSAL');
});

test('an actor requests genuinely missing price or stock and does not assent or learn hidden stock', () => {
  for (const missing of ['list_price', 'stock']) {
    const options = fixtureOptions();
    if (missing === 'stock') delete options.knowledge[1].available;
    else options.knowledge[1].priceKnown = false;
    for (const humanId of [BUYER_ID, CLERK_ID]) {
      const { session, submit } = harness({ ...options, humanId });
      const ref = reference(offered(submit));
      const asClerk = session.forActor(CLERK_ID);
      assert.deepEqual(asClerk.menu(ref), ['Clarify']);
      const response = humanId === CLERK_ID
        ? submit('reply', { actorId: CLERK_ID, reference: ref, choice: 'Clarify' })
        : submit('respond', { actorId: CLERK_ID, reference: ref });
      assert.equal(committed(response).type, 'clarification');
      const heard = session.view(BUYER_ID).observations.at(-1).receivedDetails.communication;
      assert.equal(heard.expression.function, 'REQUEST');
      assert.equal(heard.expression.body.act, 'Clarify');
      assert.match(heard.content.text, missing === 'stock' ? /whether.*stock/i : /marked price/i);
      assert.equal(heard.expression.body.target.proposalId, ref.id);
      assert.equal(session.inspect().data.proposals[0].status, 'open');
      assert.equal(submit('pay', { actorId: BUYER_ID, reference: ref }).code, 'STALE_PROPOSAL');
    }
  }
});

test('Counter creates an exact same-chain OFFER with the responding speaker and keeps another proposal open', () => {
  const { session, submit } = harness(fixtureOptions());
  const initial = reference(offered(submit, { amountMinor: 200 }));
  const other = reference(offered(submit, { actorId: OTHER_BUYER }));
  const counters = submit('respond', { actorId: CLERK_ID, reference: initial });
  const changed = reference(counters);
  assert.equal(counters.receipt.result.type, 'counter');
  assert.deepEqual(changed, { id: initial.id, version: 2 });
  const heard = session.view(BUYER_ID).observations.at(-1).receivedDetails.communication;
  assert.equal(heard.expression.speaker, CLERK_ID);
  assert.equal(heard.expression.function, 'OFFER');
  assert.equal(exchangeTerms(heard.expression).amountMinor, 300);
  assert.equal(heard.expression.proposal.parent.id, session.inspect().data.messages[0].id);
  assert.deepEqual([...session.forActor(BUYER_ID).menu(changed)].sort(), ['Accept', 'Refuse']);
  assert.equal(submit('accept', { actorId: BUYER_ID, reference: initial }).code, 'STALE_PROPOSAL');
  assert.equal(session.inspect().data.proposals.find(proposal => proposal.id === other.id).status, 'open');
  committed(submit('accept', { actorId: BUYER_ID, reference: changed }));
  const expected = session.save();
  const restored = createPurchase();
  restored.restore(expected);
  assert.deepEqual(restored.submit(counters.command), { status: 'replayed', receipt: counters.receipt });
  assert.equal(restored.save(), expected);
});

test('the same menu enforces the two-Counter maximum per actor and chain for both controller assignments', () => {
  for (const humanId of [BUYER_ID, CLERK_ID]) {
    for (const firstResponder of [BUYER_ID, CLERK_ID]) {
      const options = fixtureOptions();
      options.knowledge[0].listedPriceMinor = 200;
      options.knowledge[1].listedPriceMinor = 400;
      const { session, submit } = harness({ ...options, humanId });
      const sellerSpeaks = firstResponder === BUYER_ID;
      const initiation = sellerSpeaks
        ? offered(submit, { actorId: CLERK_ID, recipientId: BUYER_ID, amountMinor: 400 })
        : offered(submit, { amountMinor: 200 });
      let ref = reference(initiation);
      let actorId = firstResponder;
      for (let count = 0; count < 4; count++) {
        assert.ok(session.forActor(actorId).menu(ref).includes('Counter'));
        const args = { actorId, reference: ref };
        const response = actorId === humanId ? submit('reply', { ...args, choice: 'Counter' }) : submit('respond', args);
        ref = reference(response);
        assert.equal(response.receipt.result.type, 'counter');
        actorId = actorId === BUYER_ID ? CLERK_ID : BUYER_ID;
      }
      assert.equal(actorId, firstResponder);
      assert.deepEqual(session.forActor(actorId).menu(ref), ['Refuse']);
      assert.equal(session.decide(ref, actorId).candidates.find(candidate => candidate.act === 'Counter').rule, 'G05');
      const args = { actorId, reference: ref };
      if (actorId === humanId) {
        assert.equal(submit('reply', { ...args, choice: 'Counter' }).code, 'RESPONSE_INELIGIBLE');
        assert.equal(committed(submit('reply', { ...args, choice: 'Refuse' })).type, 'refusal');
      } else {
        assert.equal(committed(submit('respond', args)).type, 'refusal');
      }
      assert.equal(session.inspect().data.events.filter(event => event.type === 'counter').length, 4);
    }
  }
});

test('outward reply delivery derives from the replying character’s authored manner', () => {
  const outputs = [];
  for (const vibe of ['EA', 'SE']) {
    const options = fixtureOptions();
    options.actors[1].personality = { manner: { well: vibe, plain: vibe, badly: vibe } };
    const { session, submit } = harness(options);
    const ref = reference(offered(submit));
    committed(submit('respond', { actorId: CLERK_ID, reference: ref }));
    const heard = session.view(BUYER_ID).observations.at(-1).receivedDetails.communication;
    outputs.push(heard.framing);
    assert.equal(session.inspect().data.messages.at(-1).privateComposition.selectedVibe, vibe);
  }
  assert.notDeepEqual(outputs[0], outputs[1]);
});
