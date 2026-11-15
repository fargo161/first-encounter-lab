import { createHash, randomUUID } from 'node:crypto';
import products from '../content/products.json' with { type: 'json' };
import roles from '../content/roles.json' with { type: 'json' };
import personalities from '../content/personalities.json' with { type: 'json' };
import cues from '../content/based-cues.json' with { type: 'json' };
import { BASED_CATALOG, canonicalJson, copy, fields, freeze, id, integer, requireThat, text } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';
import { projectObservation, recipientHistory } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/views.mjs';
import { exchangeTerms, outwardCommunication } from '../communication/purchase-meaning.mjs';

export const BUYER_ID = 'actor_0001';
export const CLERK_ID = 'actor_0002';
export const STORE_ID = 'store_0001';
export const PRODUCT_ID = products.offerable.productId;
export const UNKNOWN_PRODUCT_ID = products.unobserved.productId;
export const UNIT_ID = products.offerable.unitId;
export const PRICE_MINOR = products.offerable.priceMinor;

function fixtureProduct(product, kind) {
  const { productId, label, priceMinor } = product;
  return { productId, label, priceMinor, kind };
}

const defaults = freeze({
  humanId: BUYER_ID,
  currency: 'USD',
  store: { id: STORE_ID, balanceMinor: 0 },
  actors: [
    {
      id: BUYER_ID, name: 'Customer', role: 'customer', balanceMinor: 1000,
      shopping: { clerkId: CLERK_ID, wants: [{ kind: 'drink', budgetMinor: 300 }] },
    },
    { id: CLERK_ID, name: 'Clerk', role: 'clerk', balanceMinor: 0 },
  ],
  products: [fixtureProduct(products.offerable, 'drink'), fixtureProduct(products.unobserved, 'supply')],
  units: [
    { id: UNIT_ID, productId: PRODUCT_ID, ownerId: STORE_ID, holderId: CLERK_ID },
    { id: products.unobserved.unitId, productId: UNKNOWN_PRODUCT_ID, ownerId: STORE_ID, holderId: CLERK_ID },
  ],
  relationships: [],
  knowledge: [
    { actorId: BUYER_ID, unitId: UNIT_ID },
    { actorId: CLERK_ID, unitId: UNIT_ID, available: true },
  ],
});

function distinct(entries, key) {
  requireThat(Array.isArray(entries) && entries.length === new Set(entries.map(key)).size, 'INVALID_SCENARIO');
}

function validatePersonality(personality) {
  fields(personality, [], ['leaning', 'priorityNudges', 'deliveryTastes', 'manner']);
  if (Object.hasOwn(personality, 'leaning')) {
    requireThat(['cautious', 'even', 'obliging'].includes(personality.leaning), 'INVALID_PERSONALITY');
  }
  for (const key of ['priorityNudges', 'deliveryTastes']) {
    if (!Object.hasOwn(personality, key)) continue;
    const values = personality[key];
    fields(values, [], Object.keys(values ?? {}));
    requireThat(Object.values(values).every(value => [-1, 0, 1].includes(value)), 'INVALID_PERSONALITY');
    if (key === 'priorityNudges') requireThat(Object.keys(values).length <= 2, 'INVALID_PERSONALITY');
  }
  if (Object.hasOwn(personality, 'manner')) {
    fields(personality.manner, [], ['well', 'plain', 'badly']);
    requireThat(Object.values(personality.manner).every(vibe => Object.hasOwn(BASED_CATALOG, vibe) && Object.hasOwn(cues, vibe)), 'INVALID_PERSONALITY');
  }
}

export function configureScenario(options = {}) {
  fields(options, [], ['runId', ...Object.keys(defaults)]);
  const settings = { runId: 'run_' + randomUUID().replaceAll('-', ''), ...copy(defaults), ...copy(options) };
  if (options.actors?.length && !Object.hasOwn(options, 'humanId')) settings.humanId = settings.actors[0].id;
  const { actors, humanId, store, currency, runId } = settings;
  id(runId, 'run');
  requireThat(/^[A-Z]{3}$/.test(currency) && typeof currency === 'string', 'INVALID_CURRENCY');
  fields(store, ['id', 'balanceMinor']);
  id(store.id, 'store');
  integer(store.balanceMinor);
  distinct(actors, actor => actor.id);
  requireThat(actors.length > 0 && (humanId === null || actors.some(actor => actor.id === humanId)), 'INVALID_CONTROLLER');
  for (const actor of actors) {
    fields(actor, ['id', 'name', 'role', 'balanceMinor'], ['personality', 'completionObservation', 'shopping']);
    id(actor.id, 'actor');
    text(actor.name, 100);
    requireThat(['clerk', 'customer', 'observer'].includes(actor.role), 'INVALID_ROLE');
    integer(actor.balanceMinor);
    if (Object.hasOwn(actor, 'personality')) validatePersonality(actor.personality);
    if (Object.hasOwn(actor, 'completionObservation')) {
      requireThat(['immediate', 'delayed'].includes(actor.completionObservation), 'INVALID_GRANT');
    }
  }
  for (const actor of actors) {
    if (!Object.hasOwn(actor, 'shopping')) continue;
    requireThat(actor.role === 'customer', 'INVALID_SHOPPING_PROFILE');
    const { shopping } = actor;
    fields(shopping, ['clerkId', 'wants']);
    requireThat(actors.some(entry => entry.role === 'clerk' && entry.id === shopping.clerkId), 'INVALID_SHOPPING_PROFILE');
    distinct(shopping.wants, want => want.kind);
    for (const want of shopping.wants) {
      fields(want, ['kind', 'budgetMinor']);
      text(want.kind, 100);
      integer(want.budgetMinor);
    }
  }
  integer(actors.reduce((total, actor) => total + actor.balanceMinor, store.balanceMinor));

  distinct(settings.products, entry => entry.productId);
  for (const product of settings.products) {
    fields(product, ['productId', 'label', 'priceMinor', 'kind']);
    id(product.productId, 'subject');
    text(product.label, 100);
    text(product.kind, 100);
    integer(product.priceMinor);
    requireThat(product.priceMinor > 0, 'INVALID_PRICE');
  }
  distinct(settings.units, entry => entry.id);
  for (const unit of settings.units) {
    fields(unit, ['id', 'productId', 'ownerId', 'holderId']);
    id(unit.id, 'unit');
    requireThat(settings.products.some(product => product.productId === unit.productId), 'INVALID_PRODUCT');
    requireThat(unit.ownerId === store.id || actors.some(actor => actor.id === unit.ownerId), 'INVALID_OWNER');
    requireThat(actors.some(actor => actor.id === unit.holderId), 'INVALID_HOLDER');
  }
  distinct(settings.knowledge, entry => [entry.actorId, entry.unitId].join('/'));
  for (const grant of settings.knowledge) {
    fields(grant, ['actorId', 'unitId'], ['available', 'priceKnown', 'listedPriceMinor']);
    requireThat(settings.units.some(unit => grant.unitId === unit.id) && actors.some(actor => actor.id === grant.actorId), 'INVALID_GRANT');
    requireThat(!Object.hasOwn(grant, 'available') || typeof grant.available === 'boolean', 'INVALID_GRANT');
    requireThat(!Object.hasOwn(grant, 'priceKnown') || typeof grant.priceKnown === 'boolean', 'INVALID_GRANT');
    if (Object.hasOwn(grant, 'listedPriceMinor')) {
      integer(grant.listedPriceMinor);
      requireThat(grant.listedPriceMinor > 0 && grant.priceKnown !== false, 'INVALID_GRANT');
    }
  }
  distinct(settings.relationships, entry => pairKey(entry.actorId, entry.towardId));
  for (const relationship of settings.relationships) {
    fields(relationship, ['actorId', 'towardId', 'warmth', 'trust']);
    requireThat(relationship.actorId !== relationship.towardId &&
      [relationship.actorId, relationship.towardId].every(actorId => actors.some(actor => actor.id === actorId)), 'INVALID_RELATIONSHIP');
    validateJudgment(relationship.warmth);
    validateJudgment(relationship.trust);
  }
  return freeze(settings);
}

export function scenarioPackageRef(settings) {
  const { runId, ...packageSettings } = settings;
  return freeze({
    id: 'package_0001',
    revision: 3,
    digest: createHash('sha256').update(canonicalJson({
      schema: 'lab-headless-generalization@2', packageSettings, authored: { roles, personalities, cues },
    })).digest('hex'),
  });
}

export function nextId(type, count) {
  return type + '_' + (count + 1).toString(16).padStart(4, '0');
}

export function recordEvent(data, type, commandId, details) {
  const event = { id: nextId('event', data.events.length), type, commandId, details: copy(details) };
  data.events.push(event);
  return event;
}

export function observeEvent(data, event, observerId, keys, roots = []) {
  const source = { kind: 'event', id: event.id, sequence: data.events.indexOf(event) + 1, details: event.details };
  const observation = projectObservation(source, {
    id: nextId('observation', data.observations.length),
    observerId,
    channel: event.commandId === null ? 'initial' : 'reading',
    receivedKeys: keys,
    roots: [{ kind: 'event', id: event.id }, ...roots],
  });
  data.observations.push(observation);
  return observation;
}

function pairKey(actorId, towardId) {
  return actorId + '/' + towardId;
}

function validateJudgment(value) {
  requireThat(Number.isInteger(value) && value >= -2 && value <= 2, 'INVALID_JUDGMENT');
}

function initialJudgments(settings) {
  const authored = new Map(settings.relationships.map(entry => [pairKey(entry.actorId, entry.towardId), entry]));
  return settings.actors.flatMap(({ id: actorId }) => settings.actors
    .filter(({ id }) => id !== actorId)
    .map(({ id: towardId }) => {
      const { warmth = 0, trust = 0 } = authored.get(pairKey(actorId, towardId)) ?? {};
      return { actorId, towardId, warmth, trust, causes: [] };
    }));
}

export function initialState(settings) {
  const { actors, humanId, store, units, products: catalog, knowledge, currency } = settings;
  const data = {
    actors: actors.map(({ id, name, role, personality = {}, completionObservation = 'immediate', shopping = null }) => ({
      id, name, role, personality: copy(personality), completionObservation, shopping: copy(shopping), controller: id === humanId ? 'human' : 'rules',
    })),
    ledger: {
      currency,
      accounts: [...actors.map(({ id, balanceMinor }) => ({ id, balanceMinor })), copy(store)],
      units: copy(units),
    },
    catalog: copy(catalog),
    observations: [],
    events: [],
    messages: [],
    proposals: [],
    decisions: [],
    judgments: initialJudgments(settings),
  };
  for (const grant of knowledge) {
    const unit = units.find(entry => entry.id === grant.unitId);
    const { productId, label, priceMinor, kind } = catalog.find(entry => entry.productId === unit.productId);
    const event = recordEvent(data, 'scenario_observation', null, {
      provenance: 'scenario_catalog_listing',
      product: {
        productId, label, kind, unitId: unit.id,
        ...(grant.priceKnown !== false && { priceMinor: grant.listedPriceMinor ?? priceMinor }),
        ...(Object.hasOwn(grant, 'available') && { available: grant.available }),
      },
    });
    observeEvent(data, event, grant.actorId, ['provenance', 'product']);
  }
  return data;
}

function knownReferences(observations) {
  const references = new Map();
  for (const observation of observations) {
    const received = observation.receivedDetails;
    const expression = received.communication?.expression;
    if (received.product) {
      const product = received.product;
      references.set(product.unitId, { ...product, observationId: observation.id });
    } else if (expression?.function === 'OFFER') {
      const { productId, unitId } = exchangeTerms(expression);
      if (!references.has(unitId)) references.set(unitId, { productId, unitId, observationId: observation.id });
    } else if (expression?.body.act === 'Tell') {
      const { fact, missing } = expression.body;
      const known = references.get(fact.unitId);
      if (known?.productId === fact.productId) {
        const learned = missing === 'list_price'
          ? { priceMinor: fact.value, priceObservationId: observation.id }
          : { available: fact.value, availabilityObservationId: observation.id };
        references.set(fact.unitId, { ...known, ...learned });
      }
    } else if (received.transaction?.kind === 'handover') {
      const { unitId } = received.transaction;
      const known = references.get(unitId);
      if (known) references.set(unitId, { ...known, available: false, availabilityObservationId: observation.id });
    }
  }
  return [...references.values()];
}

export function actorView(data, actorId) {
  const actor = data.actors.find(candidate => candidate.id === actorId);
  requireThat(actor, 'UNKNOWN_ACTOR');
  const observations = recipientHistory(data.observations, actorId);
  const messages = data.messages
    .filter(message => message.expression.speaker === actorId)
    .map(message => ({ id: message.id, outward: outwardCommunication(message) }));
  const proposals = data.proposals
    .filter(proposal => proposal.participants.includes(actorId))
    .map(({ id, version, status, offerMessageId, handoverEventId }) => ({
      id, version, offerMessageId,
      status: status === 'fulfilled' && !observations.some(entry => entry.source.kind === 'event' && entry.source.id === handoverEventId)
        ? 'paid'
        : status,
    }));
  const ownAccount = data.ledger.accounts.find(account => account.id === actorId);

  return freeze(copy({
    actor: { id: actor.id, name: actor.name, role: actor.role, controller: actor.controller },
    account: { kind: 'personal_cash', currency: data.ledger.currency, balanceMinor: ownAccount.balanceMinor },
    references: knownReferences(observations),
    observations,
    messages,
    proposals,
    ...(actor.shopping && { shopping: actor.shopping }),
  }));
}

export function recordWarmth(data, observation, towardId, kind, causeId, delta, reason) {
  requireThat(data.observations.includes(observation), 'NO_RECEIVING_PATH');
  const judgment = data.judgments.find(entry => entry.actorId === observation.observerId && entry.towardId === towardId);
  requireThat(judgment, 'INVALID_RELATIONSHIP');
  if (judgment.causes.some(entry => entry.judgment === 'warmth' && entry.kind === kind && entry.causeId === causeId)) return;
  const before = judgment.warmth;
  const after = Math.max(-2, Math.min(2, before + delta));
  judgment.warmth = after;
  judgment.causes.push({
    judgment: 'warmth', kind, causeId, source: copy(observation.source), observationId: observation.id,
    reason, requestedDelta: delta, appliedDelta: after - before, before, after,
  });
}

export function validateState(data, settings) {
  const initialBalances = [...settings.actors, settings.store];
  requireThat(data.ledger.currency === settings.currency, 'INVALID_CURRENCY');
  requireThat(data.ledger.accounts.length === initialBalances.length, 'INVALID_ACCOUNTS');
  for (const [index, account] of data.ledger.accounts.entries()) {
    requireThat(initialBalances[index].id === account.id, 'INVALID_ACCOUNT');
    integer(account.balanceMinor);
  }
  const total = accounts => accounts.reduce((sum, account) => sum + account.balanceMinor, 0);
  requireThat(total(data.ledger.accounts) === total(initialBalances), 'NONCONSERVING_PAYMENT');
  requireThat(data.ledger.units.length === settings.units.length, 'INVALID_UNITS');
  for (const [index, unit] of data.ledger.units.entries()) {
    requireThat(unit.id === settings.units[index].id && unit.productId === settings.units[index].productId, 'INVALID_UNIT');
    requireThat(unit.ownerId === settings.store.id || data.actors.some(actor => actor.id === unit.ownerId), 'INVALID_OWNER');
    requireThat(data.actors.some(actor => actor.id === unit.holderId), 'INVALID_HOLDER');
  }
  requireThat(data.judgments.length === data.actors.length * (data.actors.length - 1), 'INVALID_RELATIONSHIP');
  distinct(data.judgments, entry => pairKey(entry.actorId, entry.towardId));
  for (const judgment of data.judgments) {
    validateJudgment(judgment.warmth);
    validateJudgment(judgment.trust);
    distinct(judgment.causes, cause => [cause.judgment, cause.kind, cause.causeId].join('/'));
    for (const cause of judgment.causes) {
      const observed = data.observations.find(entry => entry.id === cause.observationId && entry.observerId === judgment.actorId);
      requireThat(observed && canonicalJson(observed.source) === canonicalJson(cause.source), 'NO_RECEIVING_PATH');
    }
  }
  return true;
}
