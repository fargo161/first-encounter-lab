import { freeze } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';
import { CUSTOMER_PROFILE } from './clerk.mjs';

function scoreChoice(profile, effects, sources) {
  const rows = Object.entries(profile.role.priorities).map(([factor, baseWeight]) => {
    const personalityNudge = profile.personality.priorityNudges[factor] ?? 0;
    const weight = baseWeight + personalityNudge;
    const effect = effects[factor] ?? 0;
    return {
      factor, baseWeight, personalityNudge, weight, effect, points: weight * effect,
      sources: [{ kind: 'role', profileId: profile.id }, { kind: 'personality', profileId: profile.id }, ...sources]
    };
  });
  return { rows, score: rows.reduce((total, row) => total + row.points, 0) };
}

function knownProduct(reference) {
  const { productId, unitId, label, kind, priceMinor, available, observationId, availabilityObservationId } = reference;
  return {
    productId, unitId, observationId, label: label ?? null, kind: kind ?? null, priceMinor: priceMinor ?? null,
    ...(typeof available === 'boolean' && { available, availabilityObservationId: availabilityObservationId ?? observationId })
  };
}

function productChoice(reference, order, wants, profile) {
  const product = knownProduct(reference);
  const want = wants.find(entry => entry.kind === product.kind);
  const observedPrice = Number.isSafeInteger(product.priceMinor) && product.priceMinor > 0;
  const eligible = Boolean(want && observedPrice);
  const reason = !want ? 'This item does not match an authored want.'
    : !observedPrice ? 'No marked price was received for this item.' : 'This item matches an authored want.';
  const sources = [
    { kind: 'observation', observationId: product.observationId },
    ...(want ? [{ kind: 'authored_want', itemKind: want.kind, budgetMinor: want.budgetMinor }] : [])
  ];
  const result = { product, order, eligible, reason, sources, budgetMinor: want?.budgetMinor ?? null };
  if (!eligible) return { ...result, score: null, rows: [] };
  return { ...result, ...scoreChoice(profile,
    { getWant: 1, keepBudget: Math.sign(want.budgetMinor - product.priceMinor) }, sources) };
}

function immediateOpening(chosen, profile, account) {
  const { product, budgetMinor, sources } = chosen;
  const buySources = [...sources, account];
  const restriction = !profile.role.permissions.includes('buy_stock') ? 'My role does not allow this purchase.'
    : product.available === false ? 'I have been told this item is unavailable.'
      : account.balanceMinor < product.priceMinor ? 'My cash does not cover the marked price.' : null;
  if (product.availabilityObservationId) {
    buySources.push({ kind: 'observation', observationId: product.availabilityObservationId, field: 'available' });
  }
  if (restriction) {
    return { act: 'Buy', product, eligible: false, reason: restriction, rows: [], score: null, sources: buySources };
  }
  return {
    act: 'Buy', product, eligible: true, reason: 'I can buy the item I wanted at the marked price.', sources: buySources,
    ...scoreChoice(profile, { getWant: 1, keepBudget: Math.sign(budgetMinor - product.priceMinor) }, buySources)
  };
}

/** Choose from the shopper's scoped references and own account; core authors delivery and effects. */
export function chooseShopperOpening({ actorId, profile = CUSTOMER_PROFILE, wants, products, fundsMinor }) {
  const productCandidates = products.filter(reference => typeof reference.observationId === 'string')
    .map((reference, order) => productChoice(reference, order, wants, profile));
  const rankedProducts = productCandidates.filter(candidate => candidate.eligible).sort((left, right) =>
    right.score - left.score || left.product.priceMinor - right.product.priceMinor || left.order - right.order
  );
  const account = { kind: 'own_account', actorId, balanceMinor: fundsMinor };
  const purchases = rankedProducts.map(candidate => immediateOpening(candidate, profile, account));
  if (purchases.length === 0) {
    purchases.push({
      act: 'Buy', product: null, eligible: false, reason: 'I have not seen a wanted item with a marked price.',
      rows: [], score: null, sources: []
    });
  }
  const buy = purchases.find(candidate => candidate.eligible);
  const preferred = purchases[0];
  const leaveSources = (buy ?? preferred).sources;
  const leave = {
    act: 'Leave', eligible: true, reason: buy ? 'I will leave without buying.' : preferred.reason,
    sources: leaveSources, ...scoreChoice(profile, { getWant: -1 }, leaveSources)
  };
  const opening = buy && buy.score >= leave.score ? buy : leave;
  const product = opening.product ?? preferred.product;
  const evidenceObservationIds = [...new Set(productCandidates.flatMap(({ product: observed }) =>
    [observed.observationId, observed.availabilityObservationId].filter(Boolean)))];

  return freeze({
    actorId, selected: opening.act, product, reason: opening.reason, evidenceObservationIds,
    offer: opening.act === 'Buy' ? {
      productId: product.productId, unitId: product.unitId, amountMinor: product.priceMinor,
      delivery: { vibe: profile.personality.manner.plain, salience: 'NUANCED' }
    } : null,
    productCandidates, openingCandidates: [...purchases, leave],
    tieRules: { product: ['score', 'lowest_marked_price', 'first_seen'], opening: ['Buy', 'Leave'] }
  });
}
