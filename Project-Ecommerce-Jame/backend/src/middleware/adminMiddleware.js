const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('express-async-handler');

const adminOnly = asyncHandler(async (req, res, next) => {
    if (req.user) {
        // Fetch fresh user data from DB to verify role
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { role: true }
        });

        if (user && user.role === 'ADMIN') {
            next();
        } else {
            res.status(403);
            throw new Error('Access denied. Admin only.');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no user found');
    }
});

module.exports = { adminOnly };
