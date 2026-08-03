import { prisma } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const assertAdmin = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (!user?.isAdmin) throw new ApiError(403, 'Admin access required');
};

const getDashboard = asyncHandler(async (req, res) => {
  await assertAdmin(req.user.id);
  const [users, sessions, skills, reviews, pendingSessions] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.skill.count(),
    prisma.review.count(),
    prisma.session.count({ where: { status: 'PENDING' } })
  ]);
  res.json(new ApiResponse(200, {
    stats: { users, sessions, skills, reviews, pendingSessions }
  }, 'Admin dashboard'));
});

const listUsers = asyncHandler(async (req, res) => {
  await assertAdmin(req.user.id);
  const { q, page = 1, pageSize = 25 } = req.query;
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
  const where = q
    ? { OR: [{ name: { contains: String(q), mode: 'insensitive' } }, { email: { contains: String(q), mode: 'insensitive' } }] }
    : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, credits: true, warnings: true, banned: true, isAdmin: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip: (parsedPage - 1) * parsedSize,
      take: parsedSize
    }),
    prisma.user.count({ where })
  ]);
  res.json(new ApiResponse(200, { data: users, pagination: { page: parsedPage, pageSize: parsedSize, total } }, 'Users'));
});

const toggleBan = asyncHandler(async (req, res) => {
  await assertAdmin(req.user.id);
  const { userId } = req.params;
  const { banned } = req.body;
  if (userId === req.user.id) throw new ApiError(400, 'You cannot ban yourself');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found');

  // Only treat a literal boolean true as "ban". Using Boolean() would make the
  // string "false" ban a user instead of unbanning them.
  const shouldBan = banned === true;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { banned: shouldBan, bannedAt: shouldBan ? new Date() : null }
  });
  res.json(new ApiResponse(200, { id: updated.id, banned: updated.banned }, shouldBan ? 'User banned' : 'User unbanned'));
});

const resetWarnings = asyncHandler(async (req, res) => {
  await assertAdmin(req.user.id);
  const { userId } = req.params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found');
  const updated = await prisma.user.update({ where: { id: userId }, data: { warnings: 0 } });
  res.json(new ApiResponse(200, { id: updated.id, warnings: 0 }, 'Warnings reset'));
});

const listSessions = asyncHandler(async (req, res) => {
  await assertAdmin(req.user.id);
  const sessions = await prisma.session.findMany({
    include: {
      teacher: { select: { name: true, email: true } },
      learner: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  res.json(new ApiResponse(200, sessions, 'Sessions'));
});

const listReports = asyncHandler(async (req, res) => {
  await assertAdmin(req.user.id);
  const reports = await prisma.noShowReport.findMany({
    include: {
      session: {
        include: {
          teacher: { select: { name: true, email: true } },
          learner: { select: { name: true, email: true } },
          skill: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  res.json(new ApiResponse(200, reports, 'No-show reports'));
});

// Admin reviews a no-show report. On approval: apply warning/ban + settle credits
// to the teacher. On rejection: clear the session's no-show flags.
const reviewReport = asyncHandler(async (req, res) => {
  await assertAdmin(req.user.id);
  const { reportId } = req.params;
  const { approve, note } = req.body;

  const report = await prisma.noShowReport.findUnique({ where: { id: reportId } });
  if (!report) throw new ApiError(404, 'Report not found');
  if (report.status !== 'PENDING') throw new ApiError(400, 'Report already reviewed');

  const session = await prisma.session.findUnique({ where: { id: report.sessionId } });

  const result = await prisma.$transaction(async (tx) => {
    const updatedReport = await tx.noShowReport.update({
      where: { id: reportId },
      data: {
        status: approve ? 'APPROVED' : 'REJECTED',
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      }
    });

    if (approve) {
      // Apply warning / ban to the reported user.
      const noShowUser = await tx.user.findUnique({ where: { id: report.reportedUser } });
      const newWarnings = (noShowUser?.warnings ?? 0) + 1;
      const nowBanned = newWarnings >= 2;
      const userUpdate = await tx.user.update({
        where: { id: report.reportedUser },
        data: {
          warnings: newWarnings,
          banned: nowBanned,
          bannedAt: nowBanned ? new Date() : null
        },
        select: { id: true, warnings: true, banned: true }
      });

      // Teacher keeps escrowed credits as compensation; mark session completed.
      if (session && (session.creditsReserved ?? 0) > 0) {
        await tx.user.update({
          where: { id: session.teacherId },
          data: { credits: { increment: session.creditsReserved } }
        });
      }
      await tx.session.update({
        where: { id: report.sessionId },
        data: { status: 'COMPLETED', creditsReserved: 0 }
      });

      // Notify the reported user.
      await tx.notification.create({
        data: {
          userId: report.reportedUser,
          type: 'system',
          title: nowBanned ? 'Account suspended' : 'Warning issued',
          body: nowBanned
            ? 'Your account has been suspended due to repeated no-shows.'
            : 'You received a warning for a missed session. A second no-show results in a suspension.'
        }
      });

      return { report: updatedReport, userUpdate, decision: 'approved' };
    }

    // Reject: clear the session's no-show flags.
    await tx.session.update({
      where: { id: report.sessionId },
      data: { noShowUserId: null, noShowReportedById: null, noShowReportedAt: null }
    });
    await tx.notification.create({
      data: {
        userId: report.reportedUser,
        type: 'system',
        title: 'No-show report dismissed',
        body: 'A no-show report against you was reviewed and dismissed.'
      }
    });
    return { report: updatedReport, decision: 'rejected' };
  });

  res.json(new ApiResponse(200, result, approve ? 'Report approved' : 'Report rejected'));
});

export { getDashboard, listUsers, toggleBan, resetWarnings, listSessions, listReports, reviewReport };
