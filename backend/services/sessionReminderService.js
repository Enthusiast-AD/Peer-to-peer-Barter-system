import { prisma } from '../db/index.js';
import { sendSessionReminderEmail } from './mailService.js';

const CHECK_INTERVAL_MS = 60 * 1000; // run every minute
const REMIND_BEFORE_MIN = 10;

// Find SCHEDULED sessions whose start is within REMIND_BEFORE_MIN that haven't
// been reminded yet, and email both participants so they can join in time.
const sendUpcomingSessionReminders = async () => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMIND_BEFORE_MIN * 60 * 1000);

  const sessions = await prisma.session.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { gte: now, lte: windowEnd },
      reminderSentAt: null
    },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      learner: { select: { id: true, name: true, email: true } }
    }
  });

  for (const session of sessions) {
    const baseUrl = process.env.CLIENT_URL || '';
    const sessionUrl = `${baseUrl}/dashboard/session/${session.id}`;

    const participants = [
      { user: session.teacher, other: session.learner },
      { user: session.learner, other: session.teacher }
    ];

    for (const { user, other } of participants) {
      if (!user?.email) continue;
      try {
        await sendSessionReminderEmail({
          toEmail: user.email,
          toName: user.name,
          otherName: other?.name,
          topic: session.topic,
          scheduledAt: session.scheduledAt,
          durationMinutes: session.durationMinutes,
          sessionUrl
        });
      } catch (error) {
        console.error(`Failed to send reminder to ${user.email}:`, error.message);
      }
    }

    // Mark as reminded even if a send failed so we don't hammer recipients on
    // every tick; the reminder is best-effort.
    await prisma.session.update({
      where: { id: session.id },
      data: { reminderSentAt: new Date() }
    });
  }
};

let intervalHandle = null;

const startReminderScheduler = () => {
  if (intervalHandle) return;
  // First pass shortly after boot so missed windows don't lag a full interval.
  sendUpcomingSessionReminders().catch((error) => {
    console.error('Reminder scheduler first pass failed:', error.message);
  });
  intervalHandle = setInterval(() => {
    sendUpcomingSessionReminders().catch((error) => {
      console.error('Reminder scheduler failed:', error.message);
    });
  }, CHECK_INTERVAL_MS);
};

export { startReminderScheduler, sendUpcomingSessionReminders };
