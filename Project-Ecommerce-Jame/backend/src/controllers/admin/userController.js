const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: {
                select: { products: true }
            }
        },
    });

    console.log(`Admin User Management: Found ${users.length} users`);
    res.json(users);
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { role },
    });

    res.json(user);
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
        res.status(400);
        throw new Error('Cannot delete your own account');
    }

    await prisma.user.delete({
        where: { id: parseInt(id) },
    });

    res.json({ message: 'User deleted' });
};

module.exports = {
    getUsers,
    updateUserRole,
    deleteUser,
};
