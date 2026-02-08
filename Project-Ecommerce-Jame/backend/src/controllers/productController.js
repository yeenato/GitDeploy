
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
    console.log('--- createProduct Called ---');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const { title, description, categoryId } = req.body;

    if (!title || !description) {
        res.status(400);
        throw new Error('Please add a title and description');
    }

    const allImages = [];
    
    // 1. Handle Cover Image (always first)
    if (req.files && req.files['coverImage']) {
        allImages.push(`/uploads/${req.files['coverImage'][0].filename}`);
    }

    const images = allImages.length > 0 ? JSON.stringify(allImages) : null;
    
    let video = null;
    if (req.files && req.files['video']) {
        video = `/uploads/${req.files['video'][0].filename}`;
    }
    console.log('Images string to save:', images);
    console.log('Video path to save:', video);

    try {
        const product = await prisma.product.create({
            data: {
                title,
                description,
                ownerId: req.user.id,
                status: 'PENDING_APPROVAL',
                images: images,
                video: video,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
            },
        });
        console.log('Product created:', product);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500);
        throw new Error('Server error while creating product');
    }
};

// @desc    Get logged-in user products
// @route   GET /api/products/my-items
// @access  Private
const getMyProducts = async (req, res) => {
    const products = await prisma.product.findMany({
        where: { ownerId: req.user.id },
    });

    res.status(200).json(products);
};

// @desc    Update product details
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
    console.log('--- updateProduct Called ---');
    console.log('Params ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const { title, description, categoryId } = req.body;
    const { id } = req.params;

    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check for ownership or admin role
    if (product.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(401);
        throw new Error('User not authorized');
    }

    let finalImages = [];

    // 1. Handle Cover Image
    // Priority: New Cover File > Existing Cover URL > Keep Old Cover (if nothing specified? No, frontend should be explicit)
    // Actually, if frontend sends 'existingCoverImage', we use it. If 'coverImage' file, we use it.
    
    if (req.files && req.files['coverImage']) {
        // New cover uploaded
        finalImages.push(`/uploads/${req.files['coverImage'][0].filename}`);
    } else if (req.body.existingCoverImage) {
        // Keep existing cover
        finalImages.push(req.body.existingCoverImage);
    } else {
        // Fallback: If neither provided, check if we should keep the original first image?
        // But frontend should handle this. If it's a "replace all" scenario (unlikely now), we might end up with no cover.
        // Let's assume frontend will always send existingCoverImage if it exists and isn't being replaced.
        // If not sent, it means NO cover (or user deleted it).
    }

    const images = finalImages.length > 0 ? JSON.stringify(finalImages) : null;

    let video = product.video;
    if (req.files && req.files['video']) {
        video = `/uploads/${req.files['video'][0].filename}`;
    }
    console.log('Images string to update:', images);
    console.log('Video path to update:', video);

    const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
            title,
            description,
            images,
            video,
            categoryId: categoryId ? parseInt(categoryId) : undefined,
        },
    });

    res.status(200).json(updatedProduct);
};

// @desc    Update product status
// @route   PATCH /api/products/:id/status
// @access  Private
const updateProductStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check for ownership or admin role
    if (product.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Validate status
    const validStatuses = ['available', 'exchanged', 'cancelled'];
    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
            status,
        },
    });

    res.status(200).json(updatedProduct);
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check for ownership or admin role
    if (product.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Set productId to null in messages to avoid FK constraint issues
    await prisma.message.updateMany({
        where: { productId: parseInt(id) },
        data: { productId: null }
    });

    await prisma.product.delete({
        where: { id: parseInt(id) },
    });

    res.status(200).json({ id: parseInt(id) });
};

module.exports = {
    createProduct,
    getMyProducts,
    updateProduct,
    updateProductStatus,
    deleteProduct,
};
