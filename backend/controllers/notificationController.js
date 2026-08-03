import { prisma } from '../db/index.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json(new ApiResponse(200, notifications, 'Notifications fetched'));
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user.id, read: false }
  });
  res.json(new ApiResponse(200, { count }, 'Unread count'));
});

const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true }
  });
  res.json(new ApiResponse(200, { ok: true }, 'All notifications marked read'));
});

const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.notification.updateMany({
    where: { id, userId: req.user.id },
    data: { read: true }
  });
  res.json(new ApiResponse(200, { ok: true }, 'Notification marked read'));
});

export { getNotifications, getUnreadCount, markAllRead, markRead };
