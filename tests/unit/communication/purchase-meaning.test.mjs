import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compileAcceptance, compileClarification, compileCounter, compileOffer, compileRefusal,
  exchangeTerms, expressionReference, observePurchaseMessage,
  validateExpression,
} from '../../../communication/purchase-meaning.mjs';

const buyerId = 'actor_0001';
const sellerId = 'actor_0002';
const bystanderId = 'actor_0003';
const proposal = { id: 'proposal_0001', version: 1, parent: null };
const scope = {
  producer: 'first-encounter-lab',
  runId: 'run_0001',
  packageRef: { id: 'package_0001', revision: 2, digest: 'a'.repeat(64) },
};
const terms = {
  buyerId, sellerId, storeId: 'store_0001', productId: 'subject_0001', unitId: 'unit_0001',
  amountMinor: 300, currency: 'USD',
};

function offer(overrides = {}) {
  return compileOffer({
    scope, id: 'message_0001', sequence: 1, speaker: buyerId, recipient: sellerId, proposal,
    terms, delivery: { vibe: 'SE', salience: 'NUANCED' }, label: 'Tea', ...overrides,
  });
}

function heard(record = offer(), observerId = record.expression.addressees[0]) {
  return observePurchaseMessage(record, { observationId: 'observation_0001', observerId });
}

function assent(record = offer(), overrides = {}) {
  const { id, version } = record.expression.proposal;
  return compileAcceptance({
    scope, id: 'message_0002', sequence: 2, speaker: record.expression.addressees[0],
    recipient: record.expression.speaker, offer: record, receipt: heard(record),
    reference: { id, version }, delivery: { vibe: 'EA', salience: 'NUANCED' }, ...overrides,
  });
}

test('a $3 product compiles into one immutable versioned exchange of typed Pay and Give', () => {
  const record = offer();
  const { expression } = record;
  assert.equal(expression.id, record.id);
  assert.equal(expression.schema, 'kw-expression@1');
  assert.equal(expression.function, 'OFFER');
  assert.equal(expression.force, 'proposal');
  assert.equal(expression.time.stance, 'future');
  assert.deepEqual(expression.addressees, [sellerId]);
  assert.deepEqual(expression.proposal, proposal);
  assert.deepEqual(expression.body, {
    node: 'exchange',
    offered: {
      node: 'action', termId: 'pay', act: 'Pay', actor: buyerId, recipient: terms.storeId,
      quantity: { amount: 300, unit: 'cent', currency: 'USD' },
    },
    requested: {
      node: 'action', termId: 'give', act: 'Give', actor: sellerId, for: terms.storeId,
      recipient: buyerId, item: { productId: terms.productId, unitId: terms.unitId },
      transfer: { title: true, custody: true },
    },
  });
  assert.deepEqual(exchangeTerms(expression), terms);
  assert.throws(() => { expression.body.offered.quantity.amount = 400; }, TypeError);
});

test('a clerk-originated Offer gives the same terms with Give on the offered side', () => {
  const record = offer({ speaker: sellerId, recipient: buyerId });
  assert.equal(record.expression.body.offered.act, 'Give');
  assert.equal(record.expression.body.requested.actor, buyerId);
  assert.deepEqual(exchangeTerms(record.expression), terms);
  const acceptance = assent(record);
  assert.equal(acceptance.expression.body.actor, buyerId);
  assert.equal(acceptance.expression.body.recipient, sellerId);
});

test('unadmitted shapes, amounts and unauthored vibes cannot compile or produce partial meaning', () => {
  assert.throws(() => offer({ terms: { ...terms, amountMinor: 0 } }), { code: 'UNSUPPORTED_TERMS' });
  assert.throws(() => offer({ terms: { ...terms, hold: true } }), { code: 'UNSUPPORTED_TERMS' });
  assert.throws(() => offer({ delivery: { vibe: 'BA', salience: 'NUANCED' } }), { code: 'UNAVAILABLE_EXPRESSION' });
  const record = offer();
  for (const node of ['AND', 'OR', 'IF', 'BEFORE', 'AFTER', 'UNTIL', 'NOT', 'ABOUT', 'BECAUSE']) {
    const expression = structuredClone(record.expression);
    expression.body.offered = { node, children: [expression.body.offered] };
    assert.throws(() => validateExpression(expression), { code: 'UNSUPPORTED_TERMS' }, node);
    assert.throws(() => heard({ ...record, expression }), { code: 'UNSUPPORTED_TERMS' }, node);
  }
});

test('only the addressee hears exact terms and outward cues without private composition', () => {
  const record = offer();
  const receipt = heard(record);
  const { communication } = receipt.receivedDetails;
  assert.equal(record.privateComposition.selectedVibe, 'SE');
  assert.deepEqual(receipt.roots, [{ kind: 'message', id: record.id }]);
  assert.deepEqual(communication.expression, record.expression);
  assert.equal(communication.prominence, 'measured');
  assert.deepEqual(communication.framing.map(cue => cue.kind), ['displayed_concern']);
  assert.match(communication.content.text, /300 cent \(USD\).*Tea \(unit_0001\)/);
  assert.doesNotMatch(JSON.stringify(receipt), /privateComposition|selectedVibe|selectedSalience|intendedFraming|templateId/);
  for (const actorId of [buyerId, bystanderId]) {
    assert.throws(() => heard(record, actorId), { code: 'NO_RECEIVING_PATH' });
  }
});

test('current self-assent cites the actual received Offer by exact immutable reference', () => {
  const record = offer();
  const receipt = heard(record);
  const { expression } = assent(record, { receipt });
  assert.equal(expression.function, 'REMARK');
  assert.equal(expression.force, 'currentSelfPerformance');
  assert.equal(expression.time.stance, 'current');
  assert.deepEqual(expression.addressees, [buyerId]);
  assert.deepEqual(expression.body.target, {
    proposalId: proposal.id,
    proposalVersion: proposal.version,
    expression: expressionReference(record.expression),
    observationId: receipt.id,
  });
  assert.throws(() => exchangeTerms(expression), { code: 'UNSUPPORTED_TERMS' });
});

test('ambiguous and stale references, wrong parties, missing receipts and copied receipts do not assent', () => {
  const record = offer();
  assert.throws(() => assent(record, { reference: null }), { code: 'AMBIGUOUS_ASSENT' });
  assert.throws(() => assent(record, { reference: { id: proposal.id, version: 2 } }), { code: 'STALE_PROPOSAL' });
  assert.throws(() => assent(record, { speaker: bystanderId }), { code: 'WRONG_RECIPIENT' });
  assert.throws(() => assent(record, { receipt: null }), { code: 'NO_RECEIVING_PATH' });
  assert.throws(() => assent(record, { receipt: { ...heard(record), observerId: buyerId } }), { code: 'NO_RECEIVING_PATH' });
  assert.throws(() => assent(record, { sequence: 1 }), { code: 'NO_RECEIVING_PATH' });
  const otherRun = { ...scope, runId: 'run_0002' };
  assert.throws(() => assent(record, { scope: otherRun }), { code: 'STALE_PROPOSAL' });
  assert.notEqual(expressionReference(record.expression).digest, expressionReference(offer({ scope: otherRun }).expression).digest);
});

test('equally named received terms cannot be changed or quoted into assent', () => {
  const record = offer();
  const receipt = structuredClone(heard(record));
  receipt.receivedDetails.communication.expression.body.offered.quantity.amount = 400;
  assert.throws(() => assent(record, { receipt }), { code: 'STALE_PROPOSAL' });
  const acceptance = assent(record);
  for (const variant of [
    { force: 'assertion', time: { stance: 'past' } },
    { force: 'assertion', time: { stance: 'quoted' } },
    { force: 'currentSelfPerformance', time: { stance: 'future' } },
  ]) {
    assert.throws(() => validateExpression({ ...acceptance.expression, ...variant }), { code: 'UNSUPPORTED_TERMS' });
  }
});

test('a new proposal version retains the exact qualified parent and leaves the prior terms intact', () => {
  const original = offer();
  const parent = expressionReference(original.expression);
  const next = offer({
    id: 'message_0003', sequence: 3, proposal: { ...proposal, version: 2, parent },
    terms: { ...terms, amountMinor: 400 },
  });
  assert.deepEqual(next.expression.proposal.parent, parent);
  assert.equal(exchangeTerms(original.expression).amountMinor, 300);
  assert.equal(exchangeTerms(next.expression).amountMinor, 400);
  assert.throws(() => offer({
    proposal: { ...proposal, version: 2, parent: { ...parent, scope: { ...scope, runId: 'run_0002' } } },
  }), { code: 'UNSUPPORTED_TERMS' });
});

function replyInput(record = offer(), overrides = {}) {
  const { id, version } = record.expression.proposal;
  return {
    scope, id: 'message_0002', sequence: 2, speaker: record.expression.addressees[0],
    recipient: record.expression.speaker, offer: record, receipt: heard(record),
    reference: { id, version }, delivery: { vibe: 'EA', salience: 'NUANCED' }, ...overrides,
  };
}

test('Refuse is a delivered Remark about the exact prior receipt, with the actor-safe reason', () => {
  const original = offer();
  const reason = 'I cannot sell below the marked price.';
  const record = compileRefusal(replyInput(original, { reason }));
  const { expression, content } = heard(record).receivedDetails.communication;
  assert.equal(expression.function, 'REMARK');
  assert.equal(expression.force, 'currentSelfPerformance');
  assert.equal(expression.body.act, 'Refuse');
  assert.deepEqual(expression.body.target.expression, expressionReference(original.expression));
  assert.equal(expression.body.target.observationId, heard(original).id);
  assert.equal(expression.body.reason, reason);
  assert.match(content.text, /Refuses proposal proposal_0001, version 1. I cannot sell below the marked price./);
  assert.throws(() => exchangeTerms(expression), { code: 'UNSUPPORTED_TERMS' });
  assert.throws(() => compileRefusal(replyInput(original, { reason, receipt: null })), { code: 'NO_RECEIVING_PATH' });
});

test('Clarify is a delivered Request for the exact missing actor-known field, without its value', () => {
  const reason = 'I need to check.';
  const original = offer();
  for (const [missing, question] of [
    ['stock', 'Is the item available?'],
    ['list_price', 'What is the list price?'],
  ]) {
    const record = compileClarification(replyInput(original, { reason, missing }));
    const { expression, content } = heard(record).receivedDetails.communication;
    assert.equal(content.kind, 'question');
    assert.equal(content.text, question + ' ' + reason);
    assert.equal(expression.function, 'REQUEST');
    assert.equal(expression.force, 'request');
    assert.equal(expression.body.act, 'Clarify');
    assert.equal(expression.body.missing, missing);
    assert.equal(expression.body.target.proposalId, proposal.id);
    assert.equal(expression.body.target.proposalVersion, proposal.version);
    assert.doesNotMatch(JSON.stringify(expression), /amountMinor|scorecard|privateComposition/);
  }
  assert.throws(() => compileClarification(replyInput(original, { reason, missing: 'hiddenStock' })), { code: 'UNSUPPORTED_TERMS' });
});

test('Counter delivers a new version with changed payment, an exact prior receipt and unchanged roles', () => {
  const original = offer();
  const parent = expressionReference(original.expression);
  const reason = 'The amount has to meet the marked price.';
  const args = replyInput(original, {
    reason,
    proposal: { ...proposal, version: 2, parent },
    terms: { ...terms, amountMinor: 350 },
    label: 'Tea',
  });
  const record = compileCounter(args);
  const { expression, content } = heard(record).receivedDetails.communication;
  assert.equal(expression.function, 'OFFER');
  assert.equal(expression.body.offered.act, 'Give');
  assert.equal(expression.proposal.version, 2);
  assert.deepEqual(expression.proposal.parent, parent);
  assert.deepEqual(expression.reply.target.expression, parent);
  assert.equal(expression.reply.target.observationId, heard(original).id);
  assert.equal(exchangeTerms(expression).amountMinor, 350);
  assert.equal(exchangeTerms(original.expression).amountMinor, 300);
  assert.match(content.text, /350 cent \(USD\)/);
  assert.match(content.text, /The amount has to meet the marked price\./);
  assert.throws(() => compileCounter({ ...args, terms }), { code: 'UNSUPPORTED_TERMS' });
  assert.throws(() => compileCounter({ ...args, terms: { ...args.terms, unitId: 'unit_0002' } }), { code: 'UNSUPPORTED_TERMS' });
  assert.throws(() => compileCounter({ ...args, reference: { id: proposal.id, version: 2 } }), { code: 'STALE_PROPOSAL' });
  assert.throws(() => compileCounter({ ...args, proposal: { ...args.proposal, id: 'proposal_0002' } }), { code: 'STALE_PROPOSAL' });
  assert.throws(() => compileCounter({ ...args, proposal: { ...args.proposal, parent: { ...parent, digest: 'b'.repeat(64) } } }),
    { code: 'UNSUPPORTED_TERMS' });
});

test('Accept may deliver the trusted stated reason using the responding character’s authored style', () => {
  const reason = 'This is a sale I can make.';
  const record = compileAcceptance(replyInput(offer(), {
    reason, delivery: { vibe: 'SE', salience: 'OVERT' },
  }));
  const receipt = heard(record);
  assert.equal(receipt.receivedDetails.communication.expression.body.reason, reason);
  assert.equal(receipt.receivedDetails.communication.prominence, 'emphatic');
  assert.equal(receipt.receivedDetails.communication.framing[0].kind, 'displayed_concern');
  assert.doesNotMatch(JSON.stringify(receipt), /privateComposition|selectedVibe|scorecard/);
});
