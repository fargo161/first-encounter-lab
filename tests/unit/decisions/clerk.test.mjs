import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseClerkResponse, CLERK_PROFILE } from '../../../decisions/clerk.mjs';

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

test('a known exact-price sale is ranked using only the received offer and scoped observation', () => {
  const view = clerkView();
  const original = structuredClone(view);
  const result = chooseClerkResponse(view);
  assert.deepEqual(result, chooseClerkResponse(structuredClone(view)));
  assert.deepEqual(view, original);
  assert.equal(result.selected, 'Accept');
  assert.deepEqual(result.evidenceObservationIds, ['observation_0020', 'observation_0021']);
  assert.equal(result.candidates[0].score, 6);
  assert.equal(result.candidates[0].rank, 1);
  assert(result.candidates[0].rows.some(({ factor, points }) => factor === 'makeMoney' && points === 3));
  assert(Object.isFrozen(result.candidates[0].rows));
});

test('observed stock and exact-price restrictions cannot be overridden by the delivery', () => {
  const view = clerkView();
  view.warmth = 3;
  view.product.available = false;
  let result = chooseClerkResponse(view);
  assert.equal(result.selected, 'Refuse');
  assert.match(result.reason, /unavailable/);
  assert.equal(result.candidates.find(({ act }) => act === 'Accept').eligible, false);

  view.product.available = true;
  view.offer.amountMinor = 499;
  result = chooseClerkResponse(view);
  assert.equal(result.selected, 'Refuse');
  assert.match(result.reason, /differs from the list price/);
  assert.equal(result.candidates.find(({ act }) => act === 'Accept').eligible, false);
});

test('permission comes from the clerk role and never the actor controller', () => {
  const view = clerkView();
  assert.deepEqual(
    chooseClerkResponse({ ...view, controller: 'human' }),
    chooseClerkResponse({ ...view, controller: 'rules' })
  );

  view.role = 'customer';
  const result = chooseClerkResponse(view);
  assert.equal(result.selected, 'Refuse');
  assert.match(result.reason, /no clerk permission/);
});

test('an unknown stock fact asks for clarification without disclosing an authoritative stock value', () => {
  const view = clerkView();
  view.product.available = null;
  const result = chooseClerkResponse(view);
  assert.equal(result.selected, 'Clarify');
  assert.equal(result.candidates.find(({ act }) => act === 'Accept').eligible, true);
  assert.match(result.reason, /needs current stock information/);
  assert.deepEqual(chooseClerkResponse({ ...view, authoritativeStock: 0 }), result);
  assert.deepEqual(chooseClerkResponse({ ...view, authoritativeStock: 99 }), result);

  view.product = { ...view.product, productId: 'subject_1002' };
  const unknown = chooseClerkResponse(view);
  assert.equal(unknown.selected, 'Clarify');
  assert.deepEqual(unknown.evidenceObservationIds, ['observation_0020']);
  assert.equal(unknown.candidates.find(({ act }) => act === 'Accept').eligible, false);
});

test('outward cue prominence affects goodwill and private delivery fields never affect the ranking', () => {
  const view = clerkView();
  view.offer.prominence = 'understated';
  const understated = chooseClerkResponse(view);
  assert.equal(understated.warmth.nudge, 0);
  assert.equal(understated.candidates[0].score, 5);

  view.offer.prominence = 'emphatic';
  const emphatic = chooseClerkResponse(view);
  assert.equal(emphatic.warmth.nudge, 1);
  assert.equal(emphatic.candidates[0].score, 6);
  view.offer.privateComposition = { selectedVibe: 'BA', selectedSalience: 'SUBTLE' };
  assert.deepEqual(chooseClerkResponse(view), emphatic);
  assert(!JSON.stringify(emphatic).includes('privateComposition'));
});

test('the appointed leaning breaks an actual score tie deterministically', () => {
  const view = clerkView();
  view.offer.cues = [];
  view.warmth = -3;
  const personality = {
    ...CLERK_PROFILE.personality,
    priorityNudges: { makeMoney: -1, helpCustomers: -1 }
  };
  const makeView = leaning => ({ ...view, profile: { ...view.profile, personality: { ...personality, leaning } } });
  const cautious = chooseClerkResponse(makeView('cautious'));
  const even = chooseClerkResponse(makeView('even'));
  assert.deepEqual(cautious.candidates.slice(0, 2).map(({ score }) => score), [0, 0]);
  assert.equal(cautious.tieRule.used, true);
  assert.equal(cautious.selected, 'Refuse');
  assert.match(cautious.reason, /cautious preference/);
  assert.equal(even.tieRule.used, true);
  assert.equal(even.selected, 'Accept');
});
