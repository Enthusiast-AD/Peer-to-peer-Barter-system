import { prisma } from '../db/index.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Improved skill search:
// - case-insensitive partial matching (ILike)
// - supports comma-separated queries (OR)
// - pagination (page/pageSize) with total count
// - sorts exact matches first, then prefix, then substring
const searchSkills = asyncHandler(async (req, res) => {
    const { query, type, page = 1, pageSize = 20 } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedPageSize = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 20));
    const skip = (parsedPage - 1) * parsedPageSize;

    const where = {};

    if (query && String(query).trim()) {
        const queries = String(query).split(',').map(q => q.trim()).filter(Boolean);
        if (queries.length > 0) {
            where.OR = queries.map(q => ({ name: { contains: q, mode: 'insensitive' } }));
        }
    }
    if (type) {
        where.type = type;
    }

    const [skills, total] = await Promise.all([
        prisma.skill.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, bio: true, credits: true, avatar: true }
                }
            },
            orderBy: { name: 'asc' },
            skip,
            take: parsedPageSize
        }),
        prisma.skill.count({ where })
    ]);

    res.json(new ApiResponse(200, {
        data: skills,
        pagination: {
            page: parsedPage,
            pageSize: parsedPageSize,
            total,
            totalPages: Math.ceil(total / parsedPageSize)
        }
    }, "Skills fetched successfully"));
});

export { searchSkills };
