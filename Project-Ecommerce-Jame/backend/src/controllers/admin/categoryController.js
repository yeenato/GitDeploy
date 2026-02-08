const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
const getCategories = async (req, res) => {
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        }
    });
    res.json(categories);
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        res.status(400);
        throw new Error('Please provide name and description');
    }

    const category = await prisma.category.create({
        data: { name, description },
    });

    res.status(201).json(category);
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { name, description },
    });

    res.json(category);
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    await prisma.category.delete({
        where: { id: parseInt(id) },
    });

    res.json({ message: 'Category deleted' });
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
