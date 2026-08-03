import { prisma } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const validateSlot = (dayOfWeek, startTime, endTime) => {
  if (dayOfWeek === undefined || dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new ApiError(400, 'dayOfWeek must be 0 (Sunday) to 6 (Saturday)');
  }
  if (typeof startTime !== 'string' || typeof endTime !== 'string' || !TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    throw new ApiError(400, 'Times must be valid 24h HH:mm values (00:00-23:59)');
  }
  if (startTime >= endTime) {
    throw new ApiError(400, 'Start time must be before end time');
  }
};

const getMySlots = asyncHandler(async (req, res) => {
  const slots = await prisma.availabilitySlot.findMany({
    where: { userId: req.user.id },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  });
  res.json(new ApiResponse(200, slots, 'Slots fetched'));
});

// Public slots for a user (used to suggest times on their profile / session).
const getUserSlots = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const slots = await prisma.availabilitySlot.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  });
  res.json(new ApiResponse(200, slots, 'Slots fetched'));
});

const addSlot = asyncHandler(async (req, res) => {
  const { dayOfWeek, startTime, endTime } = req.body;
  validateSlot(dayOfWeek, startTime, endTime);

  const slot = await prisma.availabilitySlot.create({
    data: { userId: req.user.id, dayOfWeek, startTime, endTime }
  });
  res.status(201).json(new ApiResponse(201, slot, 'Slot added'));
});

const deleteSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await prisma.availabilitySlot.deleteMany({
    where: { id, userId: req.user.id }
  });
  if (deleted.count === 0) throw new ApiError(404, 'Slot not found');
  res.json(new ApiResponse(200, { ok: true }, 'Slot removed'));
});

const replaceAllSlots = asyncHandler(async (req, res) => {
  const { slots } = req.body;
  if (!Array.isArray(slots)) throw new ApiError(400, 'slots must be an array');
  for (const s of slots) {
    validateSlot(s.dayOfWeek, s.startTime, s.endTime);
  }
  await prisma.$transaction(async (tx) => {
    await tx.availabilitySlot.deleteMany({ where: { userId: req.user.id } });
    if (slots.length > 0) {
      await tx.availabilitySlot.createMany({
        data: slots.map((s) => ({ userId: req.user.id, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }))
      });
    }
  });
  const updated = await prisma.availabilitySlot.findMany({ where: { userId: req.user.id } });
  res.json(new ApiResponse(200, updated, 'Slots updated'));
});

export { getMySlots, getUserSlots, addSlot, deleteSlot, replaceAllSlots, DAYS };
