import { canonicalJson, ContractError, copy, fields, freeze, id, isRecord, requireThat } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';
import { createRun, executeCommand, validateRun } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/runtime.mjs';
import {
  compileAcceptance, compileOffer, exchangeTerms, expressionReference, observePurchaseMessage,
} from '../communication/purchase-meaning.mjs';
import { chooseClerkResponse, CLERK_PROFILE } from '../decisions/clerk.mjs';
import {
  actorView, configureScenario, initialState, nextId, observeEvent, recordEvent, scenarioPackageRef, validateLedger,
} from './scenario.mjs';

export { BUYER_ID, CLERK_ID, PRICE_MINOR, PRODUCT_ID, STORE_ID, UNIT_ID, UNKNOWN_PRODUCT_ID } from './scenario.mjs';

const SAVE_SCHEMA = 'lab-headless-generalization-save@1';
const EXPRESSION_SCHEMA = 'kw-expression@1';
const actions = freeze({
  offer: 'send_message',
  accept: 'send_message',
  respond: 'send_message',
  pay: 'perform_action',
  handover: 'perform_action',
});

const safeRuleErrors = new Set([
  'AMBIGUOUS_ASSENT', 'STALE_PROPOSAL', 'WRONG_ACTOR', 'WRONG_CONTROLLER', 'WRONG_RECIPIENT',
  'UNKNOWN_REFERENCE', 'UNSUPPORTED_TERMS', 'UNAVAILABLE_EXPRESSION', 'NO_RECEIVING_PATH',
  'OFFER_CLOSED', 'ACCEPTANCE_INELIGIBLE', 'RESPONSE_NOT_ACCEPTED', 'INVALID_TERMS',
  'INSUFFICIENT_FUNDS', 'OUT_OF_STOCK', 'PAYMENT_REQUIRED', 'ALREADY_PAID', 'ALREADY_FULFILLED',
]);

function currentProposal(data, reference, actorId) {
  requireThat(isRecord(reference) && Object.hasOwn(reference, 'id') &&
    Object.hasOwn(reference, 'version') && Object.keys(reference).length === 2, 'AMBIGUOUS_ASSENT');
  const latest = data.proposals.findLast(proposal => proposal.id === reference.id &&
    (actorId === undefined || proposal.participants.includes(actorId)));
  requireThat(latest?.version === reference.version, 'STALE_PROPOSAL');
  return latest;
}

function offerRecord(data, proposal) {
  const offer = data.messages.find(message => message.id === proposal.offerMessageId);
  requireThat(offer, 'STALE_PROPOSAL');
  return offer;
}

function messageFields(data, command) {
  return {
    scope: { producer: 'first-encounter-lab', runId: command.sessionId, packageRef: command.packageRef },
    sequence: data.messages.length + 1,
    id: nextId('message', data.messages.length),
  };
}

function receiveMessage(data, message) {
  const observation = observePurchaseMessage(message, {
    observationId: nextId('observation', data.observations.length),
    observerId: message.expression.addressees[0],
  });
  data.messages.push(message);
  data.observations.push(observation);
  return observation;
}

function messageResult(event, proposal, message, observation) {
  return {
    type: event.type, eventId: event.id, proposalId: proposal.id, version: proposal.version,
    messageId: message.id, observationId: observation.id,
  };
}

function makeOffer(data, command, settings) {
  const { payload } = command;
  fields(payload, ['action', 'actorId', 'recipientId', 'productId', 'amountMinor', 'vibe', 'salience'], ['unitId', 'supersedes']);
  const sender = data.actors.find(actor => actor.id === payload.actorId);
  const receiver = data.actors.find(actor => actor.id === payload.recipientId);
  requireThat(sender && ['clerk', 'customer'].includes(sender.role), 'WRONG_ACTOR');
  const expected = sender.role === 'clerk' ? 'customer' : 'clerk';
  requireThat(receiver?.role === expected, 'WRONG_RECIPIENT');
  const known = actorView(data, sender.id).references.find(item =>
    item.productId === payload.productId && (payload.unitId === undefined || item.unitId === payload.unitId));
  requireThat(known, 'UNKNOWN_REFERENCE');
  let prior = null;
  if (payload.supersedes !== undefined) {
    prior = currentProposal(data, payload.supersedes, sender.id);
    requireThat(prior.status === 'open', 'OFFER_CLOSED');
    const previous = offerRecord(data, prior);
    requireThat(previous.expression.speaker === sender.id && previous.expression.addressees[0] === receiver.id, 'WRONG_RECIPIENT');
  }
  const proposal = {
    id: prior?.id ?? nextId('proposal', data.proposals.length),
    version: prior ? prior.version + 1 : 1,
    participants: [sender.id, receiver.id],
    status: 'open',
  };
  const buyerId = sender.role === 'customer' ? sender.id : receiver.id;
  const sellerId = sender.role === 'clerk' ? sender.id : receiver.id;
  const message = compileOffer({
    ...messageFields(data, command),
    speaker: sender.id,
    recipient: receiver.id,
    proposal: {
      id: proposal.id,
      version: proposal.version,
      parent: prior ? expressionReference(offerRecord(data, prior).expression) : null,
    },
    terms: {
      buyerId, sellerId, productId: known.productId, unitId: known.unitId, storeId: settings.store.id,
      currency: settings.currency, amountMinor: payload.amountMinor,
    },
    delivery: { vibe: payload.vibe, salience: payload.salience },
    label: known.label ?? 'the item',
  });
  const observation = receiveMessage(data, message);
  proposal.offerMessageId = message.id;
  if (prior) prior.status = 'superseded';
  data.proposals.push(proposal);
  const event = recordEvent(data, 'offer', command.id, { proposalId: proposal.id, version: proposal.version, messageId: message.id });
  return messageResult(event, proposal, message, observation);
}

function responseContext(data, proposal, actorId) {
  requireThat(proposal.status === 'open', 'STALE_PROPOSAL');
  const local = actorView(data, actorId);
  const offer = offerRecord(data, proposal);
  requireThat(offer.expression.addressees[0] === actorId, 'WRONG_RECIPIENT');
  const receipt = local.observations.find(entry => entry.source.kind === 'message' && entry.source.id === offer.id);
  requireThat(receipt, 'NO_RECEIVING_PATH');
  const { expression, framing, prominence } = receipt.receivedDetails.communication;
  const { productId, unitId, amountMinor } = exchangeTerms(expression);
  const product = local.references.find(entry => entry.unitId === unitId);
  const input = {
    actorId, role: local.actor.role, profile: CLERK_PROFILE,
    offer: { proposalId: proposal.id, version: proposal.version, productId, amountMinor, observationId: receipt.id, cues: framing, prominence },
    product,
  };
  const decision = local.actor.role === 'clerk' ? chooseClerkResponse(input) : {
    actorId, proposalId: proposal.id, version: proposal.version,
    selected: product.available === false ? 'Refuse' : 'Accept',
    candidates: [{ act: 'Accept', eligible: product.available !== false }],
  };
  return { actor: local.actor, decision, offer, receipt };
}

function acceptOffer(data, command) {
  const { payload } = command;
  fields(payload, ['action', 'actorId'], ['reference']);
  const proposal = currentProposal(data, payload.reference, payload.actorId);
  const { actor, decision, offer, receipt } = responseContext(data, proposal, payload.actorId);
  requireThat(actor.controller === (payload.action === 'respond' ? 'rules' : 'human'), 'WRONG_CONTROLLER');
  if (payload.action === 'respond') requireThat(decision.selected === 'Accept', 'RESPONSE_NOT_ACCEPTED');
  requireThat(decision.candidates.some(candidate => candidate.act === 'Accept' && candidate.eligible), 'ACCEPTANCE_INELIGIBLE');
  const message = compileAcceptance({
    ...messageFields(data, command),
    speaker: actor.id,
    recipient: offer.expression.speaker,
    offer,
    receipt,
    reference: payload.reference,
    delivery: { vibe: 'EA', salience: 'NUANCED' },
  });
  const observation = receiveMessage(data, message);
  const event = recordEvent(data, 'agreement', command.id, {
    proposalId: proposal.id, version: proposal.version,
    assent: [
      { actorId: offer.expression.speaker, messageId: offer.id },
      { actorId: actor.id, messageId: message.id },
    ],
  });
  proposal.status = 'agreed';
  proposal.agreementEventId = event.id;
  data.decisions.push({ causeMessageId: offer.id, responseMessageId: message.id, mode: actor.controller, decision });
  return messageResult(event, proposal, message, observation);
}

function settlementContext(data, payload, performer) {
  fields(payload, ['action', 'actorId', 'reference']);
  const proposal = currentProposal(data, payload.reference, payload.actorId);
  const terms = exchangeTerms(offerRecord(data, proposal).expression);
  requireThat(payload.actorId === terms[performer], 'WRONG_ACTOR');
  const unit = data.ledger.units.find(entry => entry.id === terms.unitId);
  return { proposal, terms, unit };
}

function requireStock(data, proposal, terms, unit) {
  requireThat(unit?.productId === terms.productId && unit.ownerId === terms.storeId && unit.holderId === terms.sellerId, 'OUT_OF_STOCK');
  const claimed = data.proposals.some(candidate => candidate !== proposal && candidate.status === 'paid' &&
    exchangeTerms(offerRecord(data, candidate).expression).unitId === terms.unitId);
  requireThat(!claimed, 'OUT_OF_STOCK');
}

function observeTransaction(data, event, parties, priorEventId) {
  const roots = [{ kind: 'event', id: priorEventId }];
  return parties.map(actorId => observeEvent(data, event, actorId, ['transaction'], roots).id);
}

function pay(data, command) {
  const { proposal, terms, unit } = settlementContext(data, command.payload, 'buyerId');
  requireThat(!['paid', 'fulfilled'].includes(proposal.status), 'ALREADY_PAID');
  requireThat(proposal.status === 'agreed', 'STALE_PROPOSAL');
  requireStock(data, proposal, terms, unit);
  const source = data.ledger.accounts.find(account => account.id === terms.buyerId);
  const till = data.ledger.accounts.find(account => account.id === terms.storeId);
  requireThat(source.balanceMinor >= terms.amountMinor, 'INSUFFICIENT_FUNDS');
  source.balanceMinor -= terms.amountMinor;
  till.balanceMinor += terms.amountMinor;
  const transaction = {
    kind: 'payment', proposalId: proposal.id, version: proposal.version, amountMinor: terms.amountMinor,
    buyerId: terms.buyerId, storeId: terms.storeId, currency: terms.currency, agreementEventId: proposal.agreementEventId,
  };
  const event = recordEvent(data, 'payment', command.id, { transaction });
  proposal.status = 'paid';
  proposal.paymentEventId = event.id;
  const observationIds = observeTransaction(data, event, proposal.participants, proposal.agreementEventId);
  return { type: event.type, eventId: event.id, proposalId: proposal.id, version: proposal.version, observationIds };
}

function handover(data, command, settings) {
  const { proposal, terms, unit } = settlementContext(data, command.payload, 'sellerId');
  requireThat(proposal.status !== 'fulfilled', 'ALREADY_FULFILLED');
  requireThat(proposal.status === 'paid', 'PAYMENT_REQUIRED');
  requireStock(data, proposal, terms, unit);
  const transaction = {
    proposalId: proposal.id, version: proposal.version, unitId: unit.id,
    paymentEventId: proposal.paymentEventId,
  };
  if (settings.failFirstHandover && !data.events.some(entry => entry.type === 'handover_failed')) {
    const reason = 'INJECTED_HANDOVER_FAILURE';
    const event = recordEvent(data, 'handover_failed', command.id, { transaction: { ...transaction, kind: 'handover_failed', reason } });
    const observationIds = observeTransaction(data, event, proposal.participants, proposal.paymentEventId);
    return { type: event.type, eventId: event.id, ...transaction, reason, observationIds };
  }

  unit.ownerId = terms.buyerId;
  unit.holderId = terms.buyerId;
  const event = recordEvent(data, 'handover', command.id, {
    transaction: { ...transaction, kind: 'handover', buyerId: terms.buyerId, storeId: terms.storeId },
  });
  proposal.status = 'fulfilled';
  proposal.handoverEventId = event.id;
  const observationIds = observeTransaction(data, event, proposal.participants, proposal.paymentEventId);
  return { type: event.type, eventId: event.id, ...transaction, observationIds };
}

const dispatch = { offer: makeOffer, accept: acceptOffer, respond: acceptOffer, pay, handover };

function start(settings) {
  return createRun({ id: settings.runId, packageRef: scenarioPackageRef(settings), data: initialState(settings) });
}

function submitToRun(run, command, settings) {
  let domainCode;
  const result = executeCommand(run, command, {
    validateNew(_data, submitted) {
      const { action } = submitted.payload;
      return Object.hasOwn(actions, action) && actions[action] === submitted.kind;
    },
    resolve(data, submitted) {
      try {
        return dispatch[submitted.payload.action](data, submitted, settings);
      } catch (error) {
        if (error instanceof ContractError && safeRuleErrors.has(error.code)) domainCode = error.code;
        throw error;
      }
    },
    validateStaged(data) {
      return validateLedger(data, settings);
    },
  });
  return result.status === 'rejected' ? { ...result, code: domainCode ?? result.code } : result;
}

function replay(text) {
  requireThat(typeof text === 'string' && text.length <= 1024 * 1024, 'INVALID_SAVE');
  let saved;
  try {
    saved = JSON.parse(text);
  } catch {
    throw new ContractError('INVALID_SAVE');
  }
  if (saved?.schema === 'lab-headless-purchase-save@1') {
    const error = new ContractError('INCOMPATIBLE_SAVE_VERSION');
    error.message = 'Replay this save with the historical v0.1 runner at commit 9088cd2fd9bf162319e745853930f8ea2cc40375.';
    throw error;
  }
  fields(saved, ['schema', 'expressionSchema', 'scenario', 'run']);
  requireThat(saved.schema === SAVE_SCHEMA && saved.expressionSchema === EXPRESSION_SCHEMA, 'INCOMPATIBLE_SAVE_VERSION');
  const settings = configureScenario(saved.scenario);
  validateRun(saved.run);
  let rebuilt = start(settings);
  for (const entry of saved.run.journal) {
    const outcome = submitToRun(rebuilt, entry.command, settings);
    requireThat(outcome.status === 'committed' && canonicalJson(outcome.receipt) === canonicalJson(entry.receipt), 'INVALID_SAVE');
    rebuilt = outcome.run;
  }
  requireThat(canonicalJson(rebuilt) === canonicalJson(saved.run), 'INVALID_SAVE');
  return { settings, run: rebuilt };
}

/** The host owns this session. Only give actors a handle from forActor(). */
export function createPurchase(options = {}) {
  let settings = configureScenario(options);
  let run = start(settings);
  let generation = 0;

  function command(commandId, action, args) {
    id(commandId, 'command');
    requireThat(Object.hasOwn(actions, action), 'UNSUPPORTED_COMMAND');
    return freeze(copy({
      schema: 'encounter-command@2',
      id: commandId,
      sessionId: run.id,
      packageRef: run.packageRef,
      expectedRevision: run.revision,
      kind: actions[action],
      payload: { ...copy(args), action },
    }));
  }

  function submit(submitted) {
    const outcome = submitToRun(run, submitted, settings);
    run = outcome.run;
    if (outcome.status === 'rejected') return { status: 'rejected', code: outcome.code };
    return { status: outcome.status, receipt: outcome.receipt };
  }

  function decide(reference, actorId) {
    const proposal = currentProposal(run.data, reference, actorId);
    return responseContext(run.data, proposal, actorId ?? offerRecord(run.data, proposal).expression.addressees[0]).decision;
  }

  return Object.freeze({
    command,
    submit,
    forActor(actorId) {
      const assignedGeneration = generation;
      actorView(run.data, actorId);
      function current() {
        requireThat(generation === assignedGeneration, 'STALE_ACTOR_VIEW');
      }
      return Object.freeze({
        view() {
          current();
          return actorView(run.data, actorId);
        },
        menu(reference) {
          current();
          return freeze(decide(reference, actorId).candidates.filter(candidate => candidate.eligible).map(candidate => candidate.act));
        },
        submit(commandId, action, args) {
          current();
          return submit(command(commandId, action, { ...copy(args), actorId }));
        },
      });
    },
    view(actorId) {
      return actorView(run.data, actorId);
    },
    decide,
    inspect() {
      return run;
    },
    save() {
      return canonicalJson({ schema: SAVE_SCHEMA, expressionSchema: EXPRESSION_SCHEMA, scenario: settings, run });
    },
    restore(text) {
      const validated = replay(text);
      settings = validated.settings;
      run = validated.run;
      generation++;
    },
  });
}
