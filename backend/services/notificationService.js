import { prisma } from '../db/index.js';

// Create an in-app notification for a user.
export const createNotification = async ({ userId, type, title, body, link }) => {
  if (!userId) return;
  try {
    await prisma.notification.create({
      data: { userId, type, title, body: body || null, link: link || null }
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

// Notify a user about a session event, skipping themselves.
export const notifySessionEvent = async ({
  targetUserId,
  selfUserId,
  type,
  title,
  body,
  link
}) => {
  if (!targetUserId || targetUserId === selfUserId) return;
  await createNotification({ userId: targetUserId, type, title, body, link });
};
