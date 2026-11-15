import { createHash } from 'node:crypto';
import products from '../content/products.json' with { type: 'json' };
import { canonicalJson, copy, fields, freeze, id, integer, requireThat } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';
import { projectObservation, recipientHistory } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/views.mjs';

export const BUYER_ID = 'actor_0001';
export const CLERK_ID = 'actor_0002';
export const STORE_ID = 'store_0001';

export const PRODUCT_ID = products.offerable.productId;
export const UNKNOWN_PRODUCT_ID = products.unobserved.productId;
export const UNIT_ID = products.offerable.unitId;
export const PRICE_MINOR = products.offerable.priceMinor;

export const PACKAGE_REF = freeze({
  id: 'package_0001',
  revision: 1,
  digest: createHash('sha256').update(canonicalJson({
    schema: 'lab-headless-purchase@1',
    products,
  })).digest('hex'),
});

const defaults = freeze({
  runId: 'run_0001',
  humanId: BUYER_ID,
  buyerCashMinor: 1000,
  tillMinor: 0,
  stock: 1,
  failFirstHandover: false,
  clerkStockObservation: null,
});

export function configureScenario(options = {}) {
  fields(options, [], Object.keys(defaults));
  const configured = { ...defaults, ...copy(options) };
  id(configured.runId, 'run');
  requireThat([BUYER_ID, CLERK_ID].includes(configured.humanId), 'INVALID_CONTROLLER');
  integer(configured.buyerCashMinor);
  integer(configured.tillMinor);
  integer(configured.buyerCashMinor + configured.tillMinor);
  requireThat([0, 1].includes(configured.stock), 'INVALID_STOCK');
  requireThat(typeof configured.failFirstHandover === 'boolean');
  requireThat(configured.clerkStockObservation === null || typeof configured.clerkStockObservation === 'boolean');
  return freeze(configured);
}

export function nextId(type, count) {
  return `${type}_${(count + 1).toString(16).padStart(4, '0')}`;
}

export function recordEvent(data, type, commandId, details) {
  const entry = { id: nextId('event', data.events.length), type, commandId, details: copy(details) };
  data.events.push(entry);
  return entry;
}

export function observeEvent(data, event, observerId, keys, roots = []) {
  const source = { kind: 'event', id: event.id, sequence: data.events.indexOf(event) + 1, details: event.details };
  const grant = {
    id: nextId('observation', data.observations.length),
    observerId,
    channel: event.commandId === null ? 'initial' : 'reading',
    receivedKeys: keys,
    roots: [{ kind: 'event', id: event.id }, ...roots],
  };
  const observation = projectObservation(source, grant);
  data.observations.push(observation);
  return observation;
}

export function initialState(settings) {
  const data = {
    actors: [
      { id: BUYER_ID, name: 'Customer', role: 'customer', controller: settings.humanId === BUYER_ID ? 'human' : 'rules' },
      { id: CLERK_ID, name: 'Clerk', role: 'clerk', controller: settings.humanId === CLERK_ID ? 'human' : 'rules' },
    ],
    ledger: {
      buyerCashMinor: settings.buyerCashMinor,
      tillMinor: settings.tillMinor,
      stock: settings.stock,
      ownerId: settings.stock ? STORE_ID : null,
      holderId: settings.stock ? CLERK_ID : null,
    },
    // The second catalog entry has no grant to either participant.
    catalog: [copy(products.offerable), copy(products.unobserved)],
    observations: [],
    events: [],
    messages: [],
    proposals: [],
    decisions: [],
    judgments: [{ actorId: CLERK_ID, towardId: BUYER_ID, warmth: 0, causeObservationIds: [] }],
  };
  const catalogObservation = recordEvent(data, 'scenario_observation', null, {
    provenance: 'scenario_catalog_listing',
    product: products.offerable,
    clerkStock: settings.clerkStockObservation ?? Boolean(settings.stock),
  });
  observeEvent(data, catalogObservation, BUYER_ID, ['provenance', 'product']);
  observeEvent(data, catalogObservation, CLERK_ID, ['provenance', 'product', 'clerkStock']);
  return data;
}

export function actorView(data, actorId) {
  const actor = data.actors.find(candidate => candidate.id === actorId);
  requireThat(actor, 'UNKNOWN_ACTOR');
  const observations = recipientHistory(data.observations, actorId);
  const references = observations
    .filter(entry => Object.hasOwn(entry.receivedDetails, 'product'))
    .map(entry => ({
      ...entry.receivedDetails.product,
      observationId: entry.id,
      ...Object.hasOwn(entry.receivedDetails, 'clerkStock') && { available: entry.receivedDetails.clerkStock },
    }));
  const messages = data.messages
    .filter(message => message.outward.senderId === actorId)
    .map(({ id: messageId, outward }) => ({ id: messageId, outward }));
  const proposals = data.proposals.filter(proposal => [proposal.buyerId, proposal.sellerId].includes(actorId));

  return freeze(copy({
    actor,
    account: actorId === BUYER_ID
      ? { kind: 'personal_cash', balanceMinor: data.ledger.buyerCashMinor }
      : { kind: 'store_till', balanceMinor: data.ledger.tillMinor },
    references,
    observations,
    messages,
    proposals,
  }));
}

export function validateLedger(data, settings) {
  const { buyerCashMinor, tillMinor, stock, ownerId, holderId } = data.ledger;
  integer(buyerCashMinor);
  integer(tillMinor);
  requireThat(buyerCashMinor + tillMinor === settings.buyerCashMinor + settings.tillMinor);
  requireThat([0, 1].includes(stock));
  if (stock === 1) {
    requireThat(ownerId === STORE_ID && holderId === CLERK_ID);
  } else if (settings.stock === 1) {
    requireThat(ownerId === BUYER_ID && holderId === BUYER_ID);
  } else {
    requireThat(ownerId === null && holderId === null);
  }
  return true;
}
