import roles from '../content/roles.json' with { type: 'json' };
import personalities from '../content/personalities.json' with { type: 'json' };
import { freeze } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';

export const CLERK_PROFILE = freeze({
  id: 'store-clerk/default-v0.1',
  role: roles.clerk,
  personality: personalities.clerk
});

// Restricted to the responses that this headless slice can propose.
const TIE_ORDER = freeze({
  cautious: ['Refuse', 'Accept', 'Clarify'],
  even: ['Accept', 'Refuse', 'Clarify'],
  obliging: ['Accept', 'Refuse', 'Clarify']
});

function deliveryNudge(cues, prominence, tastes) {
  const fit = cues.reduce((sum, cue) => {
    const taste = Object.hasOwn(tastes, cue.kind) ? tastes[cue.kind] : 0;
    return sum + taste;
  }, 0);
  return prominence === 'understated' && Math.abs(fit) < 2 ? 0 : Math.sign(fit);
}

function scoreRows(act, profile, warmth, observationIds) {
  const effect = act === 'Accept' ? 1 : -1;
  const impacts = {
    keepJob: { effect: 0, evidence: 'Ordinary exact-price exchange applies no discouraged policy.' },
    makeMoney: { effect, evidence: 'Observed list price and available stock support an immediate sale.' },
    helpCustomers: { effect, evidence: 'The received offer states what the customer wants.' },
    avoidExtraWork: { effect: 0, evidence: 'Ordinary exchange adds no ongoing work.' }
  };
  const priorities = Object.entries(profile.role.priorities).map(([factor, baseWeight]) => ({
    factor,
    weight: baseWeight + (profile.personality.priorityNudges[factor] ?? 0),
    effect: impacts[factor].effect,
    evidence: impacts[factor].evidence,
    profileId: profile.id,
    observationIds: [...observationIds]
  }));
  const goodwill = {
    factor: 'goodwill',
    weight: warmth.effective,
    effect,
    evidence: 'Actor-local warmth and the received outward delivery cues.',
    profileId: profile.id,
    observationIds: [observationIds[0]]
  };
  return [...priorities, goodwill].map(row => ({
    ...row, points: row.weight === 0 || row.effect === 0 ? 0 : row.weight * row.effect
  }));
}

function candidate(act, eligible, reason, rows = []) {
  return { act, eligible, reason, rows, score: rows.length ? rows.reduce((sum, row) => sum + row.points, 0) : null };
}

/**
 * A narrow M3-style policy: filter from the actor's scoped evidence, then rank.
 * The caller supplies received offer cues and the clerk's own product observation.
 * This function neither reads the ledger nor commits a response.
 */
export function chooseClerkResponse(view) {
  const { actorId, role, profile, offer, product } = view;
  const { proposalId, version, productId, amountMinor, observationId, cues, prominence } = offer;
  const { leaning, deliveryTastes } = profile.personality;
  const tieOrder = TIE_ORDER[leaning];
  const knownProduct = product?.productId === productId ? product : null;
  const evidenceObservationIds = [...new Set([observationId, knownProduct?.observationId].filter(Boolean))];
  const maySell = role === 'clerk' && profile.role.id === role &&
    profile.role.permissions.includes('sell_stock') && profile.role.permissions.includes('take_payment');
  const priceKnown = knownProduct?.priceMinor != null;
  const stockKnown = knownProduct?.available === true || knownProduct?.available === false;

  let restriction = null;
  if (!maySell) {
    restriction = 'This actor has no clerk permission to sell store stock and take payment.';
  } else if (knownProduct?.available === false) {
    restriction = 'The clerk received an observation that the item is unavailable.';
  } else if (priceKnown && profile.role.exactListPrice && amountMinor !== knownProduct.priceMinor) {
    restriction = 'This offer differs from the list price in the clerk’s product observation.';
  }

  const needsClarification = !restriction && (!priceKnown || !stockKnown);
  const clarification = !priceKnown
    ? 'The clerk needs a product and list-price observation to verify the offer.'
    : 'The clerk needs current stock information before choosing a response.';
  const storedWarmth = view.warmth ?? 0;
  const nudge = deliveryNudge(cues, prominence ?? 'measured', deliveryTastes);
  const warmth = {
    stored: storedWarmth,
    nudge,
    effective: Math.max(-3, Math.min(3, storedWarmth + nudge))
  };

  let ranked;
  let notes;
  if (restriction) {
    ranked = [candidate('Refuse', true, restriction)];
    notes = [
      candidate('Accept', false, restriction),
      candidate('Clarify', false, 'The known restriction already answers this offer.')
    ];
  } else if (needsClarification) {
    ranked = [
      candidate('Clarify', true, clarification),
      ...(knownProduct ? [candidate('Accept', true, 'No known restriction bars acceptance. Clarification comes first.')] : []),
      candidate('Refuse', true, 'The clerk may decline an unverified offer.')
    ];
    notes = knownProduct ? [] : [candidate('Accept', false, 'The clerk lacks a scoped product reference to verify acceptance.')];
  } else {
    const purchaseReason = 'The received offer matches the observed list price and the clerk knows the item is available.';
    ranked = [
      candidate('Accept', true, purchaseReason, scoreRows('Accept', profile, warmth, evidenceObservationIds)),
      candidate('Refuse', true, 'The clerk may decline the sale.', scoreRows('Refuse', profile, warmth, evidenceObservationIds))
    ].sort((a, b) => b.score - a.score || tieOrder.indexOf(a.act) - tieOrder.indexOf(b.act));
    notes = [candidate('Clarify', false, 'The clerk already knows the required product, price and availability.')];
  }

  const selected = ranked[0];
  const tied = ranked.length > 1 && selected.score !== null && selected.score === ranked[1].score;
  const opposedAcceptance = ranked.find(entry => entry.act === 'Accept')?.rows.find(row => row.points < 0);
  const reason = tied
    ? `The highest scores tie. The clerk’s ${leaning} preference ranks ${selected.act} first.`
    : selected.act === 'Refuse' && !restriction && opposedAcceptance?.factor === 'goodwill'
      ? 'Actor-local goodwill weighs against accepting the offer.'
      : selected.reason;
  return freeze({
    actorId,
    proposalId,
    version,
    selected: selected.act,
    reason,
    evidenceObservationIds,
    warmth,
    tieRule: { leaning, order: [...tieOrder], used: tied },
    candidates: [
      ...ranked.map((entry, index) => ({ ...entry, rank: index + 1 })),
      ...notes.map(entry => ({ ...entry, rank: null }))
    ]
  });
}
