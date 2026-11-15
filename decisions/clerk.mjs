import roles from '../content/roles.json' with { type: 'json' };
import personalities from '../content/personalities.json' with { type: 'json' };
import { copy, freeze } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';

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

export function deliveryFit(cues, tastes) {
  return cues.reduce((sum, cue) => sum + (Object.hasOwn(tastes, cue.kind) ? tastes[cue.kind] : 0), 0);
}

function nudgeForFit(fit, prominence) {
  return prominence === 'understated' && Math.abs(fit) < 2 ? 0 : Math.sign(fit);
}

export function passingDeliveryNudge(cues, prominence, tastes) {
  return nudgeForFit(deliveryFit(cues, tastes), prominence);
}

function effectiveWarmth(stored, nudge) {
  return Math.max(-3, Math.min(3, stored + nudge));
}

function replyDelivery(effectiveWarmth, manner) {
  const mood = effectiveWarmth > 0 ? 'well' : effectiveWarmth < 0 ? 'badly' : 'plain';
  return { vibe: manner[mood], salience: Math.abs(effectiveWarmth) === 3 ? 'OVERT' : 'NUANCED' };
}

function scoredRows(candidate, context) {
  const { profile, warmth, trust, offer, circumstances, budgetMinor, preferredPrice } = context;
  const { act } = candidate;
  const goodwillEffect = { Accept: 1, Refuse: -1, Counter: 0 }[act];
  const salesEffect = act === 'Refuse' ? -1 : 1;
  const chosenPrice = act === 'Accept' ? offer.amountMinor : candidate.amountMinor;
  let budgetEffect = 0;
  if (chosenPrice != null && Number.isSafeInteger(budgetMinor)) {
    budgetEffect = Math.sign(budgetMinor - chosenPrice);
  }
  if (preferredPrice && chosenPrice > preferredPrice.counter) budgetEffect = -1;
  const impacts = {
    keepJob: [0, 'This immediate exchange has no discouraged terms.'],
    makeMoney: [salesEffect, 'An immediate sale would bring money into the store.'],
    helpCustomers: [goodwillEffect, 'I considered whether these terms give the customer what they asked for.'],
    avoidExtraWork: [0, 'An immediate sale leaves me nothing to track later.'],
    getWant: [salesEffect, 'I considered whether these terms get me the item.'],
    keepBudget: [budgetEffect, preferredPrice
      ? preferredPrice.text
      : 'I considered what the price means for my budget.'],
    stayOnTerms: [goodwillEffect, 'I considered whether these terms give the other person what they asked for.'],
    saveTime: [0, 'An immediate exchange requires no later visit.']
  };
  const offerSource = { kind: 'received_offer', observationId: offer.observationId };
  const rows = Object.entries(profile.role.priorities).map(([factor, baseWeight]) => {
    const [effect, evidence] = impacts[factor];
    const nudge = profile.personality.priorityNudges[factor] ?? 0;
    const sources = [
      { kind: 'role', profileId: profile.id, factor, value: baseWeight },
      { kind: 'personality', profileId: profile.id, factor, value: nudge },
      offerSource
    ];
    if (factor === 'makeMoney') {
      sources.push(...circumstances.filter(fact => fact.fact === 'marked_price' || fact.fact === 'observed_availability')
        .map(fact => fact.source));
    }
    if (factor === 'keepBudget') {
      if (Number.isSafeInteger(budgetMinor)) sources.push({ kind: 'authored_want', value: budgetMinor });
      if (preferredPrice) sources.push(preferredPrice.source);
    }
    return { factor, baseWeight, weight: baseWeight + nudge, effect, evidence, sources };
  });
  rows.push({
    factor: 'goodwill', weight: warmth.effective, effect: goodwillEffect,
    evidence: 'How this exchange would affect the other person matters to me.',
    sources: [
      { kind: 'stored_warmth', value: warmth.stored, causes: warmth.causes },
      { kind: 'received_delivery', observationId: offer.observationId, value: warmth.nudge }
    ]
  }, {
    factor: 'risk', weight: 2 - trust.stored, effect: 0,
    evidence: 'I would have nothing outstanding to rely on after this immediate exchange.',
    sources: [
      { kind: 'stored_trust', value: trust.stored, causes: trust.causes },
      { kind: 'decision_rule', rule: '6.1', basis: 'no_future_performance_exposure' },
      offerSource
    ]
  });
  return rows.map(row => ({ ...row, points: row.weight && row.effect ? row.weight * row.effect : 0 }));
}

function knownCircumstances(view, offer, product) {
  const facts = [];
  if (product?.priceMinor != null) facts.push({
    fact: 'marked_price', value: product.priceMinor,
    source: { kind: 'observation', observationId: product.priceObservationId ?? product.observationId, field: 'priceMinor' },
    effect: view.role === 'customer'
      ? 'Compare the offer to the observed marked price for the shopper’s insisted term.'
      : 'Apply the clerk’s price floor to its observed marked price.'
  });
  if (product?.available != null) facts.push({
    fact: 'observed_availability', value: product.available,
    source: { kind: 'observation', observationId: product.availabilityObservationId ?? product.observationId, field: 'available' },
    effect: product.available ? 'This receipt does not bar an immediate sale.' : 'This receipt bars acceptance under C4.'
  });
  if (view.role === 'customer' && Number.isSafeInteger(view.fundsMinor)) facts.push({
    fact: 'own_cash', value: view.fundsMinor,
    source: { kind: 'own_account', actorId: view.actorId },
    effect: view.fundsMinor < offer.amountMinor ? 'Immediate payment would fail under C3.' : 'Own cash covers immediate payment.'
  });
  return facts;
}

function candidate(act, eligible, reason, details = {}) {
  return { act, eligible, reason, rows: [], score: null, ...details };
}

function excluded(act, reason, rule, exclusionClass = 'cannot') {
  return candidate(act, false, reason, { exclusionClass, rule });
}

function rankScored(candidates, tieOrder, removePoints = () => 0) {
  const score = entry => entry.score - removePoints(entry);
  return [...candidates].sort((a, b) => score(b) - score(a) || tieOrder.indexOf(a.act) - tieOrder.indexOf(b.act));
}

function rankedReason(winner, scored, tieOrder, acceptanceBlock, warmth) {
  if (acceptanceBlock) return { reason: acceptanceBlock.text, reasonRule: acceptanceBlock.rule };

  // Try each distinct contribution to effective warmth before testing the full row.
  const winnerWithout = remove => rankScored(scored, tieOrder, remove)[0].act;
  const goodwillShift = (entry, alternative) => {
    const row = entry.rows.find(candidate => candidate.factor === 'goodwill');
    return (warmth.effective - alternative) * row.effect;
  };
  if (winnerWithout(entry => goodwillShift(entry, effectiveWarmth(warmth.stored, 0))) !== winner.act) {
    return { reason: 'How you put that request affected my decision.', reasonFactor: 'delivery' };
  }
  if (winnerWithout(entry => goodwillShift(entry, effectiveWarmth(0, warmth.nudge))) !== winner.act) {
    return { reason: 'How I feel about dealing with you affected my decision.', reasonFactor: 'warmth' };
  }
  const changedWinner = winner.rows.find(row =>
    winnerWithout(entry => entry.rows.find(candidate => candidate.factor === row.factor)?.points ?? 0) !== winner.act);
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
  if (role === 'clerk' && profile.role.minimumListPrice && amountMinor < product.priceMinor) {
    return { text: 'I cannot sell below the marked price.', rule: 'M2', class: 'may_not', counter: product.priceMinor };
  }
  return null;
}

function shopperPricePreference(role, profile, markedPrice, amountMinor) {
  if (role !== 'customer' || !profile.role.insistedTerms?.atMostObservedListPrice ||
      !markedPrice || amountMinor <= markedPrice.value) return null;
  return { counter: markedPrice.value, text: 'I usually pay the marked price.', source: markedPrice.source };
}

/** Rank from the responding actor's received facts; selecting never delivers or commits an act. */
export function choosePurchaseResponse(view) {
  const { actorId, role, profile = purchaseProfile(role), offer, product, counterCount = 0 } = view;
  const { proposalId, version, productId, amountMinor, observationId, cues = [], prominence = 'measured' } = offer;
  const knownProduct = product?.productId === productId ? product : null;
  const circumstances = knownCircumstances(view, offer, knownProduct);
  const evidenceObservationIds = [...new Set([observationId, knownProduct?.observationId,
    knownProduct?.priceObservationId, knownProduct?.availabilityObservationId].filter(Boolean))];
  const personality = (profile ?? CLERK_PROFILE).personality;
  const { leaning, deliveryTastes, manner } = personality;
  const tieOrder = TIE_ORDER[leaning];
  const storedWarmth = view.warmth ?? 0;
  const fit = deliveryFit(cues, deliveryTastes);
  const nudge = nudgeForFit(fit, prominence);
  const judgmentCauses = copy(view.judgmentCauses ?? []);
  const warmth = { stored: storedWarmth, nudge, effective: effectiveWarmth(storedWarmth, nudge),
    causes: judgmentCauses.filter(cause => cause.judgment === 'warmth') };
  const trust = { stored: view.trust ?? 0, causes: judgmentCauses.filter(cause => cause.judgment === 'trust') };

  const restriction = marketRestriction(role, profile, knownProduct, amountMinor);
  const markedPrice = circumstances.find(fact => fact.fact === 'marked_price');
  const preferredPrice = restriction ? null : shopperPricePreference(role, profile, markedPrice, amountMinor);
  let missing = null;
  if (!restriction) {
    if (knownProduct?.priceMinor == null) missing = 'list_price';
    else if (role === 'clerk' && knownProduct?.available == null) missing = 'stock';
  }
  const needsStock = missing === 'stock';
  const clarification = needsStock ? 'I need to know whether this item is in stock.' : 'I need to know the marked price of this item.';
  const refusal = restriction?.text ?? 'I am passing on this exchange.';
  const counterTerms = preferredPrice ?? restriction;
  const noCounter = counterCount >= 2 || counterTerms?.counter == null;
  const noCounterReason = counterCount >= 2
    ? 'I have already made two Counters in this negotiation.'
    : 'My role has no different supported terms to propose.';
  const options = [
    restriction
      ? excluded('Accept', restriction.text, restriction.rule, restriction.class)
      : missing
        ? excluded('Accept', clarification, 'C7')
        : candidate('Accept', true, 'I accept the immediate exchange on these terms.'),
    missing
      ? candidate('Clarify', true, clarification)
      : excluded('Clarify', restriction ? 'A known restriction answers the offer.' : 'I have the required facts.', '4.2'),
    missing && !view.allowRefuseMissing
      ? excluded('Refuse', clarification, 'C7')
      : candidate('Refuse', true, refusal),
    missing
      ? excluded('Counter', clarification, 'C7')
      : noCounter
        ? excluded('Counter', noCounterReason, counterCount >= 2 ? 'G05' : '4.3')
        : candidate('Counter', true, counterTerms.text, { amountMinor: counterTerms.counter }),
    excluded('Defer', 'Deferred responses are outside this immediate exchange.', 'C7'),
    excluded('Acknowledge', 'Acknowledge is outside this immediate exchange.', 'C7')
  ];

  const inputs = {
    profile: profile ?? CLERK_PROFILE, warmth, trust, offer, circumstances, budgetMinor: view.budgetMinor, preferredPrice
  };
  const eligible = options.filter(entry => entry.eligible);
  const ranked = missing ? eligible : rankScored(eligible.map(entry => {
    const rows = scoredRows(entry, inputs);
    return { ...entry, rows, score: rows.reduce((sum, row) => sum + row.points, 0) };
  }), tieOrder);
  const winner = ranked[0];
  const tied = ranked.length > 1 && winner.score !== null && winner.score === ranked[1].score;
  const reason = winner.rows.length
    ? rankedReason(winner, ranked, tieOrder, restriction, warmth)
    : { reason: winner.reason, ...(restriction && { reasonRule: restriction.rule }) };

  return freeze({
    actorId, proposalId, version, selected: winner.act, ...reason,
    trigger: { proposalId, version, productId, amountMinor, observationId, cues: copy(cues), prominence, fit },
    profileId: profile?.id ?? null, circumstances, missing, evidenceObservationIds, warmth, trust,
    delivery: replyDelivery(warmth.effective, manner),
    tieRule: { leaning, order: [...tieOrder], used: tied },
    candidates: [
      ...ranked.map((entry, index) => ({ ...entry, ...(index === 0 && reason), rank: index + 1 })),
      ...options.filter(entry => !entry.eligible).map(entry => ({
        ...entry, rank: null, sources: [
          { kind: 'decision_rule', rule: entry.rule },
          ...evidenceObservationIds.map(id => ({ kind: 'observation', observationId: id }))
        ]
      }))
    ]
  });
}
