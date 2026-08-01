import { User, Skill } from '../models/index.js';
import { sequelize } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Skill }], 
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    res.json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
    const { bio, skillsToTeach, skillsToLearn } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Replace bio + skills atomically so a failure can't wipe data partway.
    const transaction = await sequelize.transaction();
    try {
        if (bio !== undefined) user.bio = bio;
        await user.save({ transaction });

        if (skillsToTeach || skillsToLearn) {
            // Remove old skills
            await Skill.destroy({ where: { userId: user.id }, transaction });

            const newSkills = [];
            if (skillsToTeach && Array.isArray(skillsToTeach)) {
                skillsToTeach.forEach(name => newSkills.push({ userId: user.id, name: name.trim(), type: 'TEACH' }));
            }
            if (skillsToLearn && Array.isArray(skillsToLearn)) {
                skillsToLearn.forEach(name => newSkills.push({ userId: user.id, name: name.trim(), type: 'LEARN' }));
            }
            if (newSkills.length > 0) {
                await Skill.bulkCreate(newSkills, { transaction });
            }
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }

    const updatedUser = await User.findByPk(req.user.id, {
        include: [{ model: Skill }],
         attributes: { exclude: ['password'] }
    });
    
    res.json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const getPublicProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: [{ model: Skill }],
      attributes: ['id', 'name', 'bio', 'avatar', 'credits', 'createdAt']
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.json(new ApiResponse(200, user, "Public profile fetched successfully"));
});

export { getProfile, updateProfile, getPublicProfile };
