const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get current user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            phoneNumber: true,
            profileImage: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    res.status(200).json(user);
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateMe = async (req, res) => {
    const { name, bio, phoneNumber } = req.body;

    let profileImage = undefined;
    if (req.file) {
        profileImage = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
    }

    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            name,
            bio,
            phoneNumber,
            ...(profileImage && { profileImage }),
        },
        select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            phoneNumber: true,
            profileImage: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    res.status(200).json(user);
};

module.exports = {
    getMe,
    updateMe,
};
