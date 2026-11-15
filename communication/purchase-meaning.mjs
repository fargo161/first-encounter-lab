import authoredCues from '../content/based-cues.json' with { type: 'json' };
import {
  canonicalJson, copy, fields, freeze, id, integer, isRecord, requireThat, SALIENCE,
  text, validateObservation
} from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/contracts.mjs';
import { projectObservation } from '../vendor/encounter-m3/76a92fd82ac5ec6f10748f0b439a5d661fff5ea5/src/views.mjs';

const MESSAGE_SCHEMA = 'lab-purchase-message@0.1';
const PROMINENCE = freeze({ SUBTLE: 'understated', NUANCED: 'measured', OVERT: 'emphatic' });
const EXPRESSIONS = freeze(copy(authoredCues));

function purchaseTerms(proposalId, version, productId, unitId, amountMinor) {
  id(proposalId, 'proposal');
  integer(version);
  id(productId, 'subject');
  id(unitId, 'unit');
  integer(amountMinor);
  requireThat(version > 0 && amountMinor > 0, 'UNSUPPORTED_TERMS');
  return {
    proposalId,
    version,
    exchange: [{ act: 'Pay', amountMinor }, { act: 'Give', productId, unitId }]
  };
}

function messageRecord({ commandId, sequence, senderId, recipientId, contextMessageId,
  productId, label, terms, act, vibe, salience }) {
  id(commandId, 'command');
  integer(sequence);
  id(senderId, 'actor');
  id(recipientId, 'actor');
  requireThat(senderId !== recipientId, 'WRONG_RECIPIENT');
  if (contextMessageId !== null) id(contextMessageId, 'message');
  requireThat(typeof vibe === 'string' && Object.hasOwn(EXPRESSIONS, vibe) && SALIENCE.includes(salience), 'UNAVAILABLE_EXPRESSION');

  const expression = EXPRESSIONS[vibe];
  const amount = terms.exchange[0].amountMinor;
  const unit = terms.exchange[1].unitId;
  const offer = act === 'propose_exchange';
  return freeze({
    schema: MESSAGE_SCHEMA,
    id: `message_${commandId.slice('command_'.length)}`,
    commandId,
    sequence,
    contextMessageId,
    privateComposition: {
      authorId: senderId,
      selectedVibe: vibe,
      selectedSalience: salience,
      templateId: expression.templateId,
      intendedFraming: expression.cues.map(cue => cue.text).join(' ')
    },
    outward: {
      family: offer ? 'Offer' : 'Remark',
      act,
      senderId,
      recipientIds: [recipientId],
      subjectIds: [productId],
      targetId: productId,
      scope: { subjectId: productId, kind: 'subject' },
      content: {
        kind: offer ? 'proposal' : 'response',
        text: offer
          ? `Offers Pay ${amount} minor units in exchange for Give ${label} (${unit}).`
          : `Accepts proposal ${terms.proposalId}, version ${terms.version}, for ${amount} minor units and item ${unit}.`
      },
      framing: copy(expression.cues),
      prominence: PROMINENCE[salience],
      terms
    }
  });
}

/** Only the one known-product Pay-for-Give shape is compiled by this slice. */
export function compileOffer({ commandId, sequence, buyerId, sellerId, proposalId, version, draft, references }) {
  canonicalJson(draft);
  requireThat(isRecord(draft) && Object.keys(draft).length === 4 &&
    ['productId', 'amountMinor', 'vibe', 'salience'].every(key => Object.hasOwn(draft, key)), 'UNSUPPORTED_TERMS');
  id(draft.productId, 'subject');
  requireThat(Array.isArray(references));
  const known = references.find(ref => ref.productId === draft.productId);
  requireThat(Boolean(known), 'UNKNOWN_REFERENCE');
  text(known.label, 120);
  const terms = purchaseTerms(proposalId, version, draft.productId, known.unitId, draft.amountMinor);

  return messageRecord({
    commandId, sequence, senderId: buyerId, recipientId: sellerId, contextMessageId: null,
    productId: draft.productId, label: known.label, terms, act: 'propose_exchange',
    vibe: draft.vibe, salience: draft.salience
  });
}

/** This records assent to the actual delivered version and leaves all effects to Encounter. */
export function compileAcceptance({ commandId, sequence, sellerId, proposal, reference, offerObservation }) {
  requireThat(isRecord(reference) && Object.keys(reference).length === 2 &&
    Object.hasOwn(reference, 'id') && Object.hasOwn(reference, 'version'), 'AMBIGUOUS_ASSENT');
  requireThat(Boolean(proposal) && reference.id === proposal.id && reference.version === proposal.version &&
    proposal.status === 'open', 'STALE_PROPOSAL');
  requireThat(sellerId === proposal.sellerId, 'WRONG_RECIPIENT');
  requireThat(Boolean(offerObservation), 'NO_RECEIVING_PATH');
  validateObservation(offerObservation);
  const received = offerObservation.receivedDetails.communication;
  const terms = purchaseTerms(proposal.id, proposal.version, proposal.productId, proposal.unitId, proposal.amountMinor);

  requireThat(offerObservation.observerId === sellerId && offerObservation.channel === 'hearing' &&
    offerObservation.sequence < sequence &&
    offerObservation.source.kind === 'message' && offerObservation.source.id === proposal.offerMessageId &&
    offerObservation.roots.some(root => root.kind === 'message' && root.id === proposal.offerMessageId) &&
    received?.family === 'Offer' && received.act === 'propose_exchange' &&
    received.senderId === proposal.buyerId && received.recipientIds?.length === 1 &&
    received.recipientIds[0] === sellerId && received.targetId === proposal.productId, 'NO_RECEIVING_PATH');
  requireThat(isRecord(received.terms) && canonicalJson(received.terms) === canonicalJson(terms), 'STALE_PROPOSAL');

  return messageRecord({
    commandId, sequence, senderId: sellerId, recipientId: proposal.buyerId,
    contextMessageId: proposal.offerMessageId, productId: proposal.productId, terms,
    act: 'accept_exchange', vibe: 'EA', salience: 'NUANCED'
  });
}

/** Project the explicitly outward part using the native recipient observation boundary. */
export function observePurchaseMessage(message, { observationId, observerId }) {
  canonicalJson(message);
  fields(message, ['schema', 'id', 'commandId', 'sequence', 'contextMessageId', 'privateComposition', 'outward']);
  requireThat(message.schema === MESSAGE_SCHEMA, 'UNSUPPORTED_TERMS');
  const outward = message.outward;
  fields(outward, ['family', 'act', 'senderId', 'recipientIds', 'subjectIds', 'targetId', 'scope', 'content', 'framing', 'prominence', 'terms']);
  fields(outward.scope, ['subjectId', 'kind']);
  fields(outward.content, ['kind', 'text']);
  text(outward.content.text);
  requireThat(Array.isArray(outward.framing), 'UNSUPPORTED_TERMS');
  for (const cue of outward.framing) {
    fields(cue, ['kind', 'text']);
    text(cue.kind, 100);
    text(cue.text);
  }
  requireThat(Object.values(EXPRESSIONS).some(expression =>
    canonicalJson(expression.cues) === canonicalJson(outward.framing)), 'UNAVAILABLE_EXPRESSION');
  requireThat(Object.values(PROMINENCE).includes(outward.prominence), 'UNAVAILABLE_EXPRESSION');
  fields(outward.terms, ['proposalId', 'version', 'exchange']);
  requireThat(Array.isArray(outward.terms.exchange) && outward.terms.exchange.length === 2, 'UNSUPPORTED_TERMS');
  fields(outward.terms.exchange[0], ['act', 'amountMinor']);
  fields(outward.terms.exchange[1], ['act', 'productId', 'unitId']);
  const [pay, give] = outward.terms.exchange;
  requireThat(pay.act === 'Pay' && give.act === 'Give', 'UNSUPPORTED_TERMS');
  purchaseTerms(outward.terms.proposalId, outward.terms.version, give.productId, give.unitId, pay.amountMinor);
  const isOffer = outward.family === 'Offer' && outward.act === 'propose_exchange' && message.contextMessageId === null;
  const isAssent = outward.family === 'Remark' && outward.act === 'accept_exchange' && typeof message.contextMessageId === 'string';
  requireThat(isOffer || isAssent, 'UNSUPPORTED_TERMS');
  if (isAssent) id(message.contextMessageId, 'message');
  id(outward.senderId, 'actor');
  requireThat(outward.targetId === give.productId && outward.scope.subjectId === give.productId &&
    outward.scope.kind === 'subject' && Array.isArray(outward.subjectIds) && outward.subjectIds.length === 1 &&
    outward.subjectIds[0] === give.productId, 'UNSUPPORTED_TERMS');
  requireThat(Array.isArray(outward.recipientIds) && outward.recipientIds.length === 1 &&
    outward.recipientIds[0] === observerId, 'NO_RECEIVING_PATH');

  const source = { kind: 'message', id: message.id };
  return projectObservation({
    ...source, sequence: message.sequence, details: { communication: outward }
  }, {
    id: observationId, observerId, channel: 'hearing', receivedKeys: ['communication'], roots: [source]
  });
}
