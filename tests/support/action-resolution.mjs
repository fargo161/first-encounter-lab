/** Produce a failed action-resolution result through the trusted headless admission surface. */
export function failHandover(session, { commandId, resultId, sellerId, reference }) {
  return session.recordHandoverFailure(commandId, {
    actorId: sellerId,
    reference,
    evidence: { id: resultId, outcome: 'not_transferred' },
  });
}
