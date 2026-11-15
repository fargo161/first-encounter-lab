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

function shape(value, keys) {
  requireThat(isRecord(value) && Object.keys(value).length === keys.length &&
    keys.every(key => Object.hasOwn(value, key)), 'UNSUPPORTED_TERMS');
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

/** Validate the complete executable headless subset. Explicit groups cannot be flattened into supported terms. */
export function validateExpression(expression) {
  canonicalJson(expression);
  shape(expression, ['schema', 'id', 'version', 'scope', 'function', 'speaker', 'addressees',
    'force', 'time', 'proposal', 'body']);
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
    return true;
  }

  requireThat(expression.function === 'REMARK' && expression.force === 'currentSelfPerformance' &&
    expression.time.stance === 'current', 'UNSUPPORTED_TERMS');
  const { body, proposal } = expression;
  shape(body, ['node', 'act', 'actor', 'recipient', 'target']);
  requireThat(body.node === 'action' && body.act === 'Accept' &&
    body.actor === expression.speaker && body.recipient === recipient, 'UNSUPPORTED_TERMS');
  shape(body.target, ['proposalId', 'proposalVersion', 'expression', 'observationId']);
  requireThat(body.target.proposalId === proposal.id && body.target.proposalVersion === proposal.version, 'UNSUPPORTED_TERMS');
  id(body.target.observationId, 'observation');
  validateReference(body.target.expression);
  requireThat(body.target.expression.id !== expression.id &&
    canonicalJson(body.target.expression.scope) === canonicalJson(expression.scope), 'UNSUPPORTED_TERMS');
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
export function compileOffer(input) {
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
  const expression = expressionRecord(input, 'OFFER', 'proposal', 'future', proposal, body);
  return messageRecord(input, expression, label);
}

function validateReceivedOffer({ scope, sequence, speaker, recipient, offer, receipt, reference }) {
  requireThat(isRecord(reference) && Object.keys(reference).length === 2 &&
    Object.hasOwn(reference, 'id') && Object.hasOwn(reference, 'version'), 'AMBIGUOUS_ASSENT');
  requireThat(offer?.expression?.function === 'OFFER', 'STALE_PROPOSAL');
  const expression = offer.expression;
  const { proposal } = expression;
  requireThat(reference.id === proposal.id && reference.version === proposal.version &&
    canonicalJson(expression.scope) === canonicalJson(scope), 'STALE_PROPOSAL');
  requireThat(expression.addressees[0] === speaker && expression.speaker === recipient, 'WRONG_RECIPIENT');
  requireThat(Boolean(receipt), 'NO_RECEIVING_PATH');
  validateObservation(receipt);
  requireThat(receipt.channel === 'hearing' && receipt.observerId === speaker &&
    receipt.sequence === offer.sequence && receipt.sequence < sequence &&
    receipt.source.kind === 'message' && receipt.source.id === offer.id &&
    receipt.roots.some(root => root.kind === 'message' && root.id === offer.id) &&
    Object.hasOwn(receipt.receivedDetails, 'communication'), 'NO_RECEIVING_PATH');
  requireThat(canonicalJson(receipt.receivedDetails.communication) === canonicalJson(outwardCommunication(offer)),
    'STALE_PROPOSAL');
  return expression;
}

/** The trusted runtime supplies the currently eligible Offer and the actual recipient receipt. */
export function compileAcceptance(input) {
  const offer = validateReceivedOffer(input);
  const { speaker, recipient, receipt } = input;
  const body = {
    node: 'action',
    act: 'Accept',
    actor: speaker,
    recipient,
    target: {
      proposalId: offer.proposal.id,
      proposalVersion: offer.proposal.version,
      expression: expressionReference(offer),
      observationId: receipt.id,
    },
  };
  const expression = expressionRecord(input, 'REMARK', 'currentSelfPerformance', 'current', offer.proposal, body);
  return messageRecord(input, expression, null);
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
    line = 'Offers ' + expression.body.offered.act + ' in exchange for ' +
      expression.body.requested.act + ', ' + amountMinor + ' ' + minorUnit(currency) +
      ' (' + currency + ') for ' + record.label + ' (' + unitId + ').';
  } else {
    requireThat(record.label === null, 'UNSUPPORTED_TERMS');
    line = 'Accepts proposal ' + proposalId + ', version ' + version + '.';
  }
  return freeze(copy({
    expression,
    content: { kind: isOffer ? 'proposal' : 'response', text: line },
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
