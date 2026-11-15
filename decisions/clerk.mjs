import roles from '../content/roles.json' with { type: 'json' };
import personalities from '../content/personalities.json' with { type: 'json' };
import { freeze } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';

export const CLERK_PROFILE = freeze({
  id: 'store-clerk/default-v0.2',
  role: roles.clerk,
  personality: personalities.clerk
});

export const CUSTOMER_PROFILE = freeze({
  id: 'shopper/default-v0.2',
  role: roles.customer,
  personality: personalities.customer
});

export function purchaseProfile(role) {
  if (role === 'clerk') return CLERK_PROFILE;
  if (role === 'customer') return CUSTOMER_PROFILE;
  return null;
}

const TIE_ORDER = freeze({
  cautious: ['Refuse', 'Defer', 'Counter', 'Accept'],
  even: ['Counter', 'Defer', 'Accept', 'Refuse'],
  obliging: ['Accept', 'Counter', 'Defer', 'Refuse']
});

function deliveryNudge(cues, prominence, tastes) {
  const fit = cues.reduce((sum, cue) => sum + (Object.hasOwn(tastes, cue.kind) ? tastes[cue.kind] : 0), 0);
  return prominence === 'understated' && Math.abs(fit) < 2 ? 0 : Math.sign(fit);
}

function replyDelivery(effectiveWarmth, manner) {
  const mood = effectiveWarmth > 0 ? 'well' : effectiveWarmth < 0 ? 'badly' : 'plain';
  return { vibe: manner[mood], salience: Math.abs(effectiveWarmth) === 3 ? 'OVERT' : 'NUANCED' };
}

function scoredRows(act, { profile, warmth, evidenceObservationIds, offer, budgetMinor }) {
  const goodwillEffect = { Accept: 1, Refuse: -1, Counter: 0 }[act];
  const salesEffect = act === 'Refuse' ? -1 : 1;
  const budgetEffect = Number.isSafeInteger(budgetMinor) && act === 'Accept'
    ? Math.sign(budgetMinor - offer.amountMinor)
    : 0;
  const impacts = {
    keepJob: [0, 'This immediate exchange has no discouraged terms.'],
    makeMoney: [salesEffect, 'An immediate sale would bring money into the store.'],
    helpCustomers: [goodwillEffect, 'I considered whether these terms give the customer what they asked for.'],
    avoidExtraWork: [0, 'An immediate sale leaves me nothing to track later.'],
    getWant: [salesEffect, 'I considered whether these terms get me the item.'],
    keepBudget: [budgetEffect, 'I considered what the price means for my budget.'],
    stayOnTerms: [goodwillEffect, 'I considered whether these terms give the other person what they asked for.'],
    saveTime: [0, 'An immediate exchange requires no later visit.']
  };
  const rows = Object.entries(profile.role.priorities).map(([factor, baseWeight]) => {
    const [effect, evidence] = impacts[factor];
    return {
      factor, baseWeight, weight: baseWeight + (profile.personality.priorityNudges[factor] ?? 0),
      effect, evidence, profileId: profile.id, observationIds: [...evidenceObservationIds]
    };
  });
  rows.push({
    factor: 'goodwill', weight: warmth.effective, effect: goodwillEffect,
    evidence: 'How this exchange would affect the other person matters to me.',
    profileId: profile.id, observationIds: evidenceObservationIds.slice(0, 1)
  });
  return rows.map(row => ({ ...row, points: row.weight && row.effect ? row.weight * row.effect : 0 }));
}

function candidate(act, eligible, reason, details = {}) {
  return { act, eligible, reason, rows: [], score: null, ...details };
}

function excluded(act, reason, rule, exclusionClass = 'cannot') {
  return candidate(act, false, reason, { exclusionClass, rule });
}

function rankScored(candidates, tieOrder, omittedFactor) {
  const score = entry => entry.score - (entry.rows.find(row => row.factor === omittedFactor)?.points ?? 0);
  return [...candidates].sort((a, b) => score(b) - score(a) || tieOrder.indexOf(a.act) - tieOrder.indexOf(b.act));
}

function rankedReason(winner, scored, tieOrder, acceptanceBlock) {
  if (acceptanceBlock) return { reason: acceptanceBlock.text, reasonRule: acceptanceBlock.rule };
  const changedWinner = winner.rows.find(row => rankScored(scored, tieOrder, row.factor)[0].act !== winner.act);
  if (changedWinner) return { reason: changedWinner.evidence, reasonFactor: changedWinner.factor };
  const originalTerms = scored.find(entry => entry.act === 'Accept') ?? winner;
  const opposing = originalTerms.rows.filter(row => row.points < 0).sort((a, b) => a.points - b.points)[0];
  return opposing
    ? { reason: opposing.evidence, reasonFactor: opposing.factor }
    : { reason: winner.reason };
}

function marketRestriction(role, profile, product, amountMinor) {
  const permission = role === 'clerk'
    ? ['sell_stock', 'take_payment']
    : role === 'customer' ? ['buy_stock'] : [];
  if (!permission.length || profile?.role.id !== role ||
      !permission.every(action => profile.role.permissions.includes(action))) {
    return { text: 'My role does not permit this exchange.', rule: 'M1', class: 'may_not' };
  }
  if (product?.available === false) {
    return { text: 'I have been told this item is unavailable.', rule: 'C4', class: 'cannot' };
  }
  if (product?.priceMinor == null) return null;
  if (role === 'clerk' && profile.role.exactListPrice && amountMinor !== product.priceMinor) {
    return { text: 'I can only sell at the marked price.', rule: 'M2', class: 'may_not', counter: product.priceMinor };
  }
  if (role === 'customer' && profile.role.maxListPrice && amountMinor > product.priceMinor) {
    return { text: 'I will not pay above the marked price.', rule: 'M2', class: 'may_not', counter: product.priceMinor };
  }
  return null;
}

/** Rank from the responding actor's received facts; selecting never delivers or commits an act. */
export function choosePurchaseResponse(view) {
  const { actorId, role, profile = purchaseProfile(role), offer, product, counterCount = 0 } = view;
  const { proposalId, version, productId, amountMinor, observationId, cues = [], prominence = 'measured' } = offer;
  const knownProduct = product?.productId === productId ? product : null;
  const evidenceObservationIds = [...new Set([observationId, knownProduct?.observationId].filter(Boolean))];
  const personality = (profile ?? CLERK_PROFILE).personality;
  const { leaning, deliveryTastes, manner } = personality;
  const tieOrder = TIE_ORDER[leaning];
  const storedWarmth = view.warmth ?? 0;
  const nudge = deliveryNudge(cues, prominence, deliveryTastes);
  const warmth = { stored: storedWarmth, nudge, effective: Math.max(-3, Math.min(3, storedWarmth + nudge)) };

  const restriction = marketRestriction(role, profile, knownProduct, amountMinor);
  let missing = null;
  if (!restriction) {
    if (knownProduct?.priceMinor == null) missing = 'list_price';
    else if (role === 'clerk' && knownProduct?.available == null) missing = 'stock';
  }
  const needsStock = missing === 'stock';
  const clarification = needsStock ? 'I need to know whether this item is in stock.' : 'I need to know the marked price of this item.';
  const refusal = restriction?.text ?? 'I am passing on this exchange.';
  const noCounter = counterCount >= 2 || restriction?.counter == null;
  const noCounterReason = counterCount >= 2
    ? 'I have already made two Counters in this negotiation.'
    : 'My role has no different supported terms to propose.';
  const options = [
    restriction
      ? excluded('Accept', restriction.text, restriction.rule, restriction.class)
      : missing
        ? excluded('Accept', clarification, 'C7')
        : candidate('Accept', true, 'I accept the immediate exchange on these terms.'),
    missing ? excluded('Refuse', clarification, 'C7') : candidate('Refuse', true, refusal),
    missing
      ? excluded('Counter', clarification, 'C7')
      : noCounter
        ? excluded('Counter', noCounterReason, counterCount >= 2 ? 'G05' : '4.3')
        : candidate('Counter', true, restriction.text, { amountMinor: restriction.counter }),
    missing
      ? candidate('Clarify', true, clarification)
      : excluded('Clarify', restriction ? 'A known restriction answers the offer.' : 'I have the required facts.', '4.2'),
    excluded('Defer', 'Deferred responses are outside this immediate exchange.', 'C7'),
    excluded('Acknowledge', 'Acknowledge is outside this immediate exchange.', 'C7')
  ];

  const inputs = { profile: profile ?? CLERK_PROFILE, warmth, evidenceObservationIds, offer, budgetMinor: view.budgetMinor };
  const eligible = options.filter(entry => entry.eligible);
  const ranked = eligible.length === 1 ? eligible : rankScored(eligible.map(entry => {
    const rows = scoredRows(entry.act, inputs);
    return { ...entry, rows, score: rows.reduce((sum, row) => sum + row.points, 0) };
  }), tieOrder);
  const winner = ranked[0];
  const tied = ranked.length > 1 && winner.score === ranked[1].score;
  const reason = winner.rows.length
    ? rankedReason(winner, ranked, tieOrder, restriction)
    : { reason: winner.reason, ...(restriction && { reasonRule: restriction.rule }) };

  return freeze({
    actorId, proposalId, version, selected: winner.act, ...reason,
    missing, evidenceObservationIds, warmth, delivery: replyDelivery(warmth.effective, manner),
    tieRule: { leaning, order: [...tieOrder], used: tied },
    candidates: [
      ...ranked.map((entry, index) => ({ ...entry, ...(index === 0 && reason), rank: index + 1 })),
      ...options.filter(entry => !entry.eligible).map(entry => ({ ...entry, rank: null }))
    ]
  });
}
