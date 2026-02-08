const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = async (req, res) => {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                }
            },
            category: true,
        },
    });

    res.json(products);
};

// @desc    Get pending products
// @route   GET /api/admin/products/pending
// @access  Private/Admin
const getPendingProducts = async (req, res) => {
    const products = await prisma.product.findMany({
        where: { status: 'PENDING_APPROVAL' },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                }
            },
            category: true,
        },
    });

    res.json(products);
};

// @desc    Approve product
// @route   PATCH /api/admin/products/:id/approve
// @access  Private/Admin
const approveProduct = async (req, res) => {
    const { id } = req.params;

    const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { status: 'available' },
    });

    res.json(product);
};

// @desc    Reject product
// @route   PATCH /api/admin/products/:id/reject
// @access  Private/Admin
const rejectProduct = async (req, res) => {
    const { id } = req.params;

    const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { status: 'cancelled' },
    });

    res.json(product);
};

module.exports = {
    getAllProducts,
    getPendingProducts,
    approveProduct,
    rejectProduct,
};
