import { createHash } from 'node:crypto';
import authoredCues from '../content/based-cues.json' with { type: 'json' };
import {
  canonicalJson, copy, fields, freeze, id, integer, isRecord, packageRef, requireThat, SALIENCE,
  text, validateObservation,
} from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';
import { projectObservation } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/views.mjs';

export const EXPRESSION_SCHEMA = 'kw-expression@1';
const PROMINENCE = freeze({ SUBTLE: 'understated', NUANCED: 'measured', OVERT: 'emphatic' });
const CUES = freeze(copy(authoredCues));
const CLARIFICATION = freeze({ stock: 'Is the item available?', list_price: 'What is the list price?' });
export const QUESTION_DECLINE_REASONS = freeze({
  declined: 'I decline to answer.',
  missingFact: "I don't have that fact.",
});

function shape(value, keys, optional = []) {
  requireThat(isRecord(value) && keys.every(key => Object.hasOwn(value, key)) &&
    Object.keys(value).every(key => keys.includes(key) || optional.includes(key)), 'UNSUPPORTED_TERMS');
}

function validateScope(scope) {
  fields(scope, ['producer', 'runId', 'packageRef']);
  requireThat(scope.producer === 'first-encounter-lab', 'UNSUPPORTED_TERMS');
  id(scope.runId, 'run');
  packageRef(scope.packageRef);
}

function validateReference(reference) {
  fields(reference, ['scope', 'id', 'version', 'digest']);
  validateScope(reference.scope);
  id(reference.id, 'message');
  requireThat(reference.version === 1 && typeof reference.digest === 'string' &&
    /^[a-f0-9]{64}$/.test(reference.digest), 'UNSUPPORTED_TERMS');
}

function validateProposal(proposal, scope) {
  fields(proposal, ['id', 'version', 'parent']);
  id(proposal.id, 'proposal');
  integer(proposal.version);
  if (proposal.version === 1) {
    requireThat(proposal.parent === null, 'UNSUPPORTED_TERMS');
  } else {
    requireThat(proposal.version > 1, 'UNSUPPORTED_TERMS');
    validateReference(proposal.parent);
    requireThat(canonicalJson(proposal.parent.scope) === canonicalJson(scope), 'UNSUPPORTED_TERMS');
  }
}

const minorUnit = currency => currency === 'USD' ? 'cent' : 'minor-unit';

function readExchange(body) {
  shape(body, ['node', 'offered', 'requested']);
  requireThat(body.node === 'exchange', 'UNSUPPORTED_TERMS');
  const { offered, requested } = body;
  requireThat(offered?.node === 'action' && requested?.node === 'action', 'UNSUPPORTED_TERMS');
  const [pay, give] = offered.act === 'Pay' ? [offered, requested] : [requested, offered];
  shape(pay, ['node', 'termId', 'act', 'actor', 'recipient', 'quantity']);
  shape(give, ['node', 'termId', 'act', 'actor', 'for', 'recipient', 'item', 'transfer']);
  requireThat(pay.act === 'Pay' && pay.termId === 'pay' && give.act === 'Give' && give.termId === 'give', 'UNSUPPORTED_TERMS');
  id(pay.actor, 'actor');
  id(give.actor, 'actor');
  id(pay.recipient, 'store');
  requireThat(pay.actor !== give.actor && give.recipient === pay.actor && give.for === pay.recipient, 'UNSUPPORTED_TERMS');

  shape(pay.quantity, ['amount', 'unit', 'currency']);
  const { amount, currency, unit } = pay.quantity;
  requireThat(Number.isSafeInteger(amount) && amount > 0 && typeof currency === 'string' &&
    /^[A-Z]{3}$/.test(currency) && unit === minorUnit(currency), 'UNSUPPORTED_TERMS');
  shape(give.item, ['productId', 'unitId']);
  id(give.item.productId, 'subject');
  id(give.item.unitId, 'unit');
  shape(give.transfer, ['title', 'custody']);
  requireThat(give.transfer.title === true && give.transfer.custody === true, 'UNSUPPORTED_TERMS');
  return {
    buyerId: pay.actor, sellerId: give.actor, storeId: pay.recipient,
    productId: give.item.productId, unitId: give.item.unitId, amountMinor: amount, currency,
  };
}

function validateTarget(target, expression, expectedVersion) {
  shape(target, ['proposalId', 'proposalVersion', 'expression', 'observationId']);
  requireThat(target.proposalId === expression.proposal.id &&
    target.proposalVersion === expectedVersion, 'UNSUPPORTED_TERMS');
  id(target.observationId, 'observation');
  validateReference(target.expression);
  requireThat(target.expression.id !== expression.id &&
    canonicalJson(target.expression.scope) === canonicalJson(expression.scope), 'UNSUPPORTED_TERMS');
}

function validateReason(reason) {
  text(reason, 240);
}

function validateToldFact(fact, missing) {
  shape(fact, ['productId', 'unitId', 'value']);
  id(fact.productId, 'subject');
  id(fact.unitId, 'unit');
  const typed = missing === 'list_price' ? Number.isSafeInteger(fact.value) && fact.value > 0 :
    typeof fact.value === 'boolean';
  requireThat(typed, 'UNSUPPORTED_TERMS');
}

/** Validate the complete executable headless subset. Explicit groups cannot be flattened into supported terms. */
export function validateExpression(expression) {
  canonicalJson(expression);
  shape(expression, ['schema', 'id', 'version', 'scope', 'function', 'speaker', 'addressees',
    'force', 'time', 'proposal', 'body'], ['reply']);
  requireThat(expression.schema === EXPRESSION_SCHEMA && expression.version === 1, 'UNSUPPORTED_TERMS');
  validateScope(expression.scope);
  id(expression.id, 'message');
  id(expression.speaker, 'actor');
  requireThat(Array.isArray(expression.addressees) && expression.addressees.length === 1, 'WRONG_RECIPIENT');
  const [recipient] = expression.addressees;
  id(recipient, 'actor');
  requireThat(recipient !== expression.speaker, 'WRONG_RECIPIENT');
  shape(expression.time, ['stance']);
  validateProposal(expression.proposal, expression.scope);

  if (expression.function === 'OFFER') {
    requireThat(expression.force === 'proposal' && expression.time.stance === 'future', 'UNSUPPORTED_TERMS');
    readExchange(expression.body);
    requireThat(expression.body.offered.actor === expression.speaker && expression.body.requested.actor === recipient,
      'WRONG_RECIPIENT');
    if (Object.hasOwn(expression, 'reply')) {
      const { target, reason } = expression.reply ?? {};
      shape(expression.reply, ['target', 'reason']);
      validateReason(reason);
      validateTarget(target, expression, expression.proposal.version - 1);
      requireThat(expression.proposal.version > 1 &&
        canonicalJson(target.expression) === canonicalJson(expression.proposal.parent), 'UNSUPPORTED_TERMS');
    }
    return true;
  }

  requireThat(!Object.hasOwn(expression, 'reply') && expression.time.stance === 'current', 'UNSUPPORTED_TERMS');
  const { body, proposal } = expression;
  const actionFields = ['node', 'act', 'actor', 'recipient', 'target'];
  requireThat(isRecord(body), 'UNSUPPORTED_TERMS');
  if (body.act === 'Clarify') {
    shape(body, [...actionFields, 'missing', 'reason']);
    requireThat(expression.function === 'REQUEST' && expression.force === 'request' &&
      Object.hasOwn(CLARIFICATION, body.missing), 'UNSUPPORTED_TERMS');
  } else {
    requireThat(expression.function === 'REMARK' && expression.force === 'currentSelfPerformance',
      'UNSUPPORTED_TERMS');
    switch (body.act) {
      case 'Tell':
        shape(body, [...actionFields, 'missing', 'fact']);
        requireThat(Object.hasOwn(CLARIFICATION, body.missing), 'UNSUPPORTED_TERMS');
        validateToldFact(body.fact, body.missing);
        break;
      case 'Decline':
        shape(body, [...actionFields, 'missing', 'reason']);
        requireThat(Object.hasOwn(CLARIFICATION, body.missing) &&
          Object.values(QUESTION_DECLINE_REASONS).includes(body.reason), 'UNSUPPORTED_TERMS');
        break;
      case 'Refuse':
        shape(body, [...actionFields, 'reason']);
        break;
      case 'Accept':
        shape(body, actionFields, ['reason']);
        break;
      default:
        requireThat(false, 'UNSUPPORTED_TERMS');
    }
  }
  requireThat(body.node === 'action' && body.actor === expression.speaker &&
    body.recipient === recipient, 'UNSUPPORTED_TERMS');
  if (Object.hasOwn(body, 'reason')) validateReason(body.reason);
  validateTarget(body.target, expression, proposal.version);
  return true;
}

export function exchangeTerms(expression) {
  validateExpression(expression);
  requireThat(expression.function === 'OFFER', 'UNSUPPORTED_TERMS');
  return freeze(readExchange(expression.body));
}

export function expressionReference(expression) {
  validateExpression(expression);
  return freeze({
    scope: copy(expression.scope),
    id: expression.id,
    version: expression.version,
    digest: createHash('sha256').update(canonicalJson(expression), 'utf8').digest('hex'),
  });
}

function expressionRecord(input, fn, force, stance, proposal, body) {
  return {
    schema: EXPRESSION_SCHEMA,
    id: input.id,
    version: 1,
    scope: input.scope,
    function: fn,
    speaker: input.speaker,
    addressees: [input.recipient],
    force,
    time: { stance },
    proposal,
    body,
  };
}

function authoredStyle(vibe, salience) {
  requireThat(typeof vibe === 'string' && Object.hasOwn(CUES, vibe) &&
    SALIENCE.includes(salience), 'UNAVAILABLE_EXPRESSION');
  return CUES[vibe];
}

function messageRecord({ sequence, delivery }, expression, label) {
  validateExpression(expression);
  integer(sequence);
  requireThat(sequence > 0);
  shape(delivery, ['vibe', 'salience']);
  const { vibe, salience } = delivery;
  const style = authoredStyle(vibe, salience);
  return freeze(copy({
    id: expression.id,
    sequence,
    expression,
    label,
    privateComposition: {
      authorId: expression.speaker,
      selectedVibe: vibe,
      selectedSalience: salience,
      templateId: style.templateId,
      intendedFraming: style.cues.map(cue => cue.text).join(' '),
    },
  }));
}

/** The caller supplies actor-known references and verifies authority at the Encounter boundary. */
function offerExpression(input) {
  const { terms, proposal, speaker, label } = input;
  canonicalJson(terms);
  shape(terms, ['buyerId', 'sellerId', 'storeId', 'productId', 'unitId', 'amountMinor', 'currency']);
  text(label, 120);
  const pay = {
    node: 'action',
    termId: 'pay',
    act: 'Pay',
    actor: terms.buyerId,
    recipient: terms.storeId,
    quantity: { amount: terms.amountMinor, unit: minorUnit(terms.currency), currency: terms.currency },
  };
  const give = {
    node: 'action',
    termId: 'give',
    act: 'Give',
    actor: terms.sellerId,
    for: terms.storeId,
    recipient: terms.buyerId,
    item: { productId: terms.productId, unitId: terms.unitId },
    transfer: { title: true, custody: true },
  };
  const [offered, requested] = speaker === terms.buyerId ? [pay, give] : [give, pay];
  const body = { node: 'exchange', offered, requested };
  return expressionRecord(input, 'OFFER', 'proposal', 'future', proposal, body);
}

export function compileOffer(input) {
  return messageRecord(input, offerExpression(input), input.label);
}

function validateHearing(message, receipt, speaker, sequence) {
  requireThat(Boolean(receipt), 'NO_RECEIVING_PATH');
  validateObservation(receipt);
  requireThat(receipt.channel === 'hearing' && receipt.observerId === speaker &&
    receipt.sequence === message.sequence && receipt.sequence < sequence &&
    receipt.source.kind === 'message' && receipt.source.id === message.id &&
    receipt.roots.some(root => root.kind === 'message' && root.id === message.id) &&
    Object.hasOwn(receipt.receivedDetails, 'communication'), 'NO_RECEIVING_PATH');
  requireThat(canonicalJson(receipt.receivedDetails.communication) === canonicalJson(outwardCommunication(message)),
    'STALE_PROPOSAL');
}

function validateReceivedOffer({ scope, sequence, speaker, recipient, offer, receipt, reference }) {
  requireThat(isRecord(reference) && Object.keys(reference).length === 2 &&
    Object.hasOwn(reference, 'id') && Object.hasOwn(reference, 'version'), 'AMBIGUOUS_ASSENT');
  requireThat(offer?.expression?.function === 'OFFER', 'STALE_PROPOSAL');
  const expression = offer.expression;
  validateExpression(expression);
  const { proposal } = expression;
  requireThat(reference.id === proposal.id && reference.version === proposal.version &&
    canonicalJson(expression.scope) === canonicalJson(scope), 'STALE_PROPOSAL');
  requireThat(expression.addressees[0] === speaker && expression.speaker === recipient, 'WRONG_RECIPIENT');
  validateHearing(offer, receipt, speaker, sequence);
  return expression;
}

function receivedTarget(expression, receipt) {
  return {
    proposalId: expression.proposal.id,
    proposalVersion: expression.proposal.version,
    expression: expressionReference(expression),
    observationId: receipt.id,
  };
}

function compileResponse(input, act) {
  const offer = validateReceivedOffer(input);
  const { speaker, recipient, receipt, reason } = input;
  const body = {
    node: 'action',
    act,
    actor: speaker,
    recipient,
    target: receivedTarget(offer, receipt),
  };
  if (reason !== undefined || act !== 'Accept') {
    validateReason(reason);
    body.reason = reason;
  }
  const clarify = act === 'Clarify';
  if (clarify) body.missing = input.missing;
  const expression = expressionRecord(input, clarify ? 'REQUEST' : 'REMARK',
    clarify ? 'request' : 'currentSelfPerformance', 'current', offer.proposal, body);
  return messageRecord(input, expression, null);
}

/** The trusted runtime supplies the currently eligible Offer and the actual recipient receipt. */
export function compileAcceptance(input) {
  return compileResponse(input, 'Accept');
}

export function compileRefusal(input) {
  return compileResponse(input, 'Refuse');
}

export function compileClarification(input) {
  return compileResponse(input, 'Clarify');
}

/** The runtime supplies the actual addressed Clarify and the selected speaker's scoped fact. */
export function compileQuestionAnswer(input) {
  const { question, receipt, scope, sequence, speaker, recipient, choice, subject, fact, reason } = input;
  const request = question?.expression;
  requireThat(request?.body?.act === 'Clarify', 'STALE_PROPOSAL');
  validateExpression(request);
  requireThat(canonicalJson(request.scope) === canonicalJson(scope), 'STALE_PROPOSAL');
  requireThat(request.addressees[0] === speaker && request.speaker === recipient, 'WRONG_RECIPIENT');
  validateHearing(question, receipt, speaker, sequence);

  const missing = request.body.missing;
  const body = {
    node: 'action', act: choice, actor: speaker, recipient, missing,
    target: receivedTarget(request, receipt),
  };
  if (choice === 'Tell') {
    shape(subject, ['productId', 'unitId']);
    shape(fact, ['kind', 'value']);
    requireThat(fact.kind === missing && reason === undefined, 'UNSUPPORTED_TERMS');
    body.fact = { ...subject, value: fact.value };
  } else {
    requireThat(choice === 'Decline' && subject === undefined && fact === undefined, 'UNSUPPORTED_TERMS');
    body.reason = reason;
  }

  const expression = expressionRecord(input, 'REMARK', 'currentSelfPerformance', 'current', request.proposal, body);
  return messageRecord(input, expression, null);
}

export function compileCounter(input) {
  const original = validateReceivedOffer(input);
  const terms = exchangeTerms(original);
  const expression = offerExpression(input);
  const updated = readExchange(expression.body);
  const target = receivedTarget(original, input.receipt);
  requireThat(expression.proposal.id === target.proposalId &&
    expression.proposal.version === target.proposalVersion + 1, 'STALE_PROPOSAL');
  const { amountMinor, ...materialRoles } = updated;
  requireThat(amountMinor !== terms.amountMinor &&
    canonicalJson(materialRoles) === canonicalJson({
      buyerId: terms.buyerId, sellerId: terms.sellerId, storeId: terms.storeId,
      productId: terms.productId, unitId: terms.unitId, currency: terms.currency,
    }), 'UNSUPPORTED_TERMS');
  validateReason(input.reason);
  expression.reply = { target, reason: input.reason };
  return messageRecord(input, expression, input.label);
}

export function outwardCommunication(record) {
  canonicalJson(record);
  fields(record, ['id', 'sequence', 'expression', 'label', 'privateComposition']);
  integer(record.sequence);
  const { expression, privateComposition } = record;
  validateExpression(expression);
  requireThat(record.id === expression.id && record.sequence > 0, 'UNSUPPORTED_TERMS');
  const style = authoredStyle(privateComposition.selectedVibe, privateComposition.selectedSalience);
  const isOffer = expression.function === 'OFFER';
  const { id: proposalId, version } = expression.proposal;
  let line;
  if (isOffer) {
    text(record.label, 120);
    const { amountMinor, currency, unitId } = exchangeTerms(expression);
    const opening = expression.reply ? 'Counters with ' : 'Offers ';
    line = opening + expression.body.offered.act + ' in exchange for ' +
      expression.body.requested.act + ', ' + amountMinor + ' ' + minorUnit(currency) +
      ' (' + currency + ') for ' + record.label + ' (' + unitId + ').';
  } else {
    requireThat(record.label === null, 'UNSUPPORTED_TERMS');
    const { act, missing, fact } = expression.body;
    switch (act) {
      case 'Clarify':
        line = CLARIFICATION[missing];
        break;
      case 'Tell':
        line = missing === 'list_price'
          ? 'As far as I know, the list price is ' + fact.value + ' minor units.'
          : 'As far as I know, the item is ' + (fact.value ? 'available.' : 'unavailable.');
        break;
      case 'Decline':
        line = expression.body.reason;
        break;
      default:
        line = act + 's proposal ' + proposalId + ', version ' + version + '.';
    }
  }
  const reason = expression.reply?.reason ?? expression.body.reason;
  if (reason && expression.body.act !== 'Decline') line += ' ' + reason;
  return freeze(copy({
    expression,
    content: { kind: isOffer ? 'proposal' : expression.function === 'REQUEST' ? 'question' : 'response', text: line },
    framing: style.cues,
    prominence: PROMINENCE[privateComposition.selectedSalience],
  }));
}

/** Only the explicitly addressed actor receives the selected expression and outward cues. */
export function observePurchaseMessage(record, { observationId, observerId }) {
  const communication = outwardCommunication(record);
  requireThat(communication.expression.addressees.includes(observerId), 'NO_RECEIVING_PATH');
  const source = { kind: 'message', id: record.id };
  return projectObservation({
    ...source, sequence: record.sequence, details: { communication },
  }, {
    id: observationId, observerId, channel: 'hearing', receivedKeys: ['communication'], roots: [source],
  });
}
