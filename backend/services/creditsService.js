import { prisma } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';

// Escrow: when a CREDITS session is requested, lock the full session cost from
// the learner's balance. On completion the actual elapsed time is settled and
// the unused remainder refunded. On cancellation the full amount is refunded.
// Barter sessions never touch credits.

const sessionCost = (durationMinutes = 60) => Math.round(durationMinutes || 60);

// Lock `amount` credits from the learner into the session reserve.
const reserveCredits = async (tx, { learnerId, amount }) => {
  const learner = await tx.user.findUnique({ where: { id: learnerId } });
  if (!learner) throw new ApiError(404, 'Learner not found');
  const balance = learner.credits ?? 0;
  if (balance < amount) {
    throw new ApiError(400, `Insufficient credits. You need ${amount} credits for this session but only have ${balance}.`);
  }
  await tx.user.update({
    where: { id: learnerId },
    data: { credits: { decrement: amount } }
  });
};

// Settle a completed CREDITS session: pay the teacher the actual elapsed
// duration (capped at the reserved amount) and refund the rest to the learner.
const settleCredits = async (tx, { session }) => {
  const reserved = session.creditsReserved ?? 0;
  if (reserved <= 0) return;

  const actual = Math.max(0, session.actualDurationMinutes ?? 0);
  const charge = Math.min(actual, reserved);
  const refund = reserved - charge;

  if (charge > 0) {
    await tx.user.update({
      where: { id: session.teacherId },
      data: { credits: { increment: charge } }
    });
  }
  if (refund > 0) {
    await tx.user.update({
      where: { id: session.learnerId },
      data: { credits: { increment: refund } }
    });
  }
};

// Refund the full reserve to the learner (used on cancel / decline).
const refundCredits = async (tx, { session }) => {
  const reserved = session.creditsReserved ?? 0;
  if (reserved <= 0) return;
  await tx.user.update({
    where: { id: session.learnerId },
    data: { credits: { increment: reserved } }
  });
};

export { sessionCost, reserveCredits, settleCredits, refundCredits };
