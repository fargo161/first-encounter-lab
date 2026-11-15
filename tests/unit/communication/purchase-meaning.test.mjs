import assert from 'node:assert/strict';
import test from 'node:test';
import { compileAcceptance, compileOffer, observePurchaseMessage } from '../../../communication/purchase-meaning.mjs';

const buyerId = 'actor_0001';
const sellerId = 'actor_0002';
const productId = 'subject_0001';
const unitId = 'unit_0001';
const proposalId = 'proposal_0001';
const references = [{ productId, label: 'Tea', priceMinor: 500, unitId }];
const terms = {
  proposalId, version: 1,
  exchange: [{ act: 'Pay', amountMinor: 500 }, { act: 'Give', productId, unitId }]
};

function offer(overrides = {}) {
  return compileOffer({
    commandId: 'command_0001', sequence: 1, buyerId, sellerId, proposalId, version: 1,
    draft: { productId, amountMinor: 500, vibe: 'SE', salience: 'NUANCED' }, references, ...overrides
  });
}

function assent(overrides = {}) {
  const message = offer();
  const proposal = { id: proposalId, version: 1, buyerId, sellerId, productId, unitId,
    amountMinor: 500, offerMessageId: message.id, status: 'open' };

  return compileAcceptance({
    commandId: 'command_0002', sequence: 2, sellerId, proposal, reference: { id: proposalId, version: 1 },
    offerObservation: observePurchaseMessage(message, { observationId: 'observation_0001', observerId: sellerId }),
    ...overrides
  });
}

test('a known product compiles into one immutable, versioned Pay-for-Give Offer', () => {
  const message = offer();
  assert.equal(message.id, 'message_0001');
  assert.equal(message.outward.family, 'Offer');
  assert.equal(message.outward.targetId, productId);
  assert.deepEqual(message.outward.recipientIds, [sellerId]);
  assert.deepEqual(message.outward.terms, terms);
  assert.throws(() => { message.outward.terms.exchange[0].amountMinor = 1; }, TypeError);
});

test('unknown products, unsupported shapes and unauthored vibes do not compile', () => {
  const draft = { productId, amountMinor: 500, vibe: 'EA', salience: 'NUANCED' };
  assert.throws(() => offer({ references: [] }), { code: 'UNKNOWN_REFERENCE' });
  assert.throws(() => offer({ draft: { ...draft, hold: true } }), { code: 'UNSUPPORTED_TERMS' });
  assert.throws(() => offer({ draft: { ...draft, vibe: 'BA' } }), { code: 'UNAVAILABLE_EXPRESSION' });
});

test('recipient hears authored cues and prominence, without the speaker’s private composition', () => {
  const message = offer();
  assert.equal(message.privateComposition.selectedVibe, 'SE');
  const seen = observePurchaseMessage(message, { observationId: 'observation_0001', observerId: sellerId });
  assert.deepEqual(seen.receivedDetails, { communication: message.outward });
  assert.deepEqual(seen.roots, [{ kind: 'message', id: message.id }]);
  assert.equal(seen.receivedDetails.communication.prominence, 'measured');
  assert.deepEqual(seen.receivedDetails.communication.framing.map(cue => cue.kind), ['displayed_concern']);
  assert.doesNotMatch(JSON.stringify(seen), /privateComposition|selectedVibe|selectedSalience|intendedFraming|templateId/);
  assert.throws(() => observePurchaseMessage(message, { observationId: 'observation_0002', observerId: buyerId }), { code: 'NO_RECEIVING_PATH' });
});

test('the authorized recipient assents with a linked Remark that repeats the exact frozen terms', () => {
  const acceptance = assent();
  assert.equal(acceptance.contextMessageId, 'message_0001');
  assert.equal(acceptance.outward.family, 'Remark');
  assert.equal(acceptance.outward.act, 'accept_exchange');
  assert.deepEqual(acceptance.outward.terms, terms);
  assert.deepEqual(acceptance.outward.recipientIds, [buyerId]);
});

test('ambiguous or stale assent, wrong recipient and missing hearing do not produce an acceptance', () => {
  assert.throws(() => assent({ reference: null }), { code: 'AMBIGUOUS_ASSENT' });
  assert.throws(() => assent({ reference: { id: proposalId, version: 2 } }), { code: 'STALE_PROPOSAL' });
  assert.throws(() => assent({ sellerId: buyerId }), { code: 'WRONG_RECIPIENT' });
  assert.throws(() => assent({ offerObservation: null }), { code: 'NO_RECEIVING_PATH' });
});

test('even a matching target and version cannot assent to changed delivered terms', () => {
  const observed = structuredClone(observePurchaseMessage(offer(), { observationId: 'observation_0001', observerId: sellerId }));
  observed.receivedDetails.communication.terms.exchange[0].amountMinor = 400;
  assert.throws(() => assent({ offerObservation: observed }), { code: 'STALE_PROPOSAL' });
});
