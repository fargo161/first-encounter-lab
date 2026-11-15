import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expressionReference } from '../../../communication/purchase-meaning.mjs';
import { BUYER_ID, CLERK_ID, PRODUCT_ID, UNIT_ID, createPurchase } from '../../../core/purchase.mjs';

function scenario(runId, choice) {
  let session = createPurchase({
    runId,
    knowledge: [
      { actorId: BUYER_ID, unitId: UNIT_ID, listedPriceMinor: 250 },
      { actorId: CLERK_ID, unitId: UNIT_ID, priceKnown: false, available: true },
    ],
  });
  let sequence = 0;
  const attempts = [];
  const initialAssets = session.inspect().data.ledger;

  function perform(action, payload) {
    const id = 'command_' + (++sequence).toString(16).padStart(4, '0');
    const command = session.command(id, action, payload);
    const outcome = session.submit(command);
    attempts.push({ action, commandId: id, outcome });
    return outcome;
  }
  const opened = perform('offer', {
    actorId: BUYER_ID, recipientId: CLERK_ID, productId: PRODUCT_ID,
    amountMinor: 250, vibe: 'EA', salience: 'NUANCED',
  });
  assert.equal(opened.status, 'committed');
  const { proposalId, version } = opened.receipt.result;
  const reference = { id: proposalId, version };
  const asker = { actorId: CLERK_ID, reference };
  assert.equal(perform('respond', asker).status, 'committed');
  const beforeAnswer = session.inspect().data.proposals.find(p => p.id === proposalId && p.version === version);
  const question = session.view(BUYER_ID).observations.find(receipt =>
    receipt.receivedDetails.communication?.expression?.body.act === 'Clarify');
  const heard = question.receivedDetails.communication;
  const questionRef = { expression: expressionReference(heard.expression), observationId: question.id };

  const pendingSave = session.save();
  const reloaded = createPurchase();
  reloaded.restore(pendingSave);
  assert.equal(reloaded.save(), pendingSave);
  session = reloaded;
  for (let i = 0; i < 3; i++) assert.equal(perform('respond', asker).status, 'rejected');
  assert.equal(session.inspect().data.messages.filter(m => m.expression.body.act === 'Clarify').length, 1);
  const answerMenu = session.forActor(BUYER_ID).questionMenu(questionRef);
  assert.deepEqual([...answerMenu].sort(), ['Decline', 'Tell']);
  const answered = perform('answer_question', { actorId: BUYER_ID, question: questionRef, choice });
  assert.equal(answered.status, 'committed');

  const { data, journal } = session.inspect();
  const resolution = data.proposals.find(p => p.id === proposalId && p.version === version);
  const answer = session.view(CLERK_ID).observations.find(receipt =>
    receipt.receivedDetails.communication?.expression?.body.act === choice);
  assert.ok(answer);
  const responseAct = choice === 'Tell' ? 'Accept' : 'Refuse';
  const response = session.view(BUYER_ID).observations.find(receipt =>
    receipt.receivedDetails.communication?.expression?.body.act === responseAct);
  assert.ok(response);
  let payment = null;
  if (choice === 'Tell') {
    assert.equal(resolution.status, 'agreed');
    assert.equal(answer.receivedDetails.communication.expression.body.fact.value, 250);
    const beforeViews = [BUYER_ID, CLERK_ID].map(actorId => session.forActor(actorId).view());
    const id = 'command_' + (++sequence).toString(16).padStart(4, '0');
    payment = session.forActor(BUYER_ID).submit(id, 'pay', { reference });
    attempts.push({ action: 'pay', commandId: id, outcome: payment });
    assert.deepEqual([BUYER_ID, CLERK_ID].map(actorId => session.forActor(actorId).view()), beforeViews);
    assert.deepEqual(payment, { status: 'rejected', code: 'ACTION_UNAVAILABLE' });
  } else {
    assert.equal(resolution.status, 'refused');
    assert(!Object.hasOwn(answer.receivedDetails.communication.expression.body, 'fact'));
    assert.match(response.receivedDetails.communication.content.text, /list_price|marked price/i);
  }

  const finished = session.inspect();
  assert.deepEqual(finished.data.ledger, initialAssets);
  const replayed = createPurchase();
  replayed.restore(session.save());
  assert.equal(replayed.save(), session.save());
  return {
    runId, outcome: choice, initialOfferMinor: 250, initialBelievedPriceMinor: 250, authoritativePriceMinor: 300,
    answerMenu, pendingSave: {
      schema: JSON.parse(pendingSave).schema,
      sha256: createHash('sha256').update(pendingSave).digest('hex'),
      exactQuestion: beforeAnswer.questions[0],
    },
    question,
    answer,
    response,
    finalProposal: resolution,
    partyKnowledge: Object.fromEntries([BUYER_ID, CLERK_ID].map(actorId => {
      const seen = session.forActor(actorId).view().references.find(ref => ref.unitId === UNIT_ID);
      return [actorId, { priceMinor: seen.priceMinor ?? null, priceObservationId: seen.priceObservationId ?? seen.observationId }];
    })),
    ledgerUnchanged: true,
    payment,
    attempts,
    committedEffects: finished.data.events.filter(event => event.commandId !== null),
    journal: journal.map(({ command, receipt }) => ({ commandId: command.id, action: command.payload.action, committedRevision: receipt.committedRevision })),
  };
}

const oldSave = process.argv[2] ? readFileSync(process.argv[2], 'utf8') : null;
let preservedOldSaveProof = null;
if (oldSave) {
  const current = createPurchase({ runId: 'run_0337' });
  const before = current.save();
  assert.throws(() => current.restore(oldSave), {
    code: 'INCOMPATIBLE_SAVE_VERSION', message: /c77a19c5/,
  });
  assert.equal(current.save(), before);
  preservedOldSaveProof = {
    historicalSchema: JSON.parse(oldSave).schema,
    sha256: createHash('sha256').update(oldSave).digest('hex'), liveRunUnchanged: true,
  };
}

const output = {
  schema: 'first-encounter-lab/headless-part-a-trace@1',
  note: 'Synthetic scenario-domain receipts. The true catalog price is review evidence. Actor-visible records and outcomes are shown separately.',
  told: scenario('run_0331', 'Tell'),
  declined: scenario('run_0332', 'Decline'),
  preservedOldSaveProof,
};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
