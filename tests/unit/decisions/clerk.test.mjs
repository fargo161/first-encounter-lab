import assert from 'node:assert/strict';
import test from 'node:test';
import { choosePurchaseResponse, CLERK_PROFILE, CUSTOMER_PROFILE } from '../../../decisions/clerk.mjs';

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

test('observed stock and exact-price restrictions cannot be overridden by the delivery', () => {
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
  assert.equal(cautious.reasonFactor, 'goodwill');
  assert.equal(even.tieRule.used, true);
  assert.equal(even.selected, 'Accept');
  assert.equal(even.reasonFactor, 'makeMoney');
  assert.match(cautious.reason, /affect the other person/);
});

test('both controllers share role-based Counter terms, cap and explicit unsupported choices', () => {
  for (const role of ['clerk', 'customer']) {
    const view = { ...clerkView(), role, profile: role === 'clerk' ? CLERK_PROFILE : CUSTOMER_PROFILE };
    view.offer.amountMinor = 600;
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
