import { createHash } from 'node:crypto';
import { canonicalJson, ContractError, copy, fields, freeze, id, isRecord, requireThat } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';
import { createRun, executeCommand, validateRun } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/runtime.mjs';
import {
  compileAcceptance, compileClarification, compileCounter, compileOffer, compileQuestionAnswer, compileRefusal,
  QUESTION_DECLINE_REASONS,
  exchangeTerms, expressionReference, observePurchaseMessage,
} from '../communication/purchase-meaning.mjs';
import { choosePurchaseResponse, deliveryFit, purchaseProfile } from '../decisions/clerk.mjs';
import { chooseShopperOpening } from '../decisions/shopper.mjs';
import {
  actorView, configureScenario, initialState, nextId, observeEvent, recordEvent, recordWarmth, scenarioPackageRef, validateState,
} from './scenario.mjs';

export { BUYER_ID, CLERK_ID, PRICE_MINOR, PRODUCT_ID, STORE_ID, UNIT_ID, UNKNOWN_PRODUCT_ID } from './scenario.mjs';

const SAVE_SCHEMA = 'lab-headless-generalization-save@2';
const EXPRESSION_SCHEMA = 'kw-expression@1';
const actions = freeze({
  offer: 'send_message',
  accept: 'send_message',
  respond: 'send_message',
  reply: 'send_message',
  answer_question: 'send_message',
  shop: 'send_message',
  pay: 'perform_action',
  handover: 'perform_action',
  resolve_handover_failure: 'perform_action',
  deliver_completion: 'perform_action',
});
const HOST_ACTIONS = new Set(['resolve_handover_failure', 'deliver_completion']);
const ACTOR_MENU_ORDER = freeze(['Accept', 'Refuse', 'Counter', 'Clarify']);

const safeRuleErrors = new Set([
  'AMBIGUOUS_ASSENT', 'STALE_PROPOSAL', 'WRONG_ACTOR', 'WRONG_CONTROLLER', 'WRONG_RECIPIENT',
  'UNKNOWN_REFERENCE', 'UNSUPPORTED_TERMS', 'UNAVAILABLE_EXPRESSION', 'NO_RECEIVING_PATH',
  'OFFER_CLOSED', 'ACCEPTANCE_INELIGIBLE', 'RESPONSE_INELIGIBLE', 'INVALID_TERMS',
  'QUESTION_PENDING', 'QUESTION_UNAVAILABLE', 'ANSWER_INELIGIBLE',
  'INSUFFICIENT_FUNDS', 'ACTION_UNAVAILABLE', 'PRICE_POLICY', 'PAYMENT_REQUIRED', 'ALREADY_PAID', 'ALREADY_FULFILLED', 'ALREADY_OBSERVED',
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
  observeEmphaticDelivery(data, observation);
  return observation;
}

function messageResult(event, proposal, message, observation) {
  return {
    type: event.type, eventId: event.id, proposalId: proposal.id, version: proposal.version,
    messageId: message.id, observationId: observation.id,
  };
}

function makeOffer(data, command, settings, openingEventId) {
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
  const sellerPolicy = purchaseProfile(sender.role).role;
  if (sellerPolicy.minimumListPrice && known.priceMinor !== undefined) {
    requireThat(payload.amountMinor >= known.priceMinor, 'PRICE_POLICY');
  }
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
  if (prior) {
    prior.status = 'superseded';
    closePendingQuestions(prior);
  }
  data.proposals.push(proposal);
  const event = recordEvent(data, 'offer', command.id, {
    proposalId: proposal.id, version: proposal.version, messageId: message.id,
    ...(openingEventId && { openingEventId }),
  });
  return messageResult(event, proposal, message, observation);
}

function actorProfile(actor) {
  const base = purchaseProfile(actor.role);
  const authored = actor.personality;
  return {
    ...base,
    personality: {
      ...base.personality,
      ...authored,
      priorityNudges: { ...base.personality.priorityNudges, ...authored.priorityNudges },
      deliveryTastes: { ...base.personality.deliveryTastes, ...authored.deliveryTastes },
      manner: { ...base.personality.manner, ...authored.manner },
    },
  };
}

function observeEmphaticDelivery(data, observation) {
  const received = observation.receivedDetails.communication;
  if (received.prominence !== 'emphatic') return;
  const actor = data.actors.find(entry => entry.id === observation.observerId);
  const direction = Math.sign(deliveryFit(received.framing, actorProfile(actor).personality.deliveryTastes));
  if (direction === 0) return;
  const speaker = received.expression.speaker;
  // This headless run models one continuous conversation per pair.
  const kind = direction > 0 ? 'liked_emphatic_delivery' : 'disliked_emphatic_delivery';
  const reason = direction > 0 ? 'I received emphatic delivery I like.' : 'I received emphatic delivery I dislike.';
  recordWarmth(data, observation, speaker, kind, speaker, direction, reason);
}

function shop(data, command, settings) {
  const { payload } = command;
  fields(payload, ['action', 'actorId']);
  const actor = data.actors.find(entry => entry.id === payload.actorId);
  requireThat(actor?.role === 'customer' && actor.shopping, 'ACTION_UNAVAILABLE');
  requireThat(actor.controller === 'rules', 'WRONG_CONTROLLER');
  const local = actorView(data, actor.id);
  const decision = chooseShopperOpening({
    actorId: actor.id, profile: actorProfile(actor), wants: local.shopping.wants,
    products: local.references, fundsMinor: local.account.balanceMinor,
  });
  const { selected: choice, product, offer } = decision;
  const opening = recordEvent(data, 'shopper_opening', command.id, {
    actorId: actor.id, choice,
    ...(product && { productId: product.productId, unitId: product.unitId, productObservationId: product.observationId }),
  });
  if (choice === 'Leave') {
    data.decisions.push({ openingEventId: opening.id, mode: actor.controller, decision });
    return { type: opening.type, eventId: opening.id, choice };
  }
  const { delivery, ...terms } = offer;
  const resultingOffer = makeOffer(data, { ...command, payload: {
    action: 'offer', actorId: actor.id, recipientId: local.shopping.clerkId, ...terms, ...delivery,
  } }, settings, opening.id);
  data.decisions.push({ openingEventId: opening.id, producedMessageId: resultingOffer.messageId, mode: actor.controller, decision });
  return { ...resultingOffer, openingEventId: opening.id, choice };
}

function offerContext(data, proposal, actorId) {
  requireThat(proposal.status === 'open', 'STALE_PROPOSAL');
  const local = actorView(data, actorId);
  const offer = offerRecord(data, proposal);
  requireThat(offer.expression.addressees[0] === actorId, 'WRONG_RECIPIENT');
  const receipt = local.observations.find(entry => entry.source.kind === 'message' && entry.source.id === offer.id);
  requireThat(receipt, 'NO_RECEIVING_PATH');
  const { expression, framing, prominence } = receipt.receivedDetails.communication;
  const terms = exchangeTerms(expression);
  const product = local.references.find(entry => entry.unitId === terms.unitId);
  const actor = data.actors.find(entry => entry.id === actorId);
  return { actor, local, offer, receipt, terms, product, framing, prominence };
}

function responseContext(data, proposal, actorId, context = offerContext(data, proposal, actorId)) {
  const { actor, local, offer, receipt, terms, product, framing, prominence } = context;
  const counterCount = data.events.filter(event => event.type === 'counter' &&
    event.details.proposalId === proposal.id && event.details.actorId === actorId).length;
  const judgment = data.judgments.find(entry => entry.actorId === actorId && entry.towardId === offer.expression.speaker);
  const decision = choosePurchaseResponse({
    actorId, role: actor.role, profile: actorProfile(actor), counterCount,
    allowRefuseMissing: actor.controller === 'human',
    warmth: judgment.warmth, trust: judgment.trust, judgmentCauses: judgment.causes,
    ...(actor.role === 'customer' && {
      fundsMinor: local.account.balanceMinor,
      budgetMinor: local.shopping?.wants.find(want => want.kind === product?.kind)?.budgetMinor,
    }),
    offer: {
      proposalId: proposal.id, version: proposal.version, productId: terms.productId, amountMinor: terms.amountMinor,
      observationId: receipt.id, cues: framing, prominence,
    },
    product,
  });
  return { ...context, decision };
}

function pendingQuestion(proposal, askerId) {
  return proposal.questions?.find(question => question.askerId === askerId && question.status === 'pending');
}

function hasAsked(proposal, askerId, missing) {
  return proposal.questions?.some(question => question.askerId === askerId && question.missing === missing) ?? false;
}

function closePendingQuestions(proposal) {
  for (const question of proposal.questions ?? []) {
    if (question.status === 'pending') question.status = 'closed';
  }
}

function resolveOfferReply(data, command, proposal, context, choice, causeMessageId = context.offer.id) {
  const { actor, decision, offer, receipt, terms, product } = context;
  const reference = { id: proposal.id, version: proposal.version };
  const candidate = decision.candidates.find(entry => entry.act === choice && entry.eligible);
  requireThat(candidate, choice === 'Accept' ? 'ACCEPTANCE_INELIGIBLE' : 'RESPONSE_INELIGIBLE');
  const reply = {
    ...messageFields(data, command),
    speaker: actor.id,
    recipient: offer.expression.speaker,
    offer,
    receipt,
    reference,
    delivery: decision.delivery,
    reason: candidate.reason,
  };

  let message;
  let changed = proposal;
  let eventType;
  const details = { proposalId: proposal.id, version: proposal.version, actorId: actor.id, causeMessageId };
  switch (choice) {
    case 'Accept':
      eventType = 'agreement';
      message = compileAcceptance(reply);
      proposal.status = 'agreed';
      details.assent = [
        { actorId: offer.expression.speaker, messageId: offer.id },
        { actorId: actor.id, messageId: message.id },
      ];
      break;
    case 'Refuse':
      eventType = 'refusal';
      message = compileRefusal(reply);
      proposal.status = 'refused';
      break;
    case 'Counter':
      eventType = 'counter';
      changed = {
        id: proposal.id,
        version: proposal.version + 1,
        participants: [actor.id, offer.expression.speaker],
        status: 'open',
      };
      message = compileCounter({
        ...reply,
        proposal: { id: changed.id, version: changed.version, parent: expressionReference(offer.expression) },
        terms: { ...terms, amountMinor: candidate.amountMinor },
        label: product.label ?? 'the item',
      });
      changed.offerMessageId = message.id;
      proposal.status = 'superseded';
      data.proposals.push(changed);
      details.version = changed.version;
      break;
    case 'Clarify':
      eventType = 'clarification';
      message = compileClarification({ ...reply, missing: decision.missing });
      break;
  }

  const observation = receiveMessage(data, message);
  const event = recordEvent(data, eventType, command.id, { ...details, messageId: message.id });
  if (choice === 'Clarify') {
    proposal.questions ??= [];
    proposal.questions.push({ askerId: actor.id, recipientId: offer.expression.speaker, missing: decision.missing,
      messageId: message.id, observationId: observation.id, status: 'pending' });
  } else {
    closePendingQuestions(proposal);
  }
  if (choice === 'Accept') proposal.agreementEventId = event.id;
  data.decisions.push({ causeMessageId, responseMessageId: message.id, mode: actor.controller, choice, decision });
  return messageResult(event, changed, message, observation);
}

function replyToOffer(data, command) {
  const { payload } = command;
  fields(payload, ['action', 'actorId'], ['reference', ...(payload.action === 'reply' ? ['choice'] : [])]);
  const proposal = currentProposal(data, payload.reference, payload.actorId);
  const offer = offerContext(data, proposal, payload.actorId);
  const autonomous = payload.action === 'respond';
  requireThat(offer.actor.controller === (autonomous ? 'rules' : 'human'), 'WRONG_CONTROLLER');
  requireThat(!pendingQuestion(proposal, offer.actor.id) || (!autonomous && payload.choice === 'Refuse'), 'QUESTION_PENDING');

  const context = responseContext(data, proposal, payload.actorId, offer);
  const choice = autonomous ? context.decision.selected : payload.action === 'accept' ? 'Accept' : payload.choice;
  if (choice === 'Clarify') requireThat(!hasAsked(proposal, offer.actor.id, context.decision.missing), 'QUESTION_UNAVAILABLE');
  return resolveOfferReply(data, command, proposal, context, choice);
}

function questionContext(data, reference, actorId) {
  requireThat(isRecord(reference) && Object.keys(reference).length === 2 && isRecord(reference.expression) &&
    typeof reference.observationId === 'string', 'QUESTION_UNAVAILABLE');
  const questionId = reference.expression.id;
  const proposal = data.proposals.find(entry => entry.status === 'open' && entry.questions?.some(question =>
    question.messageId === questionId && question.recipientId === actorId && question.status === 'pending'));
  requireThat(proposal, 'QUESTION_UNAVAILABLE');
  const state = proposal.questions.find(question => question.messageId === questionId);
  const message = data.messages.find(entry => entry.id === state.messageId);
  const view = actorView(data, actorId);
  const receipt = view.observations.find(entry => entry.id === state.observationId && entry.source.id === state.messageId);
  requireThat(receipt && reference.observationId === receipt.id &&
    canonicalJson(reference.expression) === canonicalJson(expressionReference(message.expression)), 'QUESTION_UNAVAILABLE');

  const { productId, unitId } = exchangeTerms(offerRecord(data, proposal).expression);
  const product = view.references.find(entry => entry.productId === productId && entry.unitId === unitId);
  const listPrice = state.missing === 'list_price';
  const value = listPrice ? product?.priceMinor : product?.available;
  const fact = value === undefined ? null : { kind: state.missing, value };
  const factObservationId = listPrice ? product?.priceObservationId : product?.availabilityObservationId;
  const actor = data.actors.find(entry => entry.id === actorId);
  return { actor, proposal, state, message, receipt, productId, unitId, fact, factObservationId: factObservationId ?? product?.observationId };
}

function respondAfterAnswer(data, command, proposal, question, choice) {
  const context = offerContext(data, proposal, question.askerId);
  if (context.actor.controller !== 'rules') return null;
  if (choice === 'Decline') {
    const reason = 'I cannot decide without ' + question.missing + '.';
    const decision = {
      rule: 'R2', selected: 'Refuse', candidates: [{ act: 'Refuse', eligible: true, reason }],
      delivery: { vibe: actorProfile(context.actor).personality.manner.plain, salience: 'NUANCED' },
    };
    return resolveOfferReply(data, command, proposal, { ...context, decision }, 'Refuse', question.answerMessageId);
  }
  const updated = responseContext(data, proposal, question.askerId, context);
  return resolveOfferReply(data, command, proposal, updated, updated.decision.selected, question.answerMessageId);
}

function answerQuestion(data, command) {
  const { payload } = command;
  fields(payload, ['action', 'actorId', 'question'], ['choice']);
  const context = questionContext(data, payload.question, payload.actorId);
  const { actor, proposal, state, message, receipt, productId, unitId, fact, factObservationId } = context;
  const human = actor.controller === 'human';
  requireThat(human === Object.hasOwn(payload, 'choice'), 'WRONG_CONTROLLER');
  const choice = human ? payload.choice : fact ? 'Tell' : 'Decline';
  requireThat(choice === 'Decline' || (choice === 'Tell' && fact), 'ANSWER_INELIGIBLE');

  const answer = compileQuestionAnswer({
    ...messageFields(data, command), speaker: actor.id, recipient: state.askerId,
    question: message, receipt, choice,
    delivery: { vibe: actorProfile(actor).personality.manner.plain, salience: 'NUANCED' },
    ...(choice === 'Tell' ? { subject: { productId, unitId }, fact } : {
      reason: human ? QUESTION_DECLINE_REASONS.declined : QUESTION_DECLINE_REASONS.missingFact,
    }),
  });
  const observation = receiveMessage(data, answer);
  const event = recordEvent(data, choice === 'Tell' ? 'clarification_told' : 'clarification_declined', command.id, {
    proposalId: proposal.id, version: proposal.version, actorId: actor.id,
    causeMessageId: state.messageId, messageId: answer.id,
    ...(choice === 'Tell' && { factObservationId }),
  });
  state.status = choice === 'Tell' ? 'told' : 'declined';
  state.answerMessageId = answer.id;
  state.answerObservationId = observation.id;

  const followUp = respondAfterAnswer(data, command, proposal, state, choice);
  return { ...messageResult(event, proposal, answer, observation), ...(followUp && { followUp }) };
}

function settlementContext(data, payload, performer) {
  fields(payload, ['action', 'actorId', 'reference'], payload.action === 'resolve_handover_failure' ? ['evidence'] : []);
  const proposal = currentProposal(data, payload.reference, payload.actorId);
  const terms = exchangeTerms(offerRecord(data, proposal).expression);
  requireThat(payload.actorId === terms[performer], 'WRONG_ACTOR');
  const unit = data.ledger.units.find(entry => entry.id === terms.unitId);
  return { proposal, terms, unit };
}

function requireStock(data, proposal, terms, unit) {
  requireThat(unit?.productId === terms.productId && unit.ownerId === terms.storeId && unit.holderId === terms.sellerId, 'ACTION_UNAVAILABLE');
  const claimed = data.proposals.some(candidate => candidate !== proposal && candidate.status === 'paid' &&
    exchangeTerms(offerRecord(data, candidate).expression).unitId === terms.unitId);
  requireThat(!claimed, 'ACTION_UNAVAILABLE');
}

function observeTransaction(data, event, parties, priorEventId) {
  const roots = [{ kind: 'event', id: priorEventId }];
  return parties.map(actorId => observeEvent(data, event, actorId, ['transaction'], roots).id);
}

function observeCompletion(data, event, actorId) {
  const { buyerId, sellerId, paymentEventId } = event.details.transaction;
  const observation = observeEvent(data, event, actorId, ['transaction'], [{ kind: 'event', id: paymentEventId }]);
  const first = data.events.find(entry => {
    if (entry.type !== 'handover') return false;
    const recorded = entry.details.transaction;
    return (recorded.buyerId === buyerId && recorded.sellerId === sellerId) ||
      (recorded.buyerId === sellerId && recorded.sellerId === buyerId);
  });
  if (first.id === event.id) {
    const towardId = actorId === sellerId ? buyerId : sellerId;
    recordWarmth(data, observation, towardId, 'first_purchase', event.id, 1, 'I learned of our first completed purchase.');
  }
  return observation.id;
}

function deliverCompletion(data, command) {
  const { payload } = command;
  fields(payload, ['action', 'actorId', 'reference']);
  const proposal = currentProposal(data, payload.reference, payload.actorId);
  requireThat(proposal.status === 'fulfilled', 'ACTION_UNAVAILABLE');
  const completion = data.events.find(event => event.id === proposal.handoverEventId);
  const alreadyObserved = data.observations.some(observation => observation.observerId === payload.actorId &&
    observation.source.kind === 'event' && observation.source.id === completion.id);
  requireThat(!alreadyObserved, 'ALREADY_OBSERVED');
  const observationId = observeCompletion(data, completion, payload.actorId);
  const event = recordEvent(data, 'completion_receipt', command.id, { observationId, completionEventId: completion.id });
  return {
    type: event.type, eventId: event.id, proposalId: proposal.id, version: proposal.version, observationId,
  };
}

function pay(data, command) {
  const { proposal, terms, unit } = settlementContext(data, command.payload, 'buyerId');
  requireThat(!['paid', 'fulfilled'].includes(proposal.status), 'ALREADY_PAID');
  requireThat(proposal.status === 'agreed', 'STALE_PROPOSAL');
  const source = data.ledger.accounts.find(account => account.id === terms.buyerId);
  requireThat(source.balanceMinor >= terms.amountMinor, 'INSUFFICIENT_FUNDS');
  requireStock(data, proposal, terms, unit);
  const product = data.catalog.find(item => item.productId === terms.productId);
  requireThat(terms.amountMinor >= product.priceMinor, 'ACTION_UNAVAILABLE');
  const till = data.ledger.accounts.find(account => account.id === terms.storeId);
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

function handover(data, command) {
  const { proposal, terms, unit } = settlementContext(data, command.payload, 'sellerId');
  requireThat(proposal.status !== 'fulfilled', 'ALREADY_FULFILLED');
  requireThat(proposal.status === 'paid', 'PAYMENT_REQUIRED');
  requireStock(data, proposal, terms, unit);
  const transaction = {
    proposalId: proposal.id, version: proposal.version, unitId: unit.id,
    paymentEventId: proposal.paymentEventId,
  };
  if (command.payload.action === 'resolve_handover_failure') {
    const { evidence } = command.payload;
    fields(evidence, ['id', 'outcome']);
    id(evidence.id, 'result');
    requireThat(evidence.outcome === 'not_transferred' &&
      !data.events.some(event => event.details.resolutionId === evidence.id), 'ACTION_UNAVAILABLE');
    const reason = 'TRANSFER_FAILED';
    const event = recordEvent(data, 'handover_failed', command.id, {
      resolutionId: evidence.id, transaction: { ...transaction, kind: 'handover_failed', reason },
    });
    const observationIds = observeTransaction(data, event, proposal.participants, proposal.paymentEventId);
    return { type: event.type, eventId: event.id, ...transaction, reason, observationIds };
  }

  unit.ownerId = terms.buyerId;
  unit.holderId = terms.buyerId;
  const event = recordEvent(data, 'handover', command.id, {
    transaction: { ...transaction, kind: 'handover', buyerId: terms.buyerId, sellerId: terms.sellerId, storeId: terms.storeId },
  });
  proposal.status = 'fulfilled';
  proposal.handoverEventId = event.id;
  const observationIds = proposal.participants
    .filter(actorId => actorId === terms.sellerId || data.actors.find(actor => actor.id === actorId).completionObservation === 'immediate')
    .map(actorId => observeCompletion(data, event, actorId));
  return { type: event.type, eventId: event.id, ...transaction, observationIds };
}

const dispatch = {
  offer: makeOffer, accept: replyToOffer, respond: replyToOffer, reply: replyToOffer, answer_question: answerQuestion, shop, pay,
  handover, resolve_handover_failure: handover, deliver_completion: deliverCompletion,
};

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
      return validateState(data, settings);
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
  if (saved?.schema === 'lab-headless-generalization-save@1') {
    const error = new ContractError('INCOMPATIBLE_SAVE_VERSION');
    error.message = 'Replay this save with the historical v0.2 runner at commit c77a19c5d2cf294279d1be9208343497bbb3246f.';
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

  function submitForActor(actorId, commandId, action, args) {
    if (HOST_ACTIONS.has(action) || !Object.hasOwn(actions, action)) {
      return { status: 'rejected', code: 'ACTION_UNAVAILABLE' };
    }
    id(commandId, 'command');
    const actorNamespace = createHash('sha256').update(actorId + '/' + commandId).digest('hex').slice(0, 32);
    const submitted = command('command_' + actorNamespace, action, { ...copy(args), actorId });
    const earlier = run.journal.find(entry => entry.command.id === submitted.id);
    const exactRetry = earlier && canonicalJson(earlier.command.payload) === canonicalJson(submitted.payload);
    const outcome = submit(exactRetry ? earlier.command : submitted);
    if (outcome.status === 'rejected') return outcome;

    const result = copy(outcome.receipt.result);
    const canRead = observationId => run.data.observations.some(entry => entry.id === observationId && entry.observerId === actorId);
    if (result.observationId && !canRead(result.observationId)) delete result.observationId;
    if (result.observationIds) result.observationIds = result.observationIds.filter(canRead);
    if (result.followUp?.observationId && !canRead(result.followUp.observationId)) delete result.followUp.observationId;
    return freeze({ status: outcome.status, receipt: { commandId, result } });
  }

  return Object.freeze({
    command,
    submit,
    recordHandoverFailure(commandId, evidenceArgs) {
      const submitted = command(commandId, 'resolve_handover_failure', evidenceArgs);
      return { ...submit(submitted), command: submitted };
    },
    deliverCompletionObservation(commandId, args) {
      const submitted = command(commandId, 'deliver_completion', args);
      return { ...submit(submitted), command: submitted };
    },
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
          const proposal = currentProposal(run.data, reference, actorId);
          const context = offerContext(run.data, proposal, actorId);
          if (pendingQuestion(proposal, actorId)) return freeze(context.actor.controller === 'human' ? ['Refuse'] : []);
          const { decision } = responseContext(run.data, proposal, actorId, context);
          const eligible = new Set(decision.candidates.filter(candidate => candidate.eligible).map(candidate => candidate.act));
          if (hasAsked(proposal, actorId, decision.missing)) eligible.delete('Clarify');
          return freeze(ACTOR_MENU_ORDER.filter(act => eligible.has(act)));
        },
        questionMenu(question) {
          current();
          const { fact } = questionContext(run.data, question, actorId);
          return freeze(fact ? ['Tell', 'Decline'] : ['Decline']);
        },
        submit(commandId, action, args = {}) {
          current();
          return submitForActor(actorId, commandId, action, args);
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
