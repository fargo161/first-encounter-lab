import { canonicalJson, ContractError, copy, fields, freeze, id, isRecord, requireThat } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';
import { createRun, executeCommand, validateRun } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/runtime.mjs';
import { compileAcceptance, compileOffer, observePurchaseMessage } from '../communication/purchase-meaning.mjs';
import { chooseClerkResponse, CLERK_PROFILE } from '../decisions/clerk.mjs';
import {
  actorView, BUYER_ID, CLERK_ID, configureScenario, initialState, nextId,
  observeEvent, PACKAGE_REF, PRICE_MINOR, PRODUCT_ID, recordEvent, STORE_ID, validateLedger,
} from './scenario.mjs';

export { BUYER_ID, CLERK_ID, PRICE_MINOR, PRODUCT_ID, UNKNOWN_PRODUCT_ID } from './scenario.mjs';

const SAVE_SCHEMA = 'lab-headless-purchase-save@1';
const PROPOSAL_ID = 'proposal_0001';
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
  'OFFER_CLOSED', 'ACCEPTANCE_INELIGIBLE', 'RESPONSE_NOT_ACCEPTED',
  'INSUFFICIENT_FUNDS', 'OUT_OF_STOCK', 'PAYMENT_REQUIRED', 'ALREADY_PAID', 'ALREADY_FULFILLED',
]);

function currentProposal(data, reference) {
  requireThat(isRecord(reference) && Object.hasOwn(reference, 'id') &&
    Object.hasOwn(reference, 'version') && Object.keys(reference).length === 2, 'AMBIGUOUS_ASSENT');
  const proposal = data.proposals.at(-1);
  requireThat(proposal?.id === reference.id && proposal.version === reference.version, 'STALE_PROPOSAL');
  return proposal;
}

function receiveMessage(data, message, observerId) {
  const observation = observePurchaseMessage(message, {
    observationId: nextId('observation', data.observations.length),
    observerId,
  });
  data.messages.push(message);
  data.observations.push(observation);
  return observation;
}

function clerkInputs(data, proposal) {
  const clerk = actorView(data, CLERK_ID);
  const offerObservation = clerk.observations.find(entry => entry.source.kind === 'message' &&
    entry.source.id === proposal.offerMessageId);
  requireThat(offerObservation, 'NO_RECEIVING_PATH');
  const outward = offerObservation.receivedDetails.communication;
  const [payment, handover] = outward.terms.exchange;
  const product = clerk.references.find(entry => entry.productId === handover.productId);
  const judgment = data.judgments.find(entry => entry.actorId === CLERK_ID && entry.towardId === outward.senderId);
  return {
    offerObservation,
    view: freeze(copy({
      actorId: CLERK_ID,
      role: clerk.actor.role,
      profile: CLERK_PROFILE,
      warmth: judgment?.warmth ?? 0,
      offer: {
        proposalId: outward.terms.proposalId,
        version: outward.terms.version,
        productId: handover.productId,
        amountMinor: payment.amountMinor,
        observationId: offerObservation.id,
        cues: outward.framing,
        prominence: outward.prominence,
      },
      product: product ? {
        productId: product.productId,
        priceMinor: product.priceMinor,
        available: product.available ?? null,
        observationId: product.observationId,
      } : null,
    })),
  };
}

function makeOffer(data, command) {
  const { payload } = command;
  fields(payload, ['action', 'actorId', 'recipientId', 'productId', 'amountMinor', 'vibe', 'salience']);
  requireThat(payload.actorId === BUYER_ID, 'WRONG_ACTOR');
  requireThat(payload.recipientId === CLERK_ID, 'WRONG_RECIPIENT');

  const last = data.proposals.at(-1);
  requireThat(!last || last.status === 'open', 'OFFER_CLOSED');
  const version = last ? last.version + 1 : 1;
  const draft = {
    productId: payload.productId,
    amountMinor: payload.amountMinor,
    vibe: payload.vibe,
    salience: payload.salience,
  };
  const message = compileOffer({
    commandId: command.id,
    sequence: data.messages.length + 1,
    buyerId: BUYER_ID,
    sellerId: CLERK_ID,
    proposalId: PROPOSAL_ID,
    version,
    draft,
    references: actorView(data, BUYER_ID).references.map(({ productId, unitId, label, priceMinor }) => ({
      productId, unitId, label, priceMinor,
    })),
  });
  const observation = receiveMessage(data, message, CLERK_ID);
  const [payment, handover] = message.outward.terms.exchange;
  const proposal = {
    id: PROPOSAL_ID, version, buyerId: BUYER_ID, sellerId: CLERK_ID,
    productId: handover.productId, unitId: handover.unitId, amountMinor: payment.amountMinor,
    offerMessageId: message.id, status: 'open',
  };
  if (last) last.status = 'superseded';
  data.proposals.push(proposal);
  const event = recordEvent(data, 'offer', command.id, { proposalId: proposal.id, version, messageId: message.id });
  return { type: event.type, eventId: event.id, proposalId: proposal.id, version, messageId: message.id, observationId: observation.id };
}

function acceptOffer(data, command) {
  const { payload } = command;
  fields(payload, ['action', 'actorId'], ['reference']);
  requireThat(payload.actorId === CLERK_ID, 'WRONG_ACTOR');
  const clerk = data.actors.find(actor => actor.id === CLERK_ID);
  requireThat(clerk.controller === (payload.action === 'respond' ? 'rules' : 'human'), 'WRONG_CONTROLLER');
  const proposal = currentProposal(data, payload.reference);
  requireThat(proposal.status === 'open', 'STALE_PROPOSAL');

  const { offerObservation, view } = clerkInputs(data, proposal);
  const decision = chooseClerkResponse(view);
  if (payload.action === 'respond') requireThat(decision.selected === 'Accept', 'RESPONSE_NOT_ACCEPTED');
  requireThat(decision.candidates.some(candidate => candidate.act === 'Accept' && candidate.eligible), 'ACCEPTANCE_INELIGIBLE');

  const message = compileAcceptance({
    commandId: command.id,
    sequence: data.messages.length + 1,
    sellerId: CLERK_ID,
    proposal,
    reference: payload.reference,
    offerObservation,
  });
  const observation = receiveMessage(data, message, BUYER_ID);
  proposal.status = 'agreed';
  proposal.acceptanceMessageId = message.id;
  data.decisions.push({
    causeMessageId: proposal.offerMessageId,
    responseMessageId: message.id,
    mode: clerk.controller,
    decision,
  });
  const event = recordEvent(data, 'agreement', command.id, {
    proposalId: proposal.id, version: proposal.version, offerMessageId: proposal.offerMessageId, acceptanceMessageId: message.id,
  });
  proposal.agreementEventId = event.id;
  return { type: event.type, eventId: event.id, proposalId: proposal.id, version: proposal.version, messageId: message.id, observationId: observation.id };
}

function requireStock(ledger) {
  requireThat(ledger.stock === 1 && ledger.ownerId === STORE_ID && ledger.holderId === CLERK_ID, 'OUT_OF_STOCK');
}

function observeTransaction(data, event, priorEventIds = []) {
  const roots = priorEventIds.map(eventId => ({ kind: 'event', id: eventId }));
  return [BUYER_ID, CLERK_ID].map(actorId => observeEvent(data, event, actorId, ['transaction'], roots));
}

function pay(data, command) {
  const { payload } = command;
  fields(payload, ['action', 'actorId', 'reference']);
  requireThat(payload.actorId === BUYER_ID, 'WRONG_ACTOR');
  const proposal = currentProposal(data, payload.reference);
  requireThat(!['paid', 'fulfilled'].includes(proposal.status), 'ALREADY_PAID');
  requireThat(proposal.status === 'agreed', 'STALE_PROPOSAL');

  // Execution sees the authoritative ledger; the rule evaluation sees only receipts.
  requireStock(data.ledger);
  requireThat(data.ledger.buyerCashMinor >= proposal.amountMinor, 'INSUFFICIENT_FUNDS');
  data.ledger.buyerCashMinor -= proposal.amountMinor;
  data.ledger.tillMinor += proposal.amountMinor;
  const event = recordEvent(data, 'payment', command.id, { transaction: {
    kind: 'payment', proposalId: proposal.id, version: proposal.version, amountMinor: proposal.amountMinor,
    buyerId: BUYER_ID, storeId: STORE_ID, agreementEventId: proposal.agreementEventId,
  } });
  proposal.status = 'paid';
  proposal.paymentEventId = event.id;
  const observations = observeTransaction(data, event, [proposal.agreementEventId]);
  return { type: event.type, eventId: event.id, proposalId: proposal.id, version: proposal.version, observationIds: observations.map(entry => entry.id) };
}

function handover(data, command, settings) {
  const { payload } = command;
  fields(payload, ['action', 'actorId', 'reference']);
  requireThat(payload.actorId === CLERK_ID, 'WRONG_ACTOR');
  const proposal = currentProposal(data, payload.reference);
  requireThat(proposal.status !== 'fulfilled', 'ALREADY_FULFILLED');
  requireThat(proposal.status === 'paid', 'PAYMENT_REQUIRED');
  requireStock(data.ledger);

  const terms = {
    proposalId: proposal.id, version: proposal.version, unitId: proposal.unitId,
    paymentEventId: proposal.paymentEventId,
  };
  if (settings.failFirstHandover && !data.events.some(entry => entry.type === 'handover_failed')) {
    const reason = 'INJECTED_HANDOVER_FAILURE';
    const event = recordEvent(data, 'handover_failed', command.id, { transaction: { kind: 'handover_failed', ...terms, reason } });
    const observations = observeTransaction(data, event, [proposal.paymentEventId]);
    return { type: event.type, eventId: event.id, ...terms, reason, observationIds: observations.map(entry => entry.id) };
  }

  data.ledger.stock -= 1;
  data.ledger.ownerId = BUYER_ID;
  data.ledger.holderId = BUYER_ID;
  const event = recordEvent(data, 'handover', command.id, { transaction: {
    kind: 'handover', ...terms, buyerId: BUYER_ID, storeId: STORE_ID,
  } });
  proposal.status = 'fulfilled';
  proposal.handoverEventId = event.id;
  const observations = observeTransaction(data, event, [proposal.paymentEventId]);
  const clerkReceipt = observations.find(entry => entry.observerId === CLERK_ID);
  const judgment = data.judgments.find(entry => entry.actorId === CLERK_ID && entry.towardId === BUYER_ID);
  // The paid-to-fulfilled transition admits the cause once. The input is the clerk's actual scoped receipt.
  judgment.warmth += 1;
  judgment.causeObservationIds.push(clerkReceipt.id);
  return { type: event.type, eventId: event.id, ...terms, observationIds: observations.map(entry => entry.id) };
}

const dispatch = { offer: makeOffer, accept: acceptOffer, respond: acceptOffer, pay, handover };

function start(settings) {
  return createRun({ id: settings.runId, packageRef: PACKAGE_REF, data: initialState(settings) });
}

function submitToRun(run, command, settings) {
  let domainCode;
  const result = executeCommand(run, command, {
    validateNew(_data, submitted) {
      return Object.hasOwn(actions, submitted.payload.action) && actions[submitted.payload.action] === submitted.kind;
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
  if (result.status !== 'rejected') return result;
  return { ...result, code: domainCode ?? result.code };
}

function replay(text) {
  requireThat(typeof text === 'string' && text.length <= 1024 * 1024, 'INVALID_SAVE');
  let saved;
  try {
    saved = JSON.parse(text);
  } catch {
    throw new ContractError('INVALID_SAVE');
  }
  fields(saved, ['schema', 'scenario', 'run']);
  requireThat(saved.schema === SAVE_SCHEMA, 'INCOMPATIBLE_SAVE');
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

export function createPurchase(options = {}) {
  let settings = configureScenario(options);
  let run = start(settings);

  return Object.freeze({
    command(commandId, action, args) {
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
    },
    submit(command) {
      const outcome = submitToRun(run, command, settings);
      run = outcome.run;
      if (outcome.status === 'rejected') return { status: 'rejected', code: outcome.code };
      return { status: outcome.status, receipt: outcome.receipt };
    },
    view(actorId) {
      return actorView(run.data, actorId);
    },
    // Trusted policy/inspection endpoint. The actor-facing endpoint is view(actorId).
    decide(reference) {
      const proposal = currentProposal(run.data, reference);
      requireThat(proposal.status === 'open', 'STALE_PROPOSAL');
      return chooseClerkResponse(clerkInputs(run.data, proposal).view);
    },
    // A privileged audit view. Callers at the actor boundary use view(actorId).
    inspect() {
      return run;
    },
    save() {
      return canonicalJson({ schema: SAVE_SCHEMA, scenario: settings, run });
    },
    restore(text) {
      const validated = replay(text);
      settings = validated.settings;
      run = validated.run;
    },
  });
}
