import { prisma } from '../db/index.js';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Change the current user's password (requires the current password).
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new ApiError(404, "User not found");

    // Google-only accounts have no password set.
    if (!user.password) {
        throw new ApiError(400, "This account uses Google sign-in and has no password to change.");
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new ApiError(401, "Current password is incorrect");

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    res.json(new ApiResponse(200, { ok: true }, "Password updated successfully"));
});

const getProfile = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { skills: true },
      omit: { password: true }
    });
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    res.json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
    const { bio, skillsToTeach, skillsToLearn } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Replace bio + skills atomically so a failure can't wipe data partway.
    const updatedUser = await prisma.$transaction(async (tx) => {
        const updated = await tx.user.update({
            where: { id: req.user.id },
            data: { bio }
        });

        if (skillsToTeach || skillsToLearn) {
            await tx.skill.deleteMany({ where: { userId: req.user.id } });

            const newSkills = [];
            if (Array.isArray(skillsToTeach)) {
                skillsToTeach.forEach((raw) => {
                    const name = String(raw).trim();
                    if (name) newSkills.push({ userId: req.user.id, name, type: 'TEACH' });
                });
            }
            if (Array.isArray(skillsToLearn)) {
                skillsToLearn.forEach((raw) => {
                    const name = String(raw).trim();
                    if (name) newSkills.push({ userId: req.user.id, name, type: 'LEARN' });
                });
            }
            if (newSkills.length > 0) {
                await tx.skill.createMany({ data: newSkills });
            }
        }

        return tx.user.findUnique({
            where: { id: req.user.id },
            include: { skills: true },
            omit: { password: true }
        });
    });

    res.json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const getPublicProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        credits: true,
        createdAt: true,
        skills: {
          select: { id: true, name: true, type: true, category: true }
        }
      }
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.json(new ApiResponse(200, user, "Public profile fetched successfully"));
});

export { getProfile, updateProfile, getPublicProfile, changePassword };
