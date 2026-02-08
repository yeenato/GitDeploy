const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all products (Public with search/filter)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const { search, category, page = 1, limit = 10 } = req.query;

    const where = {
        status: 'available', // Only show available and approved products
    };

    // Add search filter
    if (search) {
        where.OR = [
            { title: { contains: search } },
            { description: { contains: search } },
        ];
    }

    // Add category filter
    if (category) {
        where.categoryId = parseInt(category);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        role: true,
                    },
                },
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
    ]);

    res.json({
        products,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    });
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
            category: true,
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    bio: true,
                    profileImage: true,
                    role: true,
                },
            },
        },
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.json(product);
};

module.exports = {
    getProducts,
    getProduct,
};
