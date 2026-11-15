import assert from 'node:assert/strict';
import test from 'node:test';
import { CUSTOMER_PROFILE } from '../../../decisions/clerk.mjs';
import { chooseShopperOpening } from '../../../decisions/shopper.mjs';

const BUYER = 'actor_0001';
const observation = (number, priceMinor, fields = {}) => ({
  productId: 'subject_000' + number,
  unitId: 'unit_000' + number,
  observationId: 'observation_000' + number,
  kind: 'drink',
  priceMinor,
  ...fields,
});
const wants = [{ kind: 'drink', budgetMinor: 300 }];
function choose(products, options = {}) {
  return chooseShopperOpening({ actorId: BUYER, wants, products, fundsMinor: 800, ...options });
}

test('shopper chooses by authored budget weights then lowest marked price and first seen', () => {
  const products = [observation(1, 350), observation(2, 250), observation(3, 200), observation(4, 200)];
  const original = structuredClone(products);
  const result = choose(products);
  assert.equal(result.selected, 'Buy');
  assert.deepEqual(result.offer, {
    productId: products[2].productId, unitId: products[2].unitId, amountMinor: 200,
    delivery: { vibe: 'SE', salience: 'NUANCED' }
  });
  assert.deepEqual(result.productCandidates.map(candidate => candidate.score), [1, 7, 7, 7]);
  assert.deepEqual(result.evidenceObservationIds, products.map(entry => entry.observationId));
  assert.deepEqual(result, choose(structuredClone(products)));
  assert.deepEqual(products, original);
  assert.equal(Object.isFrozen(products[2]), false);
  assert.equal(choose([products[3], products[2]]).product.unitId, products[3].unitId);
});

test('marked prices score against the matching want budget before comparing list prices', () => {
  const products = [observation(1, 200), observation(2, 350, { kind: 'snack' })];
  const result = choose(products, {
    wants: [{ kind: 'drink', budgetMinor: 200 }, { kind: 'snack', budgetMinor: 450 }]
  });
  assert.equal(result.product.productId, products[1].productId);
  assert.deepEqual(result.productCandidates.map(candidate => candidate.score), [4, 7]);
});

test('an unaffordable preferred product stays ranked while an affordable alternative can be bought', () => {
  const preferred = observation(1, 400, { kind: 'snack' });
  const affordable = observation(2, 200);
  const options = {
    wants: [{ kind: 'drink', budgetMinor: 150 }, { kind: 'snack', budgetMinor: 450 }], fundsMinor: 350
  };
  const result = choose([preferred, affordable], options);
  assert.equal(result.product.productId, affordable.productId);
  assert.deepEqual(result.productCandidates.map(candidate => candidate.score), [7, 1]);
  assert.equal(result.productCandidates[0].eligible, true);
  assert.equal(result.selected, 'Buy');
  assert.equal(result.offer.amountMinor, 200);
  const buy = result.openingCandidates.find(candidate => candidate.product?.productId === preferred.productId);
  assert.equal(buy.eligible, false);
  assert.match(buy.reason, /cash does not cover/);
  assert(buy.sources.some(source => source.kind === 'own_account' && source.balanceMinor === 350));

  const noAlternative = choose([preferred], options);
  assert.equal(noAlternative.selected, 'Leave');
  assert.equal(noAlternative.offer, null);
  assert.match(noAlternative.reason, /cash does not cover/);

  const overBudget = choose([observation(1, 400)], { fundsMinor: 400 });
  assert.equal(overBudget.selected, 'Buy');
  assert.equal(overBudget.openingCandidates[0].rows.find(row => row.factor === 'keepBudget').effect, -1);
});

test('a missing legitimate reference, matching want or marked price cannot produce an opening offer', () => {
  const unseen = observation(1, 50, { observationId: undefined });
  const wrongKind = observation(2, 200, { kind: 'supply' });
  const unknownPrice = observation(3, null);
  const result = choose([unseen, wrongKind, unknownPrice]);
  assert.equal(result.product, null);
  assert.equal(result.selected, 'Leave');
  assert.equal(result.offer, null);
  assert.deepEqual(result.evidenceObservationIds, [wrongKind.observationId, unknownPrice.observationId]);
  assert.equal(result.productCandidates.length, 2);
  assert(result.productCandidates.every(candidate => candidate.eligible === false));
  assert.equal(choose([observation(1, 100)], { wants: [] }).selected, 'Leave');
});

test('a received unavailability blocks Buy and undisclosed actual stock does not change the result', () => {
  const known = observation(1, 300);
  const result = choose([known]);
  assert.equal(result.selected, 'Buy');
  assert.deepEqual(result, choose([{ ...known, actualStock: 0, counterpartyPrivate: 'secret' }]));
  assert.deepEqual(result, choose([{ ...known, actualStock: 99 }], { actualStock: 0 }));
  const unavailable = choose([{ ...known, available: false, availabilityObservationId: 'observation_0010' }]);
  assert.equal(unavailable.selected, 'Leave');
  assert.match(unavailable.reason, /told this item is unavailable/);
  assert.deepEqual(unavailable.evidenceObservationIds, ['observation_0001', 'observation_0010']);
});

test('the shopper offers to buy another observed item when the preferred one is known unavailable', () => {
  const unavailable = observation(1, 300, { available: false, availabilityObservationId: 'observation_0010' });
  const available = observation(2, 350, { available: true });
  const options = { wants: [{ kind: 'drink', budgetMinor: 500 }] };
  const result = choose([unavailable, available], options);
  assert.equal(result.selected, 'Buy');
  assert.equal(result.product.unitId, available.unitId);
  assert.equal(result.offer.amountMinor, 350);
  assert.deepEqual(result.openingCandidates.map(candidate => [candidate.product?.unitId, candidate.eligible]), [
    [unavailable.unitId, false], [available.unitId, true], [undefined, true]
  ]);
  assert.match(result.openingCandidates[0].reason, /told this item is unavailable/);
  assert(result.openingCandidates[0].sources.some(source => source.observationId === 'observation_0010'));

  const unknown = observation(3, 325);
  const scoped = choose([unavailable, unknown, available], options);
  assert.equal(scoped.offer.unitId, unknown.unitId);
  assert.deepEqual(scoped, choose([unavailable, { ...unknown, actualStock: 0 }, available], options));
});

test('the opening draws its delivery and priority modifiers from the shopper profile', () => {
  const profile = {
    ...CUSTOMER_PROFILE,
    personality: {
      ...CUSTOMER_PROFILE.personality,
      manner: { ...CUSTOMER_PROFILE.personality.manner, plain: 'EA' },
      priorityNudges: { getWant: -1, keepBudget: 1 }
    }
  };
  const result = choose([observation(1, 200)], { profile });
  assert.equal(result.offer.delivery.vibe, 'EA');
  const rows = result.openingCandidates[0].rows;
  assert.deepEqual(rows.map(row => [row.factor, row.weight, row.effect]), [
    ['getWant', 3, 1], ['keepBudget', 4, 1], ['stayOnTerms', 2, 0], ['saveTime', 1, 0]
  ]);
  assert(rows.every(row => row.sources.some(source => source.kind === 'personality')));
});
