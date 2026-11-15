import assert from 'node:assert/strict';
import test from 'node:test';
import { choosePurchaseResponse, CLERK_PROFILE, CUSTOMER_PROFILE, deliveryFit, passingDeliveryNudge } from '../../../decisions/clerk.mjs';

function clerkView() {
  return {
    actorId: 'actor_0002',
    role: 'clerk',
    profile: CLERK_PROFILE,
    offer: {
      proposalId: 'proposal_0001',
      version: 1,
      productId: 'subject_1001',
      amountMinor: 500,
      observationId: 'observation_0020',
      cues: [{ kind: 'displayed_concern', text: 'Expresses concern' }],
      prominence: 'measured'
    },
    product: {
      productId: 'subject_1001',
      priceMinor: 500,
      available: true,
      observationId: 'observation_0021'
    }
  };
}

const find = (result, act) => result.candidates.find(entry => entry.act === act);

test('a known exact-price sale is ranked using only the received offer and scoped observation', () => {
  const view = clerkView();
  const original = structuredClone(view);
  const result = choosePurchaseResponse(view);
  assert.deepEqual(result, choosePurchaseResponse(structuredClone(view)));
  assert.deepEqual(view, original);
  assert.equal(result.selected, 'Accept');
  assert.deepEqual(result.evidenceObservationIds, ['observation_0020', 'observation_0021']);
  assert.equal(find(result, 'Accept').score, 6);
  assert.equal(find(result, 'Accept').rank, 1);
  assert(find(result, 'Accept').rows.some(({ factor, points }) => factor === 'makeMoney' && points === 3));
  assert(Object.isFrozen(find(result, 'Accept').rows));
});

test('observed stock and below-list restrictions cannot be overridden by the delivery', () => {
  const view = clerkView();
  view.warmth = 2;
  view.product.available = false;
  let result = choosePurchaseResponse(view);
  assert.equal(result.selected, 'Refuse');
  assert.match(result.reason, /unavailable/);
  assert.equal(find(result, 'Accept').eligible, false);

  view.product.available = true;
  view.offer.amountMinor = 499;
  result = choosePurchaseResponse(view);
  assert.equal(result.selected, 'Counter');
  assert.match(result.reason, /marked price/);
  assert.equal(find(result, 'Accept').eligible, false);
  assert.equal(find(result, 'Counter').amountMinor, 500);
});

test('permission comes from the role and never the actor controller', () => {
  const view = clerkView();
  assert.deepEqual(
    choosePurchaseResponse({ ...view, controller: 'human' }),
    choosePurchaseResponse({ ...view, controller: 'rules' })
  );
  view.role = 'customer';
  const mismatch = choosePurchaseResponse(view);
  assert.equal(mismatch.selected, 'Refuse');
  assert.equal(find(mismatch, 'Accept').rule, 'M1');

  view.profile = CUSTOMER_PROFILE;
  assert.equal(choosePurchaseResponse(view).selected, 'Accept');
});

test('unknown stock prompts a question without disclosing authoritative stock or granting assent', () => {
  const view = clerkView();
  view.product.available = null;
  const result = choosePurchaseResponse(view);
  assert.equal(result.selected, 'Clarify');
  assert.equal(result.missing, 'stock');
  assert.deepEqual(result.candidates.filter(({ eligible }) => eligible).map(({ act }) => act), ['Clarify']);
  assert.match(result.reason, /whether this item is in stock/);
  assert.deepEqual(choosePurchaseResponse({ ...view, authoritativeStock: 0 }), result);
  assert.deepEqual(choosePurchaseResponse({ ...view, authoritativeStock: 99 }), result);

  view.product.productId = 'subject_1002';
  const unknown = choosePurchaseResponse(view);
  assert.equal(unknown.selected, 'Clarify');
  assert.equal(unknown.missing, 'list_price');
  assert.deepEqual(unknown.evidenceObservationIds, ['observation_0020']);
  assert.equal(find(unknown, 'Accept').eligible, false);
});

test('outward cue prominence affects goodwill and private delivery fields never affect the ranking', () => {
  const view = clerkView();
  view.offer.prominence = 'understated';
  const understated = choosePurchaseResponse(view);
  assert.equal(understated.warmth.nudge, 0);
  assert.equal(find(understated, 'Accept').score, 5);

  view.offer.prominence = 'emphatic';
  const emphatic = choosePurchaseResponse(view);
  assert.equal(emphatic.warmth.nudge, 1);
  assert.equal(find(emphatic, 'Accept').score, 6);
  view.offer.privateComposition = { selectedVibe: 'BA', selectedSalience: 'SUBTLE' };
  assert.deepEqual(choosePurchaseResponse(view), emphatic);
  assert(!JSON.stringify(emphatic).includes('privateComposition'));
});

test('the appointed leaning breaks an actual score tie and the spoken reason names a flipping factor', () => {
  const view = clerkView();
  view.offer.cues = [{ kind: 'direct_demand' }];
  view.warmth = -2;
  const personality = {
    ...CLERK_PROFILE.personality,
    priorityNudges: { makeMoney: -1, helpCustomers: -1 }
  };
  const makeView = leaning => ({ ...view, profile: { ...view.profile, personality: { ...personality, leaning } } });
  const cautious = choosePurchaseResponse(makeView('cautious'));
  const even = choosePurchaseResponse(makeView('even'));
  assert.deepEqual(cautious.candidates.slice(0, 2).map(({ score }) => score), [0, 0]);
  assert.equal(cautious.tieRule.used, true);
  assert.equal(cautious.selected, 'Refuse');
  assert.equal(cautious.reasonFactor, 'delivery');
  assert.equal(even.tieRule.used, true);
  assert.equal(even.selected, 'Accept');
  assert.equal(even.reasonFactor, 'makeMoney');
  assert.match(cautious.reason, /put that request/);
});

test('both controllers share role-based Counter terms, cap and explicit unsupported choices', () => {
  for (const role of ['clerk', 'customer']) {
    const view = { ...clerkView(), role, profile: role === 'clerk' ? CLERK_PROFILE : CUSTOMER_PROFILE };
    view.offer.amountMinor = role === 'clerk' ? 400 : 600;
    for (const controller of ['human', 'rules']) {
      const first = choosePurchaseResponse({ ...view, controller, counterCount: 0 });
      assert.equal(find(first, 'Counter').amountMinor, 500);
      assert.equal(find(first, 'Defer').eligible, false);
      assert.equal(find(first, 'Acknowledge').eligible, false);
      const capped = choosePurchaseResponse({ ...view, controller, counterCount: 2 });
      assert.equal(find(capped, 'Counter').eligible, false);
      assert.equal(find(capped, 'Counter').rule, 'G05');
      assert.equal(capped.selected, 'Refuse');
    }
  }
});

test('reply delivery comes from the responding character and a stable negative row supplies a fallback reason', () => {
  const view = clerkView();
  view.offer.cues = [];
  assert.deepEqual(choosePurchaseResponse(view).delivery, { vibe: 'EA', salience: 'NUANCED' });
  const shopper = { ...view, role: 'customer', profile: CUSTOMER_PROFILE };
  assert.deepEqual(choosePurchaseResponse(shopper).delivery, { vibe: 'SE', salience: 'NUANCED' });

  const cold = choosePurchaseResponse({ ...view, warmth: -1 });
  assert.equal(cold.selected, 'Accept');
  assert.equal(cold.reasonFactor, 'goodwill');
  assert.equal(find(cold, 'Accept').reason, cold.reason);
});

test('a 300-minor-unit listing blocks 200, scores 300 and 400, and uses only observed restrictions', () => {
  const view = clerkView();
  view.product.priceMinor = 300;
  const results = [200, 300, 400].map(amountMinor =>
    choosePurchaseResponse({ ...view, offer: { ...view.offer, amountMinor } }));
  assert.deepEqual(results.map(result => ({
    accept: find(result, 'Accept').eligible, selected: result.selected, rule: result.reasonRule ?? null
  })), [
    { accept: false, selected: 'Counter', rule: 'M2' },
    { accept: true, selected: 'Accept', rule: null },
    { accept: true, selected: 'Accept', rule: null }
  ]);
  assert.equal(find(results[0], 'Counter').amountMinor, 300);
  assert.equal(results[0].reason, 'I cannot sell below the marked price.');
  for (const result of results.slice(1)) {
    assert.equal(result.reason, 'I accept the immediate exchange on these terms.');
    assert.equal(find(result, 'Accept').score, 6);
  }

  const offer = { ...view.offer, amountMinor: 400 };
  const unavailable = choosePurchaseResponse({ ...view, offer, product: { ...view.product, available: false } });
  assert.equal(unavailable.selected, 'Refuse');
  assert.equal(unavailable.reasonRule, 'C4');
  const unseen = choosePurchaseResponse({ ...view, offer, product: null, actualListPrice: 700 });
  assert.equal(unseen.selected, 'Clarify');
  assert.deepEqual(unseen, choosePurchaseResponse({ ...view, offer, product: null, actualListPrice: 100 }));
});

test('the same above-list offer can be refused by a known scoring factor with acceptance still eligible', () => {
  const view = clerkView();
  view.product.priceMinor = 300;
  view.offer.amountMinor = 400;
  view.offer.cues = [{ kind: 'direct_demand' }];
  view.warmth = -2;
  view.profile = {
    ...CLERK_PROFILE,
    personality: {
      ...CLERK_PROFILE.personality, leaning: 'cautious', priorityNudges: { makeMoney: -1, helpCustomers: -1 }
    }
  };
  const result = choosePurchaseResponse(view);
  assert.equal(find(result, 'Accept').eligible, true);
  assert.equal(result.selected, 'Refuse');
  assert.equal(result.reasonFactor, 'delivery');
});

test('the private scorecard accounts for sources, personality weights, directed warmth and zero immediate risk', () => {
  const view = clerkView();
  view.trust = 2;
  view.warmth = 1;
  view.judgmentCauses = [{
    judgment: 'warmth', kind: 'first_purchase', causeId: 'purchase-cause',
    source: { kind: 'event', id: 'event_0004' }, observationId: 'observation_0004', reason: 'first completion',
    requestedDelta: 1, appliedDelta: 1, before: 0, after: 1
  }];
  view.profile = {
    ...CLERK_PROFILE,
    personality: { ...CLERK_PROFILE.personality, priorityNudges: { helpCustomers: 1 } }
  };
  const card = choosePurchaseResponse(view);
  const rows = find(card, 'Accept').rows;
  assert.deepEqual(rows.map(row => [row.factor, row.weight, row.effect, row.points]), [
    ['keepJob', 4, 0, 0], ['makeMoney', 3, 1, 3], ['helpCustomers', 3, 1, 3],
    ['avoidExtraWork', 1, 0, 0], ['goodwill', 2, 1, 2], ['risk', 0, 0, 0]
  ]);
  assert.equal(find(card, 'Accept').score, 8);
  assert.equal(card.trigger.observationId, view.offer.observationId);
  assert.equal(card.trigger.fit, 1);
  assert.equal(card.warmth.nudge, 1);
  assert.deepEqual(card.warmth.causes, view.judgmentCauses);
  assert.notEqual(card.warmth.causes[0], view.judgmentCauses[0]);
  assert.equal(Object.isFrozen(view.judgmentCauses[0]), false);
  assert.equal(rows[2].sources.find(source => source.kind === 'personality').value, 1);
  assert.deepEqual(rows[4].sources.find(source => source.kind === 'stored_warmth').causes, view.judgmentCauses);
  const distrust = choosePurchaseResponse({ ...view, trust: -2 });
  const risk = find(distrust, 'Accept').rows.find(row => row.factor === 'risk');
  assert.equal(risk.weight, 4);
  assert.equal(risk.effect, 0);
  assert.equal(risk.points, 0);
  assert.equal(risk.sources.find(source => source.kind === 'stored_trust').value, -2);
  assert.equal(find(distrust, 'Accept').score, 8);
});

test('known circumstances carry their own receipts, and unknown circumstances cannot influence a scorecard', () => {
  const view = clerkView();
  const product = { ...view.product, available: false, availabilityObservationId: 'observation_0009' };
  const result = choosePurchaseResponse({ ...view, product, fundsMinor: 45 });
  assert.equal(result.selected, 'Refuse');
  assert.deepEqual(result.circumstances.map(entry => [entry.fact, entry.value, entry.source.observationId]), [
    ['marked_price', 500, 'observation_0021'], ['observed_availability', false, 'observation_0009']
  ]);
  assert.equal(find(result, 'Accept').exclusionClass, 'cannot');
  assert.equal(find(result, 'Accept').rule, 'C4');
  assert(find(result, 'Accept').sources.some(source => source.observationId === 'observation_0009'));
  for (const choice of ['Defer', 'Acknowledge']) {
    assert.equal(find(result, choice).score, null);
    assert.equal(find(result, choice).rule, 'C7');
  }
  const unknown = choosePurchaseResponse({ ...view, product: { ...view.product, available: null } });
  assert.equal(unknown.selected, 'Clarify');
  assert.equal(find(unknown, 'Clarify').score, null);
  assert(!unknown.circumstances.some(entry => entry.fact === 'observed_availability'));
  assert.deepEqual(unknown, choosePurchaseResponse({
    ...view, product: { ...view.product, available: null }, hiddenAvailability: true, hiddenTrust: 2
  }));

  const customer = choosePurchaseResponse({ ...view, role: 'customer', profile: CUSTOMER_PROFILE, fundsMinor: 45 });
  const cash = customer.circumstances.find(entry => entry.fact === 'own_cash');
  assert.equal(cash.source.actorId, view.actorId);
  assert.match(cash.effect, /payment would fail/);
});

test('the authored taste distinguishes actual receipt fit from passing prominence', () => {
  const cues = [{ kind: 'displayed_concern' }, { kind: 'unrecognized' }];
  const tastes = { displayed_concern: 1 };
  assert.equal(deliveryFit(cues, tastes), 1);
  assert.equal(passingDeliveryNudge(cues, 'understated', tastes), 0);
  assert.equal(passingDeliveryNudge(cues, 'emphatic', tastes), 1);
  assert.equal(passingDeliveryNudge(cues, 'emphatic', { displayed_concern: -1 }), -1);
});
